import { siteConfig } from '@/config/site';
import useActivation from '@/hooks/use-activation';
import useNotification, {
	type NotificationItem
} from '@/hooks/use-notification';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useState } from '@wordpress/element';
import {
	ArrowUpRight,
	Bell,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	CrownIcon,
	Info,
	X,
	XCircle
} from 'lucide-react';
import ActionLoader from './ui/action-loader';
import { Button } from './ui/button';

function NotificationItemRow({ item }: { item: NotificationItem }) {
	const { remove } = useNotification();
	const isLoading = item.status === 'loading';

	return (
		<div
			className={cn(
				'relative flex items-center gap-3 px-3 py-2',
				isLoading && 'bg-primary/5'
			)}
		>
			<div className="shrink-0">
				{item.status === 'success' && (
					<CheckCircle className="size-4 text-green-500" />
				)}
				{item.status === 'error' && (
					<XCircle className="text-destructive size-4" />
				)}
				{item.status === 'loading' && <ActionLoader showPulse={true} />}
				{item.status === 'info' && (
					<Info className="size-4 text-blue-500" />
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{item.title}</p>
				{item.description && (
					<p className="text-muted-foreground truncate text-xs">
						{item.description}
					</p>
				)}
			</div>

			<Button
				size="sm"
				variant="ghost"
				className="text-muted-foreground hover:text-foreground h-auto shrink-0 p-1"
				onClick={() => remove(item.uid)}
			>
				<X className="size-3.5" />
			</Button>
			{isLoading && (
				<div className="bg-primary/10 pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden">
					<div className="bg-primary/60 h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite]" />
				</div>
			)}
		</div>
	);
}

function NotificationUpgradeBanner() {
	const { data, activated, active } = useActivation();
	const delaySeconds = data?.download_delay_seconds ?? 0;

	if (!activated || !active || delaySeconds <= 0) return null;

	return (
		<a
			href={`${siteConfig.provider}/pricing`}
			target="_blank"
			rel="noopener noreferrer"
			className="bg-warning/10 hover:bg-warning/15 flex items-center gap-2 border-b px-3 py-2 no-underline transition-colors"
		>
			<CrownIcon className="text-warning size-3.5 shrink-0" />
			<span className="text-muted-foreground flex-1 text-xs">
				<strong className="text-foreground font-medium">
					{__('Skip the wait')}
				</strong>
				{' — '}
				{__('Upgrade to remove download delays.')}
			</span>
			<ArrowUpRight className="text-muted-foreground size-3 shrink-0" />
		</a>
	);
}

export default function NotificationManager() {
	const {
		notifications,
		activeItems,
		completedItems,
		clearCompleted,
		open,
		setOpen
	} = useNotification();
	const [collapsed, setCollapsed] = useState(false);

	if (!open || notifications.length === 0) return null;

	const hasActive = activeItems.length > 0;

	return (
		<div
			className={cn(
				'bg-background fixed right-4 bottom-4 z-50 w-80 overflow-hidden rounded-lg border shadow-lg',
				'animate-in slide-in-from-bottom-4 fade-in duration-300'
			)}
		>
			{/* Header */}
			<div className="bg-muted/50 flex items-center justify-between border-b px-3 py-2">
				<div className="flex items-center gap-2">
					<Bell className="size-4" />
					<span className="text-sm font-medium">
						{hasActive
							? `${activeItems.length} ${activeItems.length > 1 ? __('tasks') : __('task')} ${__('in progress')}...`
							: __('Notifications')}
					</span>
				</div>
				<div className="flex items-center gap-1">
					<Button
						size="sm"
						variant="ghost"
						className="h-auto p-1"
						onClick={() => setCollapsed((c) => !c)}
					>
						{collapsed ? (
							<ChevronUp className="size-4" />
						) : (
							<ChevronDown className="size-4" />
						)}
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-auto p-1"
						onClick={() => setOpen(false)}
					>
						<X className="size-4" />
					</Button>
				</div>
			</div>

			{/* Items */}
			{!collapsed && (
				<>
					{hasActive && <NotificationUpgradeBanner />}
					<div className="divide-border max-h-72 divide-y overflow-y-auto">
						{notifications.map((item) => (
							<NotificationItemRow
								key={item.uid}
								item={item}
							/>
						))}
					</div>

					{completedItems.length > 0 && (
						<div className="border-border border-t px-3 py-2">
							<Button
								size="sm"
								variant="ghost"
								className="text-muted-foreground text-xs"
								onClick={clearCompleted}
							>
								{__('Clear completed')}
							</Button>
						</div>
					)}
				</>
			)}
		</div>
	);
}
