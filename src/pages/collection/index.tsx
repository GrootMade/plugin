import AdCard from '@/components/ad-card';
import AddCollectionButton from '@/components/add-collection-dialog';
import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { MarketingSlot } from '@/components/page/marketing-slot';
import { Button } from '@/components/ui/button';
import useActivation from '@/hooks/use-activation';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { useNavigate } from '@/router';
import { CollectionResponse } from '@/types/api';
import { BookmarkCollectionType } from '@/types/bookmark';
import { useEffect } from '@wordpress/element';
import { Heart, Plus } from 'lucide-react';
import Collection from './_components/collection';

export default function Component() {
	const navigate = useNavigate();
	const { active, activated } = useActivation();
	const { data, isLoading } = useApiFetch<
		CollectionResponse<BookmarkCollectionType>
	>(API.collection.read);
	useEffect(() => {
		if (!active || !activated) {
			navigate('/');
		}
	}, [activated, active, navigate]);

	const hasCollections = data && data.data.length > 0;
	const pageTitle = __('Collections');
	const pageDescription = __(
		'Group saved themes and plugins into lists you can open from the library.'
	);

	return (
		<AppPageShell
			title={pageTitle}
			compactListing
			showTitle={false}
			isLoading={isLoading}
			breadcrump={[
				{
					label: __('Collection')
				}
			]}
		>
			<div className="flex flex-col gap-3">
				<div className="border-border/80 bg-card rounded-lg border p-3 shadow-sm sm:p-4">
					<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
						<div className="min-w-0 flex-1">
							<h1 className="font-heading text-foreground text-lg font-semibold tracking-tight sm:text-xl">
								{pageTitle}
							</h1>
							<p className="text-muted-foreground mt-0.5 text-xs leading-snug sm:text-sm">
								{pageDescription}
							</p>
						</div>
						<AddCollectionButton>
							<Button className="shrink-0 gap-2">
								<Plus
									className="size-4"
									aria-hidden
								/>
								{__('Add New Collection')}
							</Button>
						</AddCollectionButton>
					</div>
				</div>
				<div className="gm-reveal-stagger flex flex-col gap-5 sm:gap-6">
					{hasCollections ? (
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4 2xl:grid-cols-5">
							{data.data.map((collection) => (
								<Collection
									collection={collection}
									key={collection.id}
								/>
							))}
						</div>
					) : (
						<EmptyState
							icon={Heart}
							title={__('No collections yet')}
							description={__(
								'Create a collection to bookmark items from the catalog and find them faster later.'
							)}
						>
							<AddCollectionButton>
								<Button className="gap-2">
									<Plus
										className="size-4"
										aria-hidden
									/>
									{__('Add New Collection')}
								</Button>
							</AddCollectionButton>
						</EmptyState>
					)}
					<MarketingSlot>
						<AdCard className="max-w-sm" />
					</MarketingSlot>
				</div>
			</div>
		</AppPageShell>
	);
}
