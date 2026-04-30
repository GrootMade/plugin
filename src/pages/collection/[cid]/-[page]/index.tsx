import AdBanner from '@/components/ad-banner';
import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { MarketingSlot } from '@/components/page/marketing-slot';
import Paging from '@/components/paging';
import { Button } from '@/components/ui/button';
import useApiFetch from '@/hooks/use-api-fetch';
import useViewMode from '@/hooks/use-view-mode';
import { API } from '@/lib/api-endpoints';
import { __, sprintf } from '@/lib/i18n';
import PostGridItem from '@/pages/item/[slug]/-[page]/_components/PostGridItem';
import PostListItem from '@/pages/item/[slug]/-[page]/_components/PostListItem';
import { useParams } from '@/router';
import { CollectionResponse } from '@/types/api';
import {
	BookmarkCollectionDetailSchema,
	BookmarkCollectionItemType,
	BookmarkCollectionType
} from '@/types/bookmark';
import { decodeEntities } from '@wordpress/html-entities';
import { LayoutGrid, List } from 'lucide-react';

export default function CollectionDetail() {
	const { cid, page = 1 } = useParams('/collection/:cid/:page?');
	const { data: collection } = useApiFetch<
		BookmarkCollectionType,
		BookmarkCollectionDetailSchema
	>(API.collection.readDetail, {
		id: Number(cid)
	});
	const { data: items, isLoading } = useApiFetch<
		CollectionResponse<BookmarkCollectionItemType>,
		BookmarkCollectionDetailSchema
	>(API.collection.readItems, {
		id: Number(cid),
		page: Number(page)
	});

	const hasItems = items && items.data.length > 0;
	const { mode, setViewMode } = useViewMode();

	const collectionTitle = collection
		? decodeEntities(collection.title)
		: __('Collection');
	const collectionSummary = collection?.summary
		? decodeEntities(collection.summary)
		: null;

	return (
		<AppPageShell
			title={collectionTitle}
			compactListing
			showTitle={false}
			isLoading={isLoading}
			breadcrump={[
				{
					label: __('Collection'),
					href: '/collection'
				},
				{
					label: collection?.title
						? decodeEntities(collection.title)
						: '…',
					href: `/collection/${cid}`
				},
				{
					label: sprintf(__('Page %d'), Number(page))
				}
			]}
		>
			<div className="flex flex-col gap-3">
				<div className="border-border/80 bg-card rounded-lg border p-3 shadow-sm sm:p-4">
					<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
						<div className="min-w-0 flex-1">
							<h1 className="font-heading text-foreground text-lg font-semibold tracking-tight sm:text-xl">
								{collectionTitle}
							</h1>
							{collectionSummary ? (
								<p className="text-muted-foreground mt-0.5 text-xs leading-snug sm:text-sm">
									{collectionSummary}
								</p>
							) : null}
						</div>
						<div className="flex shrink-0 rounded-md border">
							<Button
								variant={
									mode === 'grid' ? 'secondary' : 'ghost'
								}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setViewMode('grid')}
								title={__('Grid view')}
							>
								<LayoutGrid className="h-4 w-4" />
							</Button>
							<Button
								variant={
									mode === 'list' ? 'secondary' : 'ghost'
								}
								size="sm"
								className="h-8 w-8 p-0"
								onClick={() => setViewMode('list')}
								title={__('List view')}
							>
								<List className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</div>
				<div className="gm-reveal-stagger flex flex-col gap-5 sm:gap-6">
					{hasItems ? (
						<>
							{mode === 'list' ? (
								<div className="flex flex-col gap-3">
									{items.data.map((item) => (
										<PostListItem
											item={item.post}
											key={item.id}
										/>
									))}
								</div>
							) : (
								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
									{items.data.map((item) => (
										<PostGridItem
											item={item.post}
											key={item.id}
										/>
									))}
								</div>
							)}
							<MarketingSlot>
								<AdBanner />
							</MarketingSlot>
							{items.meta ? (
								<Paging
									totalItems={items.meta?.total}
									currentPage={Number(page)}
									totalPages={items.meta?.last_page}
									urlGenerator={(_page: number) =>
										`/collection/${cid}/${_page}`
									}
								/>
							) : null}
						</>
					) : (
						<EmptyState
							icon={LayoutGrid}
							title={__('This collection is empty')}
							description={__(
								'Add items from product pages to see them listed here.'
							)}
							action={{
								label: __('Back to collections'),
								to: '/collection'
							}}
						/>
					)}
				</div>
			</div>
		</AppPageShell>
	);
}
