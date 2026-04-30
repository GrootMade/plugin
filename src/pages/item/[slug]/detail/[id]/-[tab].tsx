import { AppPageShell } from '@/components/body/page-shell';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { SlugToItemType } from '@/lib/type-to-slug';
import { useParams } from '@/router';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { ExternalLink } from 'lucide-react';
import type React from 'react';
import ItemDetailHeader, {
	ItemDetailHeaderSkeleton
} from './_components/detail-header';
import ItemChangeLog from './_components/item-changelog';
import ItemComments from './_components/item-comments';
import ItemDemoContents from './_components/item-demo-contents';
import ItemDescription from './_components/item-description';
import ItemSidebar from './_components/item-sidebar';

export type DetailTabType = {
	id: string;
	label: string;
	icon: React.ComponentType;
	el: React.ComponentType;
	external?: string;
}[];

export default function Component() {
	const params = useParams('/item/:slug/detail/:id/:tab?');
	const { data, isError, isLoading } = useApiFetch<TPostItem>(
		API.item.readDetail,
		{
			item_id: params.id
		}
	);
	const item_type = SlugToItemType(params.slug);

	return (
		<AppPageShell
			title={data?.title ?? __('Item Detail')}
			description=""
			showTitle={false}
			preloader={<ItemDetailHeaderSkeleton />}
			breadcrump={[
				{
					label: item_type?.label,
					href: `/item/${params.slug}`
				},
				{
					label: decodeEntities(data?.title ?? '')
				}
			]}
			{...{ isError, isLoading }}
		>
			{data && (
				<div className="gm-reveal-stagger mx-auto flex w-full max-w-6xl flex-col gap-7 lg:gap-10">
					<ItemDetailHeader item={data} />

					{/* Forked-from notice */}
					{data.is_forked && data.product_url && (
						<div className="flex flex-col gap-4">
							<div className="border-border/80 bg-muted/40 shadow-card flex items-center gap-3 rounded-lg border px-4 py-3">
								<div className="flex min-w-0 flex-col">
									<span className="text-muted-foreground text-xs">
										{__('Forked From')}
									</span>
									<a
										href={data.product_url}
										target="_blank"
										rel="noreferrer"
										className="truncate text-sm font-medium hover:underline"
									>
										{decodeEntities(
											data.original_title ?? ''
										)}
									</a>
								</div>
							</div>
							<p className="text-muted-foreground/60 px-1 text-[0.675rem] leading-relaxed">
								{__(
									'GrootMade is NOT affiliated with %s or its original author. %s™ is a trademark of its respective owner and use of it does not imply any endorsement or affiliation. This product has been forked under the GNU General Public License (GPL) and all non-GPL assets (such as proprietary images, fonts, and branding) have been removed. Distributing GPL-licensed code is 100%% legal.'
								).replace(
									/%s/g,
									decodeEntities(
										data.original_title ?? data.title
									)
								)}
							</p>
						</div>
					)}

					{/* Two-column content + sidebar */}
					<div className="grid gap-7 lg:grid-cols-12 lg:gap-10">
						<div className="flex flex-col gap-6 sm:gap-7 lg:col-span-8">
							<ItemDescription item={data} />
							<ItemDemoContents item={data} />
							<ItemChangeLog item={data} />
							{data.topic_id && data.topic_id > 0 && (
								<ItemComments
									itemId={data.id}
									topicId={data.topic_id}
								/>
							)}

							{data.support_url &&
								data.support_url.length > 0 && (
									<a
										href={data.support_url}
										target="_blank"
										rel="noreferrer"
										className="text-primary flex items-center gap-2 self-start text-sm hover:underline"
									>
										<ExternalLink className="size-4" />
										{__('Support')}
									</a>
								)}
						</div>
						<div className="lg:col-span-4">
							<ItemSidebar item={data} />
						</div>
					</div>
				</div>
			)}
		</AppPageShell>
	);
}
