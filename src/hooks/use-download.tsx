import { __ } from '@/lib/i18n';
import uuid from '@/lib/uuid';
import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useRef,
	useState
} from '@wordpress/element';
import useActivation from './use-activation';
import useNotification from './use-notification';

export interface DownloadItem {
	uid: string;
	title?: string;
	image?: string;
	url: string;
	filename: string;
	percentage: number;
	status: 'pending' | 'downloading' | 'completed' | 'error';
	error?: string;
}

interface DownloadContextType {
	downloads: DownloadItem[];
	pendingItems: DownloadItem[];
	completedItems: DownloadItem[];
	activeItems: DownloadItem[];
	addDownloadTask: (url: string, filename: string) => void;
	clearCompleted: () => void;
	removeDownload: (uid: string) => void;
	ping: boolean;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DownloadContext = createContext<DownloadContextType | undefined>(
	undefined
);

const triggerBlobDownload = (blobUrl: string, filename: string) => {
	const link = document.createElement('a');
	link.href = blobUrl;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

const downloadViaLink = (url: string, filename: string) => {
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.style.display = 'none';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};

type DownloadProviderProps = {
	children: React.ReactNode;
};

export function DownloadProvider({ children }: DownloadProviderProps) {
	const [downloads, setDownloads] = useState<DownloadItem[]>([]);
	const [ping, setPing] = useState(false);
	const [open, setOpen] = useState(false);
	const abortControllers = useRef<Map<string, AbortController>>(new Map());
	const { active, activated } = useActivation();
	const notify = useNotification();

	const updateDownload = useCallback(
		(uid: string, updates: Partial<DownloadItem>) => {
			setDownloads((prev) =>
				prev.map((d) => (d.uid === uid ? { ...d, ...updates } : d))
			);
		},
		[]
	);

	const fetchWithProgress = useCallback(
		async (uid: string, url: string, filename: string) => {
			const controller = new AbortController();
			abortControllers.current.set(uid, controller);

			try {
				updateDownload(uid, { status: 'downloading', percentage: 0 });

				const response = await fetch(url, {
					signal: controller.signal,
					mode: 'cors'
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}`);
				}

				const contentLength = response.headers.get('content-length');
				const totalBytes = contentLength
					? parseInt(contentLength, 10)
					: 0;

				if (!response.body) {
					const blob = await response.blob();
					const blobUrl = URL.createObjectURL(blob);
					triggerBlobDownload(blobUrl, filename);
					URL.revokeObjectURL(blobUrl);
					updateDownload(uid, {
						status: 'completed',
						percentage: 100
					});
					return;
				}

				const reader = response.body.getReader();
				const chunks: Uint8Array[] = [];
				let receivedBytes = 0;

				for (;;) {
					const { done, value } = await reader.read();
					if (done) break;

					chunks.push(new Uint8Array(value));
					receivedBytes += value.length;

					if (totalBytes > 0) {
						const percentage = Math.round(
							(receivedBytes / totalBytes) * 100
						);
						updateDownload(uid, { percentage });
					} else {
						updateDownload(uid, {
							percentage: Math.min(
								95,
								Math.round(receivedBytes / 1024)
							)
						});
					}
				}

				const totalLength = chunks.reduce(
					(acc, chunk) => acc + chunk.length,
					0
				);
				const merged = new Uint8Array(totalLength);
				let offset = 0;
				for (const chunk of chunks) {
					merged.set(chunk, offset);
					offset += chunk.length;
				}
				const blob = new Blob([merged.buffer as ArrayBuffer]);
				const blobUrl = URL.createObjectURL(blob);
				triggerBlobDownload(blobUrl, filename);

				setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);

				updateDownload(uid, { status: 'completed', percentage: 100 });
			} catch (error) {
				if (
					error instanceof DOMException &&
					error.name === 'AbortError'
				) {
					updateDownload(uid, {
						status: 'error',
						error: __('Download cancelled')
					});
					return;
				}

				console.warn(
					`Fetch download failed for "${filename}", falling back to link download:`,
					error
				);
				downloadViaLink(url, filename);
				updateDownload(uid, { status: 'completed', percentage: 100 });
			} finally {
				abortControllers.current.delete(uid);
			}
		},
		[updateDownload]
	);

	const addDownloadTask = useCallback(
		(url: string, filename: string) => {
			if (!activated) {
				notify.error(__('License not activated'));
				return;
			}
			if (!active) {
				notify.error(__('License suspended'));
				return;
			}

			const taskUid = uuid();
			setDownloads((prev) => [
				...prev,
				{
					uid: taskUid,
					url,
					filename,
					percentage: 0,
					status: 'pending'
				}
			]);
			setPing(true);
			setOpen(true);
			setTimeout(() => setPing(false), 5000);

			fetchWithProgress(taskUid, url, filename);
		},
		[activated, active, fetchWithProgress, notify]
	);

	const clearCompleted = useCallback(() => {
		setDownloads((prev) =>
			prev.filter((d) => d.status !== 'completed' && d.status !== 'error')
		);
	}, []);

	const removeDownload = useCallback((uid: string) => {
		const controller = abortControllers.current.get(uid);
		if (controller) {
			controller.abort();
			abortControllers.current.delete(uid);
		}
		setDownloads((prev) => prev.filter((d) => d.uid !== uid));
	}, []);

	const contextValue = useMemo(
		() => ({
			downloads,
			pendingItems: downloads.filter((i) => i.status === 'pending'),
			completedItems: downloads.filter((i) => i.status === 'completed'),
			activeItems: downloads.filter(
				(i) => i.status === 'downloading' || i.status === 'pending'
			),
			addDownloadTask,
			clearCompleted,
			removeDownload,
			ping,
			open,
			setOpen
		}),
		[downloads, addDownloadTask, clearCompleted, removeDownload, ping, open]
	);

	return (
		<DownloadContext.Provider value={contextValue}>
			{children}
		</DownloadContext.Provider>
	);
}

export default function useDownload() {
	const context = useContext(DownloadContext);
	if (!context) {
		throw new Error('useDownload must be used within a DownloadProvider');
	}
	return context;
}
