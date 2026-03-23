import BulkButton from '@/components/bulk-button';
import CollectionButton from '@/components/collection-button';
import DownloadButton from '@/components/download-button';
import InstallButton from '@/components/install-button';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Skeleton } from '@/components/ui/skeleton';
import { __ } from '@/lib/i18n';
import { TypeToItemType } from '@/lib/type-to-slug';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import {
	CalendarIcon,
	Download,
	EyeIcon,
	GitFork,
	LayoutTemplateIcon,
	PackageIcon,
	PaintbrushIcon,
	PlugIcon,
	TagIcon,
	UserIcon
} from 'lucide-react';
import millify from 'millify';
import moment from 'moment';
import { Link } from 'react-router-dom';

function TypeIcon({ type }: { type: string }) {
	switch (type) {
		case 'plugin':
			return <PlugIcon />;
		case 'theme':
			return <PaintbrushIcon />;
		case 'template-kit':
			return <LayoutTemplateIcon />;
		default:
			return <TagIcon />;
	}
}

const cardClass =
	'group relative flex flex-col items-start gap-4 w-full border bg-card p-5 rounded-lg text-card-foreground transition duration-100 ease-out transform-gpu hover:border-ring after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:border-4 after:border-background';

export function PostGridItemSkeleton() {
	return (
		<div className={`${cardClass} select-none items-stretch`}>
			<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
				<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
				<div className="w-2/3 text-base font-semibold">
					<Skeleton>&nbsp;</Skeleton>
				</div>
			</div>
			<ul className="mt-auto w-full animate-pulse text-xs">
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
	const author = item.terms?.find(
		(t) => t.taxonomy === 'original_author_tax'
	);

	const updatedAt = item.updated ? moment.unix(item.updated).fromNow() : '—';

	const insights = [
		{
			label: __('Version'),
			value: item.version || '—',
			icon: <PackageIcon />
		},
		{
			label: __('Author'),
			value: author ? decodeEntities(author.name) : '—',
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
			className={`${cardClass} hover:bg-accent`}
			style={style}
		>
			<Link
				to={detailUrl}
				className="contents text-card-foreground no-underline"
			>
				<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
					<div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-accent p-1.5 text-muted-foreground">
						<TypeIcon type={item.type} />
					</div>

					<div className="min-w-0 flex-1">
						<h3 className="truncate text-base font-semibold tracking-tight">
							{item.title}
						</h3>
						{item.original_title &&
							item.original_title !== item.title && (
								<span className="flex items-center gap-1 text-xs text-muted-foreground">
									<GitFork className="h-3 w-3 shrink-0" />
									<span className="truncate">
										{item.original_title}
									</span>
								</span>
							)}
					</div>
				</div>

				<div className="flex w-full flex-1 flex-col">
					<ul className="mt-auto w-full text-xs">
						{insights.map(({ label, value, icon }) => (
							<li
								key={label}
								className="flex items-center gap-3 py-1"
							>
								<p className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
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

			<ButtonGroup className="mt-auto w-full text-foreground">
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
