import InstallButton from '@/components/install-button';
import Paging from '@/components/paging';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import useApiFetch from '@/hooks/use-api-fetch';
import useInstall from '@/hooks/use-install';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useParams } from '@/router';
import { TPostChangelogCollection, TPostItem, TPostMedia } from '@/types/item';
import { Clock } from 'lucide-react';
import moment from 'moment';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';

type Props = {
	item: TPostItem;
};

const pageSchema = z.number().gte(1);

function formatFileSize(bytes: number): string {
	if (!bytes) return '';
	if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`;
	if (bytes >= 1_024) return `${(bytes / 1_024).toFixed(0)} KB`;
	return `${bytes} B`;
}

function VersionEntry({
	item,
	media,
	isLatest,
	isLast
}: {
	item: TPostItem;
	media: TPostMedia;
	isLatest: boolean;
	isLast: boolean;
}) {
	const { isInstalled } = useInstall();
	const installed = isInstalled(item);
	const isInstalledVersion =
		installed && installed.installed_version === media.version;
	const updatedMoment = moment.unix(media.updated);
	const relativeTime = updatedMoment.fromNow();
	const exactDate = updatedMoment.format('MMMM D, YYYY [at] h:mm A');
	const fileSize = formatFileSize(media.size);

	return (
		<div className="group relative flex gap-4">
			{/* Timeline connector */}
			{!isLast && (
				<div className="bg-border group-hover:bg-border/80 absolute top-7 bottom-0 left-2.75 w-px transition-colors" />
			)}

			{/* Timeline dot */}
			<div className="relative z-10 mt-1 shrink-0">
				<div
					className={cn(
						'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
						isLatest
							? 'border-primary bg-primary/10 shadow-primary/20 shadow-sm'
							: 'border-border bg-background group-hover:border-muted-foreground/40'
					)}
				>
					{isLatest ? (
						<div className="bg-primary h-2 w-2 animate-pulse rounded-full" />
					) : (
						<div className="bg-muted-foreground/30 group-hover:bg-muted-foreground/50 h-1.5 w-1.5 rounded-full transition-colors" />
					)}
				</div>
			</div>

			{/* Row content */}
			<div
				className={cn(
					'mb-4 flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors',
					isLatest
						? 'border-primary/20 bg-primary/5'
						: 'bg-muted/30 group-hover:border-border group-hover:bg-muted/50 border-transparent'
				)}
			>
				<div className="flex min-w-0 flex-col gap-1.5">
					<div className="flex flex-wrap items-center gap-2">
						{/* Version tag */}
						<code className="bg-muted rounded px-1.5 py-0.5 font-mono text-sm leading-none font-semibold tracking-tight">
							{media.version}
						</code>
						{isLatest && (
							<Badge
								variant="default"
								size="sm"
							>
								{__('Latest')}
							</Badge>
						)}
						{isInstalledVersion && (
							<Badge
								variant="info"
								size="sm"
							>
								{__('Installed')}
							</Badge>
						)}
					</div>
					<div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
						<TooltipProvider>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className="cursor-default underline decoration-dotted underline-offset-2">
										{relativeTime}
									</span>
								</TooltipTrigger>
								<TooltipContent>{exactDate}</TooltipContent>
							</Tooltip>
						</TooltipProvider>
						{fileSize && (
							<>
								<span aria-hidden>·</span>
								<span>{fileSize}</span>
							</>
						)}
					</div>
				</div>
				<div className="shrink-0">
					<InstallButton
						item={item}
						media={media}
						size="sm"
						variant={isLatest ? 'default' : 'outline'}
					/>
				</div>
			</div>
		</div>
	);
}

export default function ItemChangeLog({ item }: Props) {
	const params = useParams('/item/:slug/detail/:id/:tab?');
	const [searchParams] = useSearchParams();
	const page = pageSchema.parse(Number(searchParams?.get('page') ?? 1));
	const { data, isLoading, isFetching } =
		useApiFetch<TPostChangelogCollection>(API.item.changelog, {
			item_id: params.id,
			page
		});

	const entries = data?.data ?? [];
	const total = data?.meta?.total;

	return (
		<div className="flex flex-col gap-5 max-md:order-4 sm:gap-7">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between border-b p-5 sm:p-7">
					<span>{__('Version History')}</span>
					{total != null && total > 0 && (
						<span className="bg-muted/50 text-muted-foreground rounded-full border px-2.5 py-0.5 text-xs font-medium tabular-nums">
							{total === 1
								? __('1 version')
								: `${total} ${__('versions')}`}
						</span>
					)}
				</CardHeader>
				<CardContent className="p-5 text-sm sm:p-7">
					{entries.length > 0 ? (
						<div className="flex flex-col">
							{entries.map((media, index) => (
								<VersionEntry
									key={media.id}
									item={item}
									media={media}
									isLatest={index === 0 && page === 1}
									isLast={
										index === entries.length - 1 &&
										!data?.meta?.next_page_url
									}
								/>
							))}
							{data?.meta && Number(data.meta.last_page) > 1 && (
								<Paging
									currentPage={page}
									totalPages={Number(data.meta.last_page)}
									urlGenerator={(_page: number) =>
										`/item/${params.slug}/detail/${params.id}?page=${_page}`
									}
								/>
							)}
						</div>
					) : isLoading || isFetching ? (
						<div className="flex flex-col gap-4">
							{[28, 20, 24].map((w, i) => (
								<div
									key={i}
									className="flex gap-4"
								>
									<Skeleton className="mt-1 h-6 w-6 shrink-0 rounded-full" />
									<div className="bg-muted/30 flex flex-1 items-center justify-between gap-3 rounded-lg border border-transparent px-4 py-3">
										<div className="flex flex-col gap-2">
											<Skeleton
												className={`h-4 w-${w}`}
											/>
											<Skeleton className="h-3 w-32" />
										</div>
										<Skeleton className="h-8 w-20 shrink-0 rounded-md" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-muted-foreground flex flex-col items-center gap-3 py-8 text-center">
							<Clock className="h-8 w-8 opacity-30" />
							<p className="text-sm">
								{__('Version history is not available yet.')}
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
