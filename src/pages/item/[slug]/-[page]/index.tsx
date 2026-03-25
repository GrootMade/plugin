import AdCard from '@/components/ad-card';
import { AppPageShell } from '@/components/body/page-shell';
import FilterBar from '@/components/filter/filter-bar';
import { EmptyState } from '@/components/page/empty-state';
import Paging from '@/components/paging';
import ActionLoader from '@/components/ui/action-loader';
import { Button } from '@/components/ui/button';
import { adsConfig } from '@/config/ads';
import useApiFetch from '@/hooks/use-api-fetch';
import useDataCollection from '@/hooks/use-data-collection';
import useGetTerms from '@/hooks/use-get-terms';
import useViewMode from '@/hooks/use-view-mode';
import { API } from '@/lib/api-endpoints';
import { __, _n, sprintf } from '@/lib/i18n';
import { buildCatalogFilterOptions } from '@/lib/item-catalog-filter-options';
import { SlugToItemType } from '@/lib/type-to-slug';
import { cn } from '@/lib/utils';
import PostGridItem, {
	PostGridItemSkeleton
} from '@/pages/item/[slug]/-[page]/_components/PostGridItem';
import PostListItem, {
	PostListItemSkeleton
} from '@/pages/item/[slug]/-[page]/_components/PostListItem';
import { useParams } from '@/router';
import { TPostItemCollection } from '@/types/item';
import { EnumItemSlug } from '@/zod/item';
import { useEffect, useMemo } from '@wordpress/element';
import { LayoutGrid, List, SearchX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';

const sort_items: ReturnType<typeof useDataCollection>['sort'] = [
	{
		label: __('Popularity'),
		value: 'popularity'
	},
	{
		label: __('Updated'),
		value: 'updated'
	},
	{
		label: __('Views'),
		value: 'views'
	},
	{
		label: __('Title'),
		value: 'title'
	},
	{
		label: __('Added'),
		value: 'added'
	}
];
const path = '/item/:slug/:page?';
const paramsSchema = z.object({
	slug: EnumItemSlug.default('theme'),
	page: z.coerce.number().default(1)
});
function NoSearchResultFound() {
	return (
		<div className="col-span-full">
			<EmptyState
				icon={SearchX}
				title={__('No matches')}
				description={__(
					"Try different filters or keywords — we couldn't find items for this search."
				)}
			/>
		</div>
	);
}
export default function Component() {
	const params = paramsSchema.safeParse(useParams(path));
	if (params.error) {
		throw Error('Invalid Item Type');
	}
	const item_type = SlugToItemType(params.data.slug);
	const type = item_type.type;
	const page = params.data.page;
	const { data: terms } = useGetTerms(type);

	const filters = useMemo(
		() =>
			buildCatalogFilterOptions(terms, {
				includeAddContent:
					item_type.slug !== 'template-kit' &&
					item_type.slug !== 'request'
			}),
		[terms, item_type.slug]
	);
	const dataCollection = useDataCollection({
		options: filters,
		path: path,
		sort: sort_items
	});
	const {
		data,
		isLoading: isItemsLoading,
		isFetching
	} = useApiFetch<TPostItemCollection>(
		API.item.readList,
		{
			type,
			page,
			filter: dataCollection.filter,
			sort: dataCollection.sorting,
			keyword: dataCollection.search?.keyword,
			per_page: Number(dataCollection.pagination?.per_page)
		},
		true
	);
	const { mode, setViewMode } = useViewMode();
	const location = useLocation();
	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}, [page, location.search, params.data.slug]);
	return (
		<AppPageShell
			title={item_type?.label ?? ''}
			compactListing
			showTitle={false}
			isLoading={isItemsLoading}
			filterBar={
				<FilterBar
					variant="compact"
					pageTitle={item_type?.label ?? ''}
					pageDescription={item_type?.description}
					collection={dataCollection}
					meta={
						<>
							{isFetching && (
								<ActionLoader
									showPulse={false}
									className="shrink-0"
									iconClassName="text-muted-foreground"
								/>
							)}
							{data?.meta != null && data.meta.total >= 0 ? (
								<span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground sm:text-sm">
									{sprintf(
										_n(
											'%s result',
											'%s results',
											data.meta.total
										),
										data.meta.total.toLocaleString()
									)}
								</span>
							) : null}
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
						</>
					}
				/>
			}
			preloader={
				mode === 'list' ? (
					<div className="flex flex-col gap-3">
						<PostListItemSkeleton />
						<PostListItemSkeleton />
						<PostListItemSkeleton />
					</div>
				) : (
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
						{Array.from({ length: 10 }).map((_, i) => (
							<PostGridItemSkeleton key={i} />
						))}
					</div>
				)
			}
			breadcrump={[
				{
					label: item_type?.label,
					href: `/item/${type}`
				},
				{
					label: sprintf(__('Page %d'), Number(page))
				}
			]}
		>
			{data && (
				<div className="flex flex-col gap-5 sm:gap-6">
					<div
						className={cn(
							mode === 'list'
								? 'flex flex-col gap-3'
								: 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5'
						)}
					>
						{data.data.length > 0 ? (
							<>
								{data.data.map((item, index) =>
									mode === 'list' ? (
										<PostListItem
											key={item.id}
											item={item}
											style={{ order: index }}
										/>
									) : (
										<PostGridItem
											key={item.id}
											item={item}
											style={{ order: index }}
										/>
									)
								)}
								{mode === 'grid' &&
									adsConfig.enabled &&
									Array.from(
										{ length: adsConfig.adsPerPage },
										(_, i) => {
											const order = Math.ceil(
												(data.data.length /
													adsConfig.adsPerPage) *
													i +
													1
											);
											if (order > data.data.length)
												return null;
											return (
												<AdCard
													key={`ad-${i}`}
													style={{ order }}
												/>
											);
										}
									)}
							</>
						) : (
							<NoSearchResultFound />
						)}
					</div>
					{data.meta ? (
						<Paging
							currentPage={Number(page)}
							totalItems={data.meta?.total}
							totalPages={data.meta?.last_page}
							urlGenerator={(_page: number) =>
								`/item/${item_type.slug}/${_page}?${dataCollection?.searchParams}`
							}
						/>
					) : null}
				</div>
			)}
		</AppPageShell>
	);
}
