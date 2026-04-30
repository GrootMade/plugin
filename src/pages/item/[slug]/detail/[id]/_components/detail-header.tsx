import BulkButton from '@/components/bulk-button';
import CollectionButton from '@/components/collection-button';
import DownloadButton from '@/components/download-button';
import InstallButton from '@/components/install-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useActivation from '@/hooks/use-activation';
import { __ } from '@/lib/i18n';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { Eye, LayoutTemplate, LifeBuoy, Paintbrush, Plug } from 'lucide-react';
import ItemRequestUpdate from './item-request-update';

export function ItemDetailHeaderSkeleton() {
	return (
		<div className="flex flex-col gap-7 lg:gap-10">
			<div className="bg-background/80 flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:gap-3">
				<div className="flex min-w-0 flex-1 items-center gap-3">
					<Skeleton className="size-8 rounded-md" />
					<Skeleton className="h-5 w-52" />
					<Skeleton className="ml-2 hidden h-5 w-16 rounded-full sm:block" />
				</div>
				<Skeleton className="h-9 w-full sm:w-64" />
			</div>

			{/* Content + sidebar skeleton */}
			<div className="grid gap-7 md:grid-cols-3 lg:gap-10">
				<div className="flex flex-col gap-5 sm:gap-7 md:col-span-2">
					<Card>
						<CardHeader className="border-b p-5 sm:p-7">
							<Skeleton className="h-4 w-28" />
						</CardHeader>
						<CardContent className="space-y-3 p-5 sm:p-7">
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-4/5" />
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-2/3" />
						</CardContent>
					</Card>
				</div>
				<div className="flex flex-col gap-5 sm:gap-7 md:col-span-1">
					<div className="rounded-lg border p-5">
						<ul className="space-y-2">
							{Array.from({ length: 6 }).map((_, i) => (
								<li
									key={i}
									className="flex items-center gap-3 py-1"
								>
									<Skeleton className="size-4 rounded" />
									<Skeleton className="h-3 w-20" />
									<hr className="min-w-2 flex-1" />
									<Skeleton className="h-3 w-16" />
								</li>
							))}
						</ul>
					</div>
					<div className="rounded-lg border p-5">
						<div className="space-y-3">
							<Skeleton className="h-2 w-full rounded-full" />
							<ul className="space-y-2">
								{Array.from({ length: 4 }).map((_, i) => (
									<li
										key={i}
										className="flex items-center gap-3 py-1"
									>
										<Skeleton className="size-4 rounded" />
										<Skeleton className="h-3 w-24" />
										<hr className="min-w-2 flex-1" />
										<Skeleton className="h-3 w-12" />
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function TypeIcon({ type }: { type: string }) {
	const Icon =
		type === 'plugin'
			? Plug
			: type === 'theme'
				? Paintbrush
				: LayoutTemplate;

	return (
		<div className="bg-accent flex size-8 shrink-0 items-center justify-center rounded-md border p-1.5">
			<Icon className="text-muted-foreground size-full" />
		</div>
	);
}

type Props = {
	item: TPostItem;
};
export default function ItemDetailHeader({ item }: Props) {
	const { activated, active } = useActivation();
	const isRequest = item.type === 'request';

	return (
		<div className="bg-background/80 sticky top-0 z-10 flex flex-col gap-3 rounded-lg border p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-4">
			<div className="flex min-w-0 flex-1 items-center gap-3">
				<TypeIcon type={item.type} />
				<h1 className="truncate text-lg leading-tight font-semibold">
					{decodeEntities(item.title)}
				</h1>
				{item.version && !isRequest && (
					<Badge
						variant="secondary"
						className="shrink-0 font-mono text-xs"
					>
						v{item.version}
					</Badge>
				)}
			</div>

			{!isRequest && (
				<ButtonGroup className="shrink-0">
					<InstallButton
						item={item}
						variant="default"
						size="sm"
						className="min-w-0 flex-1 sm:flex-initial"
					/>
					<DownloadButton
						item={item}
						variant="secondary"
						size="sm"
					/>
					<BulkButton
						item={item}
						size="sm"
					/>
					<CollectionButton
						item={item}
						size="sm"
					/>
					{item.product_url && item.product_url.length > 0 && (
						<Button
							variant="secondary"
							size="sm"
							asChild
						>
							<a
								href={item.product_url}
								target="_blank"
								rel="noreferrer"
								title={__('View Original Product Page')}
							>
								<Eye className="h-4 w-4" />
							</a>
						</Button>
					)}
					{item.topic_id && item.topic_id > 0 && (
						<Button
							variant="secondary"
							size="sm"
							asChild
						>
							<a
								href={`https://meta.grootmade.com/t/${item.topic_id}`}
								target="_blank"
								rel="noreferrer"
								title={__('View Support Topic')}
							>
								<LifeBuoy className="h-4 w-4" />
							</a>
						</Button>
					)}
					{activated && active && (
						<ItemRequestUpdate
							item={item}
							variant="secondary"
							size="sm"
						/>
					)}
				</ButtonGroup>
			)}
		</div>
	);
}
