import uuid from '@/lib/uuid';
import {
	createContext,
	useCallback,
	useContext,
	useRef,
	useState
} from '@wordpress/element';

export type NotificationStatus = 'loading' | 'success' | 'error' | 'info';

export interface NotificationItem {
	uid: string;
	title: string;
	description?: string;
	status: NotificationStatus;
	createdAt: number;
}

interface NotifyPromiseOptions<T> {
	description?: string;
	loading: string;
	success: string | ((data: T) => string);
	error: string | ((err: unknown) => string);
	finally?: () => void;
}

interface NotificationContextType {
	notifications: NotificationItem[];
	activeItems: NotificationItem[];
	completedItems: NotificationItem[];
	add: (
		title: string,
		status: NotificationStatus,
		description?: string
	) => string;
	update: (uid: string, updates: Partial<NotificationItem>) => void;
	remove: (uid: string) => void;
	clearCompleted: () => void;
	promise: <T>(promise: Promise<T>, options: NotifyPromiseOptions<T>) => void;
	error: (title: string, description?: string) => string;
	success: (title: string, description?: string) => string;
	info: (title: string, description?: string) => string;
	open: boolean;
	setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined
);

const AUTO_DISMISS_MS = 5000;

type NotificationProviderProps = {
	children: React.ReactNode;
};

export function NotificationProvider({ children }: NotificationProviderProps) {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [open, setOpen] = useState(false);
	const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
		new Map()
	);

	const scheduleAutoDismiss = useCallback((uid: string) => {
		const timer = setTimeout(() => {
			setNotifications((prev) => prev.filter((n) => n.uid !== uid));
			timers.current.delete(uid);
		}, AUTO_DISMISS_MS);
		timers.current.set(uid, timer);
	}, []);

	const add = useCallback(
		(title: string, status: NotificationStatus, description?: string) => {
			const uid = uuid();
			setNotifications((prev) => [
				{
					uid,
					title,
					description,
					status,
					createdAt: Date.now()
				},
				...prev
			]);
			setOpen(true);

			if (status === 'success' || status === 'info') {
				scheduleAutoDismiss(uid);
			}

			return uid;
		},
		[scheduleAutoDismiss]
	);

	const update = useCallback(
		(uid: string, updates: Partial<NotificationItem>) => {
			setNotifications((prev) =>
				prev.map((n) => (n.uid === uid ? { ...n, ...updates } : n))
			);

			if (updates.status === 'success' || updates.status === 'info') {
				const existingTimer = timers.current.get(uid);
				if (existingTimer) clearTimeout(existingTimer);
				scheduleAutoDismiss(uid);
			}
		},
		[scheduleAutoDismiss]
	);

	const remove = useCallback((uid: string) => {
		const timer = timers.current.get(uid);
		if (timer) {
			clearTimeout(timer);
			timers.current.delete(uid);
		}
		setNotifications((prev) => prev.filter((n) => n.uid !== uid));
	}, []);

	const clearCompleted = useCallback(() => {
		setNotifications((prev) => prev.filter((n) => n.status === 'loading'));
		timers.current.forEach((timer) => clearTimeout(timer));
		timers.current.clear();
	}, []);

	const promise = useCallback(
		<T,>(p: Promise<T>, options: NotifyPromiseOptions<T>) => {
			const uid = add(options.loading, 'loading', options.description);

			p.then((data) => {
				const title =
					typeof options.success === 'function'
						? options.success(data)
						: options.success;
				update(uid, { title, status: 'success' });
			})
				.catch((err) => {
					const title =
						typeof options.error === 'function'
							? options.error(err)
							: options.error;
					update(uid, { title, status: 'error' });
				})
				.finally(() => {
					options.finally?.();
				});
		},
		[add, update]
	);

	const error = useCallback(
		(title: string, description?: string) =>
			add(title, 'error', description),
		[add]
	);

	const success = useCallback(
		(title: string, description?: string) =>
			add(title, 'success', description),
		[add]
	);

	const info = useCallback(
		(title: string, description?: string) =>
			add(title, 'info', description),
		[add]
	);

	const activeItems = notifications.filter((n) => n.status === 'loading');
	const completedItems = notifications.filter((n) => n.status !== 'loading');

	return (
		<NotificationContext.Provider
			value={{
				notifications,
				activeItems,
				completedItems,
				add,
				update,
				remove,
				clearCompleted,
				promise,
				error,
				success,
				info,
				open,
				setOpen
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
}

export default function useNotification() {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			'useNotification must be used within a NotificationProvider'
		);
	}
	return context;
}
