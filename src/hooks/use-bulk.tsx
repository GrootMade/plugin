import { claimAfterDelay } from '@/lib/download-delay';
import { __ } from '@/lib/i18n';
import { TApiError } from '@/types/api';
import { EnumItemType } from '@/zod/item';
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState
} from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { z } from 'zod';
import useActivation from './use-activation';
import useApiMutation from './use-api-mutation';
import useDownload from './use-download';
import { PluginInstallResponse, PluginInstallSchema } from './use-install';
import useInstalled from './use-is-installed';
import useNotification from './use-notification';
import useTaskQueue from './use-task-queue';

type PackDownloadLink = {
	item_id: number;
	title: string;
	link: string;
	version: string;
	slug: string;
	filename: string;
};

type PackDownloadError = {
	item_id: number;
	title: string;
	message: string;
};

type PackDownloadResponse = {
	result: string;
	pack: string;
	total_items: number;
	downloaded: number;
	skipped: number;
	consumed_credit: number;
	links: PackDownloadLink[];
	errors: PackDownloadError[];
};

type PackDownloadRequest = {
	item_ids: number[];
	pack_name?: string;
};
type BulkProviderProps = {
	children: React.ReactNode;
	storageKey?: string;
};
const itemSchema = z.object({
	id: z.coerce.number(),
	title: z.string(),
	version: z.string(),
	type: EnumItemType,
	image: z.string().nullable().optional()
});
export type BulkItemType = z.infer<typeof itemSchema>;
const itemsSchema = z.array(itemSchema);
type BulkProviderState = {
	items: z.infer<typeof itemSchema>[];
	install: () => void;
	download: () => void;
	addItem: (item: BulkItemType) => void;
	removeItem: (item_id: number | string) => void;
	clearItems: () => void;
	hasItem: (item_id: number | string) => boolean;
};
const BulkProviderContext = createContext<BulkProviderState>({
	items: [],
	install: () => {},
	download: () => {},
	addItem: () => {},
	removeItem: () => {},
	clearItems: () => {},
	hasItem: () => {
		return false;
	}
});
export function BulkProvider({
	children,
	storageKey = 'bulk_items',
	...props
}: BulkProviderProps) {
	const { addDownloadTask } = useDownload();
	const notify = useNotification();
	const [items, setItems] = useState<BulkItemType[]>(() => {
		const initialState = itemsSchema.safeParse(
			JSON.parse(localStorage.getItem(storageKey) ?? '[]')
		);
		if (initialState.success) {
			return initialState.data;
		}
		return [];
	});
	const { addTask: addQueueTask } = useTaskQueue();
	const { clearCache, list } = useInstalled();
	const { active, activated, can_bulk_download, can_bulk_install } =
		useActivation();
	const { mutateAsync: installAsync } = useApiMutation<
		PluginInstallResponse,
		PluginInstallSchema
	>('item/install');
	const { mutateAsync: packDownloadAsync } = useApiMutation<
		PackDownloadResponse,
		PackDownloadRequest
	>('pack/download');
	useEffect(() => {
		const parsed = itemsSchema.safeParse(items);
		if (parsed.success) {
			localStorage.setItem(storageKey, JSON.stringify(parsed.data));
		}
	}, [items, storageKey]);
	const addItem = (item: BulkItemType) => {
		if (!activated) {
			notify.error(
				__('License not activated'),
				decodeEntities(item.title)
			);
			return;
		}
		if (!active) {
			notify.error(__('License suspended'), decodeEntities(item.title));
			return;
		}
		notify.success(__('Added To Cart'), decodeEntities(item.title));
		setItems((prev) => [...prev.filter((i) => i.id != item.id), item]);
	};
	const removeItem = (item_id: number | string) => {
		const item = items.find((i) => i.id === Number(item_id));
		if (item) {
			notify.info(__('Removed From Cart'), decodeEntities(item.title));
			setItems((prev) => prev?.filter((i) => i.id != item.id));
		}
	};
	const hasItem = useCallback(
		(item_id: number | string) => {
			return items?.filter((i) => i.id === Number(item_id)).length > 0;
		},
		[items]
	);
	const clearItems = () => {
		notify.info(__('Cart Cleared'));
		setItems(() => []);
	};

	const download = () => {
		if (!can_bulk_download) {
			notify.error(__('Bulk download not allowed'));
			return;
		}
		const item_ids = items.map((item) => item.id);
		notify.promise(packDownloadAsync({ item_ids }), {
			loading: __('Downloading Pack'),
			description: `${items.length} ${__('items')}`,
			success(data) {
				for (const link of data.links) {
					addDownloadTask(link.link, link.filename);
				}
				const downloadedIds = new Set(data.links.map((l) => l.item_id));
				setItems((prev) =>
					prev.filter((i) => !downloadedIds.has(i.id))
				);
				for (const err of data.errors) {
					notify.error(err.title, err.message);
				}
				clearCache();
				if (data.downloaded > 0 && data.skipped === 0) {
					return `${data.downloaded} ${__('items added to queue')}`;
				}
				if (data.downloaded > 0 && data.skipped > 0) {
					return `${data.downloaded} ${__('downloaded')}, ${data.skipped} ${__('skipped')}`;
				}
				return __('No items could be downloaded');
			},
			error(err: TApiError) {
				return err.message ?? __('Error');
			},
			finally() {
				clearCache();
			}
		});
	};
	const install = () => {
		if (!can_bulk_install) {
			notify.error(__('Bulk install not allowed'));
			return;
		}
		items.forEach((item) => {
			addQueueTask(() => {
				return new Promise((resolve, reject) => {
					const isInstalled = list?.find(
						(i) => Number(i.id) === Number(item.id)
					);
					const method = isInstalled ? 'update' : 'install';
					notify.promise(
						installAsync({
							item_id: item.id,
							method
						}).then(async (data) => {
							if (
								data.type === 'delay' &&
								data.delay_token &&
								data.delay_seconds
							) {
								const claimed = await claimAfterDelay(
									data.delay_token,
									data.delay_seconds,
									method,
									item.id
								);
								return { ...data, ...claimed };
							}
							return data;
						}),
						{
							description: item.title,
							loading: isInstalled
								? __('Updating')
								: __('Installing'),
							success(data) {
								resolve(data);
								removeItem(item.id);
								return __('Success');
							},
							error(err: TApiError) {
								reject(err);
								return err.message ?? __('Error');
							},
							finally() {
								clearCache();
							}
						}
					);
				});
			});
		});
	};
	const value = {
		items,
		install,
		download,
		addItem,
		removeItem,
		clearItems,
		hasItem
	};
	return (
		<BulkProviderContext.Provider
			{...props}
			value={value}
		>
			{children}
		</BulkProviderContext.Provider>
	);
}
export default function useBulk() {
	const context = useContext(BulkProviderContext);
	if (context === undefined) {
		throw new Error('useBulk must be used within a BulkProvider');
	}
	return context;
}
