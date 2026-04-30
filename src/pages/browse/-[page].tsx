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
import { cn } from '@/lib/utils';
import PostGridItem, {
	PostGridItemSkeleton
} from '@/pages/item/[slug]/-[page]/_components/PostGridItem';
import PostListItem, {
	PostListItemSkeleton
} from '@/pages/item/[slug]/-[page]/_components/PostListItem';
import { useParams } from '@/router';
import { ItemStatsResponse, TPostItemCollection, TTerm } from '@/types/item';
import { useEffect, useMemo } from '@wordpress/element';
import { LayoutGrid, List, SearchX } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { z } from 'zod';

/**
 * Combined catalog: themes + plugins in one list.
 * WordPress `item/read/list` merges two engine calls when `type` is `theme,plugin`.
 */
const BROWSE_COMBINED_TYPE = 'theme,plugin';

const sort_items: ReturnType<typeof useDataCollection>['sort'] = [
	{ label: __('Most popular'), value: 'popularity' },
	{ label: __('Latest updated'), value: 'updated' },
	{ label: __('Newest'), value: 'added' }
];

const browsePath = '/browse/:page?' as const;

const paramsSchema = z.object({
	page: z.coerce.number().default(1)
});

function NoSearchResultFound() {
	return (
		<div className="col-span-full">
			<EmptyState
				icon={SearchX}
				title={__('No matches')}
				description={__(
					"Try different keywords or sort — we couldn't find themes or plugins for this search."
				)}
				action={{
					label: __('Browse themes only'),
					to: '/item/theme'
				}}
			/>
		</div>
	);
}

export default function Component() {
	const raw = useParams(browsePath);
	const parsed = paramsSchema.safeParse({ page: raw.page ?? 1 });
	const page = parsed.success ? parsed.data.page : 1;

	const { data: stats } = useApiFetch<ItemStatsResponse>(API.item.readStats);
	const totalCatalog =
		stats != null ? stats.themes + stats.plugins : undefined;

	const description = useMemo(() => {
		if (totalCatalog == null) {
			return __(
				'Search and sort themes and plugins together in one catalog.'
			);
		}
		return sprintf(
			_n(
				'%s theme or plugin in the combined catalog.',
				'%s themes and plugins in the combined catalog.',
				totalCatalog
			),
			totalCatalog.toLocaleString()
		);
	}, [totalCatalog]);

	const { data: themeTerms } = useGetTerms('theme');
	const { data: pluginTerms } = useGetTerms('plugin');

	const mergedTerms = useMemo(() => {
		const map = new Map<string, TTerm>();
		for (const t of themeTerms) {
			map.set(`${t.taxonomy}:${t.slug}`, t);
		}
		for (const t of pluginTerms) {
			map.set(`${t.taxonomy}:${t.slug}`, t);
		}
		return [...map.values()];
	}, [themeTerms, pluginTerms]);

	const filterOptions = useMemo(
		() =>
			buildCatalogFilterOptions(mergedTerms, {
				includeAddContent: true
			}),
		[mergedTerms]
	);

	const dataCollection = useDataCollection({
		options: filterOptions,
		path: browsePath,
		sort: sort_items
	});

	const {
		data,
		isLoading: isItemsLoading,
		isFetching,
		isError
	} = useApiFetch<TPostItemCollection>(
		API.item.readList,
		{
			type: BROWSE_COMBINED_TYPE,
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
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [page, location.search]);

	return (
		<AppPageShell
			title={__('Browse all')}
			compactListing
			fullWidth
			showTitle={false}
			isLoading={isItemsLoading}
			isError={isError}
			error={
				<EmptyState
					icon={SearchX}
					title={__('Could not load combined catalog')}
					description={__(
						'The catalog could not be loaded. Try themes or plugins separately, or refresh the page.'
					)}
					action={{
						label: __('Themes'),
						to: '/item/theme'
					}}
				/>
			}
			filterBar={
				<FilterBar
					variant="compact"
					pageTitle={__('Browse all')}
					pageDescription={description}
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
								<span className="text-muted-foreground text-xs whitespace-nowrap tabular-nums sm:text-sm">
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
				{ label: __('Browse all') },
				...(page > 1 ? [{ label: sprintf(__('Page %d'), page) }] : [])
			]}
		>
			{data && (
				<div className="gm-reveal-stagger flex flex-col gap-5 sm:gap-6">
					<div
						className={cn(
							mode === 'list'
								? 'flex flex-col gap-3'
								: 'grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5'
						)}
					>
						{data.data.length > 0 ? (
							<>
								{data.data.map((item, index) => {
									const itemKey = `${item.type}-${item.id}`;
									return mode === 'list' ? (
										<PostListItem
											key={itemKey}
											item={item}
											style={{ order: index }}
										/>
									) : (
										<PostGridItem
											key={itemKey}
											item={item}
											style={{ order: index }}
										/>
									);
								})}
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
											if (order > data.data.length) {
												return null;
											}
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
								`/browse/${_page}?${dataCollection.searchParams}`
							}
						/>
					) : null}
				</div>
			)}
		</AppPageShell>
	);
}
