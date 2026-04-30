import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { archiveItemCoverSrc } from '@/lib/archive-item-cover';
import { __ } from '@/lib/i18n';
import { TypeToItemType } from '@/lib/type-to-slug';
import { cn } from '@/lib/utils';
import { Link } from '@/router';
import { TItemTypeEnum, TPostItemCollection } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { ArrowRight, Download } from 'lucide-react';
import millify from 'millify';
import moment from 'moment';
import { ClassNameValue } from 'tailwind-merge';

type Props = {
	type: 'theme' | 'plugin';
	className?: ClassNameValue;
};

export default function PopularItems({ type, className }: Props) {
	const { data, isLoading } = useApiFetch<TPostItemCollection>(
		type === 'theme' ? API.popular.readThemes : API.popular.readPlugins
	);
	const itemType = TypeToItemType(type as TItemTypeEnum);
	const label =
		type === 'theme' ? __('Popular Themes') : __('Popular Plugins');
	const badgeLabel = type === 'theme' ? __('Theme') : __('Plugin');

	return (
		<Card className={cn('flex flex-col', className)}>
			<CardHeader className="flex flex-row items-center justify-between border-b">
				<h3 className="text-lg font-semibold">{label}</h3>
				<Link
					to="/popular/:slug?"
					params={{ slug: type }}
					className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
				>
					{__('View all')}
					<ArrowRight className="h-3.5 w-3.5" />
				</Link>
			</CardHeader>
			<CardContent className="p-0">
				{isLoading ? (
					<div className="divide-y">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={i}
								className="flex items-center gap-3 px-4 py-3"
							>
								<Skeleton className="h-9 w-9 shrink-0 rounded-md" />
								<div className="flex-1 space-y-2">
									<div className="flex items-center gap-2">
										<Skeleton className="h-3.5 w-32 max-w-[60%]" />
										<Skeleton className="h-4 w-12 rounded-full" />
									</div>
									<Skeleton className="h-3 w-1/2" />
								</div>
								<Skeleton className="h-3 w-10" />
							</div>
						))}
					</div>
				) : (
					<div className="divide-y">
						{data?.data?.slice(0, 6).map((item) => (
							<Link
								key={item.id}
								to="/item/:slug/detail/:id/:tab?"
								params={{
									id: item.id,
									slug: itemType?.slug ?? type
								}}
								className="text-card-foreground hover:bg-muted/50 flex items-center gap-3 px-4 py-3 no-underline transition-colors"
							>
								<Avatar className="h-9 w-9 rounded-md">
									<AvatarImage
										src={archiveItemCoverSrc(item)}
										alt={decodeEntities(item.title)}
									/>
									<AvatarFallback>
										{decodeEntities(item.title)
											.slice(0, 1)
											.toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0 flex-1">
									<div className="flex items-center gap-2">
										<div className="truncate text-sm font-medium">
											{decodeEntities(item.title)}
										</div>
										<Badge
											variant="secondary"
											className="text-[10px]"
										>
											{badgeLabel}
										</Badge>
									</div>
									<div className="text-muted-foreground flex items-center gap-3 text-xs">
										{item.version && (
											<span>v{item.version}</span>
										)}
										{item.updated && (
											<span>
												{moment
													.unix(item.updated)
													.fromNow()}
											</span>
										)}
									</div>
								</div>
								{item.download_count != null &&
									item.download_count > 0 && (
										<div className="text-muted-foreground flex items-center gap-1 text-xs">
											<Download className="h-3 w-3" />
											<span>
												{millify(item.download_count)}
											</span>
										</div>
									)}
							</Link>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
