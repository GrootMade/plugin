import BulkButton from '@/components/bulk-button';
import CollectionButton from '@/components/collection-button';
import DownloadButton from '@/components/download-button';
import InstallButton from '@/components/install-button';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Skeleton } from '@/components/ui/skeleton';
import { archiveItemCoverSrc } from '@/lib/archive-item-cover';
import { __ } from '@/lib/i18n';
import { TypeToItemType } from '@/lib/type-to-slug';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import {
	CalendarIcon,
	Download,
	EyeIcon,
	GitFork,
	PackageIcon,
	UserIcon
} from 'lucide-react';
import millify from 'millify';
import moment from 'moment';
import { Link } from 'react-router-dom';

const cardClass =
	'group relative flex w-full flex-col gap-4 rounded-xl border border-border/80 bg-background p-4 text-foreground shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-ring/70 hover:shadow-md sm:p-5';

export function PostGridItemSkeleton() {
	return (
		<div className={`${cardClass} items-stretch select-none`}>
			<div className="-mx-4 -mt-4 mb-0 w-[calc(100%+2rem)] overflow-hidden rounded-t-xl sm:-mx-5 sm:-mt-5 sm:w-[calc(100%+2.5rem)]">
				<Skeleton className="aspect-video w-full rounded-none" />
			</div>
			<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
				<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
				<div className="w-2/3 text-base font-semibold">
					<Skeleton className="h-5 w-full" />
				</div>
			</div>
			<ul className="mt-auto w-full text-xs">
				<li className="flex items-center gap-3 py-1">
					<Skeleton className="h-4 w-16" />
					<hr className="min-w-2 flex-1" />
					<Skeleton className="h-4 w-12" />
				</li>
				<li className="flex items-center gap-3 py-1">
					<Skeleton className="h-4 w-16" />
					<hr className="min-w-2 flex-1" />
					<Skeleton className="h-4 w-14" />
				</li>
				<li className="flex items-center gap-3 py-1">
					<Skeleton className="h-4 w-16" />
					<hr className="min-w-2 flex-1" />
					<Skeleton className="h-4 w-20" />
				</li>
			</ul>
		</div>
	);
}

type Props = {
	item: TPostItem;
	style?: React.CSSProperties;
};

export default function PostGridItem({ item, style }: Props) {
	const item_type = TypeToItemType(item.type);
	const detailUrl = `/item/${item_type?.slug}/detail/${item.id}`;
	const authorTerm =
		item.terms?.find((t) => t.taxonomy === 'fv_item_author') ||
		item.terms?.find((t) => t.taxonomy === 'original_author_tax') ||
		null;
	const authorName = authorTerm?.name
		? decodeEntities(authorTerm.name)
		: item.author
			? decodeEntities(item.author)
			: __('Unknown author');

	const updatedAt = item.updated ? moment.unix(item.updated).fromNow() : '—';

	const coverSrc = archiveItemCoverSrc(item);

	const insights = [
		{
			label: __('Version'),
			value: item.version || '—',
			icon: <PackageIcon />
		},
		{
			label: __('Author'),
			value: authorName,
			icon: <UserIcon />
		},
		{ label: __('Updated'), value: updatedAt, icon: <CalendarIcon /> },
		...(item.download_count != null && item.download_count > 0
			? [
					{
						label: __('Downloads'),
						value: millify(item.download_count),
						icon: <Download />
					}
				]
			: [])
	];

	return (
		<div
			className={cardClass}
			style={style}
		>
			<Link
				to={detailUrl}
				className="text-card-foreground contents no-underline"
			>
				<div className="-mx-4 -mt-4 mb-0 w-[calc(100%+2rem)] overflow-hidden rounded-t-xl sm:-mx-5 sm:-mt-5 sm:w-[calc(100%+2.5rem)]">
					<img
						src={coverSrc}
						alt={decodeEntities(item.title)}
						className="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
						loading="lazy"
					/>
				</div>
				<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-base font-semibold tracking-tight">
							{decodeEntities(item.title)}
						</h3>
						{item.original_title &&
							item.original_title !== item.title && (
								<span className="text-muted-foreground flex items-center gap-1 text-xs">
									<GitFork className="h-3 w-3 shrink-0" />
									<span className="truncate">
										{item.original_title}
									</span>
								</span>
							)}
					</div>
				</div>

				<div className="flex w-full flex-1 flex-col">
					<ul className="border-border/60 mt-auto w-full rounded-md border p-2 text-xs sm:p-2.5">
						{insights.map(({ label, value, icon }) => (
							<li
								key={label}
								className="flex items-center gap-3 py-1"
							>
								<p className="text-muted-foreground flex min-w-0 items-center gap-1.5">
									<span className="h-[1.1em] w-[1.1em] shrink-0 opacity-75 [&>svg]:h-full [&>svg]:w-full">
										{icon}
									</span>
									<span className="flex-1 truncate">
										{label}
									</span>
								</p>
								<hr className="min-w-2 flex-1" />
								<span className="shrink-0 font-medium tabular-nums">
									{value}
								</span>
							</li>
						))}
					</ul>
				</div>
			</Link>

			<ButtonGroup className="border-border/60 text-foreground mt-auto w-full border-t pt-3">
				<InstallButton
					item={item}
					variant="secondary"
					size="sm"
					className="min-w-0 flex-1"
				/>
				<DownloadButton
					item={item}
					variant="secondary"
					size="sm"
				/>
				{item.product_url && (
					<Button
						variant="secondary"
						size="sm"
						asChild
						title={__('View Original')}
					>
						<a
							href={item.product_url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<EyeIcon width={16} />
						</a>
					</Button>
				)}
				<BulkButton
					item={item}
					size="sm"
				/>
				<CollectionButton
					item={item}
					size="sm"
				/>
			</ButtonGroup>
		</div>
	);
}
