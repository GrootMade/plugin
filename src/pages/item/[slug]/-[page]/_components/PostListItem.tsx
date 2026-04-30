import BulkButton from '@/components/bulk-button';
import CollectionButton from '@/components/collection-button';
import DownloadButton from '@/components/download-button';
import InstallButton from '@/components/install-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Skeleton } from '@/components/ui/skeleton';
import { archiveItemCoverSrc } from '@/lib/archive-item-cover';
import { __ } from '@/lib/i18n';
import { TypeToItemType } from '@/lib/type-to-slug';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { Download, EyeIcon } from 'lucide-react';
import millify from 'millify';
import moment from 'moment';
import { Link } from 'react-router-dom';

export function PostListItemSkeleton() {
	return (
		<div className="bg-background flex items-center gap-4 rounded-lg border p-4">
			<Skeleton className="h-14 w-14 shrink-0 rounded-md" />
			<div className="min-w-0 flex-1 space-y-2">
				<Skeleton className="h-4 w-1/3" />
				<Skeleton className="h-3 w-1/2" />
			</div>
			<Skeleton className="hidden h-8 w-24 sm:block" />
		</div>
	);
}

type Props = {
	item: TPostItem;
	style?: React.CSSProperties;
};

export default function PostListItem({ item, style }: Props) {
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
	const coverSrc = archiveItemCoverSrc(item);

	return (
		<div
			className="group border-border/80 bg-background text-foreground hover:border-ring/70 flex items-center gap-4 rounded-xl border p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-4"
			style={style}
		>
			<Link
				to={detailUrl}
				className="shrink-0 no-underline"
			>
				<Avatar className="h-14 w-14 rounded-lg sm:h-16 sm:w-16">
					<AvatarImage
						src={coverSrc}
						alt={decodeEntities(item.title)}
					/>
					<AvatarFallback className="rounded-lg text-xs">
						{decodeEntities(item.title).slice(0, 2).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</Link>

			<Link
				to={detailUrl}
				className="min-w-0 flex-1 no-underline"
			>
				<h3 className="text-card-foreground truncate text-sm font-semibold">
					{decodeEntities(item.title)}
				</h3>
				<div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
					<span>{authorName}</span>
					{item.version && <span>v{item.version}</span>}
					{item.updated && (
						<span>{moment.unix(item.updated).fromNow()}</span>
					)}
					{item.download_count != null && item.download_count > 0 && (
						<span className="flex items-center gap-1">
							<Download className="h-3 w-3" />
							{millify(item.download_count)}
						</span>
					)}
				</div>
			</Link>

			<ButtonGroup className="border-border/60 text-foreground hidden shrink-0 border-l pl-3 sm:flex">
				<InstallButton
					item={item}
					variant="secondary"
					size="sm"
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
