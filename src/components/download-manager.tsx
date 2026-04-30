import useDownload, { type DownloadItem } from '@/hooks/use-download';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useState } from '@wordpress/element';
import {
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Download,
	X,
	XCircle
} from 'lucide-react';
import ActionLoader from './ui/action-loader';
import { Button } from './ui/button';

function DownloadItemRow({ item }: { item: DownloadItem }) {
	const { removeDownload } = useDownload();

	return (
		<div className="flex items-center gap-3 px-3 py-2">
			<div className="shrink-0">
				{item.status === 'completed' && (
					<CheckCircle className="text-success size-4" />
				)}
				{item.status === 'error' && (
					<XCircle className="text-destructive size-4" />
				)}
				{(item.status === 'downloading' ||
					item.status === 'pending') && <ActionLoader />}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-sm font-medium">{item.filename}</p>

				{(item.status === 'downloading' ||
					item.status === 'pending') && (
					<div className="mt-1 flex items-center gap-2">
						<div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
							<div
								className="bg-primary h-full rounded-full transition-all duration-300 ease-out"
								style={{
									width: `${item.percentage}%`
								}}
							/>
						</div>
						<span className="text-muted-foreground shrink-0 text-xs tabular-nums">
							{item.percentage}%
						</span>
					</div>
				)}

				{item.status === 'error' && (
					<p className="text-destructive text-xs">
						{item.error || __('Download failed')}
					</p>
				)}
			</div>

			<Button
				size="sm"
				variant="ghost"
				className="text-muted-foreground hover:text-foreground h-auto shrink-0 p-1"
				onClick={() => removeDownload(item.uid)}
			>
				<X className="size-3.5" />
			</Button>
		</div>
	);
}

export default function DownloadManager() {
	const {
		downloads,
		activeItems,
		completedItems,
		clearCompleted,
		open,
		setOpen
	} = useDownload();
	const [collapsed, setCollapsed] = useState(false);

	if (!open || downloads.length === 0) return null;

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
					<Download className="size-4" />
					<span className="text-sm font-medium">
						{hasActive
							? `${__('Downloading')} ${activeItems.length} ${activeItems.length > 1 ? __('files') : __('file')}...`
							: __('Downloads')}
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
					<div className="divide-border max-h-72 divide-y overflow-y-auto">
						{downloads.map((item) => (
							<DownloadItemRow
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
