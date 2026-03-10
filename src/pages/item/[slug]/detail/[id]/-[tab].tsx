import { AppPageShell } from '@/components/body/page-shell';
import useApiFetch from '@/hooks/use-api-fetch';
import { __ } from '@/lib/i18n';
import placeholder from '@/lib/placeholder';
import { SlugToItemType } from '@/lib/type-to-slug';
import { useParams } from '@/router';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { ExternalLink } from 'lucide-react';
import React from 'react';
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
	const { data, isError, isLoading, isFetching } = useApiFetch<TPostItem>(
		'item/detail',
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
			{...{ isError, isFetching, isLoading }}
		>
			{data && (
				<div className="grid gap-6 md:grid-cols-3 lg:gap-8">
					<div className="flex flex-col gap-5 max-md:contents sm:gap-7 md:col-span-2">
						<ItemDetailHeader item={data} />

						{data.is_forked && data.product_url && (
							<div className="flex flex-col gap-4 self-stretch max-md:order-2">
								<div className="flex items-center gap-3 rounded-lg border bg-accent/40 px-4 py-3">
									<div className="flex min-w-0 flex-col">
										<span className="text-xs text-muted-foreground">
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
								<p className="px-1 text-[0.675rem] leading-relaxed text-muted-foreground/60">
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

						{data.image && (
							<div className="self-stretch overflow-hidden rounded-lg border max-md:order-2">
								<img
									src={data.image ?? placeholder(data.title)}
									alt={decodeEntities(data.title)}
									className="w-full object-cover"
									loading="eager"
								/>
							</div>
						)}

						<ItemDescription item={data} />

						{data.media_count && data.media_count > 0 && (
							<ItemChangeLog item={data} />
						)}
						{data.additional_content_count &&
							data.additional_content_count > 0 && (
								<ItemDemoContents item={data} />
							)}
						{data.topic_id && data.topic_id > 0 && <ItemComments />}

						{data.support_url && data.support_url.length > 0 && (
							<a
								href={data.support_url}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-2 self-start text-sm text-primary hover:underline"
							>
								<ExternalLink className="size-4" />
								{__('Support')}
							</a>
						)}
					</div>
					<div className="max-md:contents md:col-span-1">
						<ItemSidebar item={data} />
					</div>
				</div>
			)}
		</AppPageShell>
	);
}
