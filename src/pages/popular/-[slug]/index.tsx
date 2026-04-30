import AdBanner from '@/components/ad-banner';
import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { MarketingSlot } from '@/components/page/marketing-slot';
import { Button } from '@/components/ui/button';
import useApiFetch from '@/hooks/use-api-fetch';
import useViewMode from '@/hooks/use-view-mode';
import { API } from '@/lib/api-endpoints';
import { __, _x, sprintf } from '@/lib/i18n';
import { SlugToItemType } from '@/lib/type-to-slug';
import PostGridItem from '@/pages/item/[slug]/-[page]/_components/PostGridItem';
import PostListItem from '@/pages/item/[slug]/-[page]/_components/PostListItem';
import { useParams } from '@/router';
import { TPostItemCollection } from '@/types/item';
import { EnumItemSlug } from '@/zod/item';
import { LayoutGrid, List, TrendingUp } from 'lucide-react';

export default function Component() {
	const { slug: _slug } = useParams('/popular/:slug?');
	const slug = EnumItemSlug.exclude(['template-kit'])
		.default('theme')
		.parse(_slug);
	const item_type = SlugToItemType(slug);
	const { data, isLoading } = useApiFetch<TPostItemCollection>(
		item_type.slug === 'theme'
			? API.popular.readThemes
			: API.popular.readPlugins
	);

	const title = sprintf(
		_x('Popular %s', 'Popular Themes/Poluar Plugins'),
		item_type.label
	);

	const hasRows = data && data.data && data.data.length > 0;
	const { mode, setViewMode } = useViewMode();
	const pageDescription = __(
		'Highly requested items from the community this week.'
	);

	return (
		<AppPageShell
			title={title}
			compactListing
			showTitle={false}
			isLoading={isLoading}
			breadcrump={[
				{
					label: title
				}
			]}
		>
			<div className="flex flex-col gap-3">
				<div className="border-border/80 bg-card rounded-lg border p-3 shadow-sm sm:p-4">
					<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
						<div className="min-w-0 flex-1">
							<h1 className="font-heading text-foreground text-lg font-semibold tracking-tight sm:text-xl">
								{title}
							</h1>
							<p className="text-muted-foreground mt-0.5 text-xs leading-snug sm:text-sm">
								{pageDescription}
							</p>
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
					{hasRows ? (
						mode === 'list' ? (
							<div className="flex flex-col gap-3">
								{data.data.map((item) => (
									<PostListItem
										key={item.id}
										item={item}
									/>
								))}
							</div>
						) : (
							<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
								{data.data.map((item) => (
									<PostGridItem
										key={item.id}
										item={item}
									/>
								))}
							</div>
						)
					) : !isLoading ? (
						<EmptyState
							icon={TrendingUp}
							title={__('No popular items right now')}
							description={__(
								'Check back soon or browse the full library for more options.'
							)}
							action={{
								label: sprintf(
									__('Browse %s'),
									item_type.label
								),
								to: `/item/${item_type.slug}`
							}}
						/>
					) : null}
					<MarketingSlot>
						<AdBanner />
					</MarketingSlot>
				</div>
			</div>
		</AppPageShell>
	);
}
