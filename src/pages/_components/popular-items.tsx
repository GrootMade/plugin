import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useApiFetch from '@/hooks/use-api-fetch';
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
		`popular/${type}`
	);
	const itemType = TypeToItemType(type as TItemTypeEnum);
	const label =
		type === 'theme' ? __('Popular Themes') : __('Popular Plugins');

	return (
		<Card className={cn('flex flex-col', className)}>
			<CardHeader className="flex flex-row items-center justify-between border-b">
				<h3 className="text-lg font-semibold">{label}</h3>
				<Link
					to="/popular/:slug?"
					params={{ slug: type }}
					className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
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
								className="flex items-center px-4 py-3"
							>
								<div className="flex-1 space-y-1.5">
									<div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
									<div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
								</div>
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
								className="flex items-center px-4 py-3 text-card-foreground no-underline transition-colors hover:bg-muted/50"
							>
								<div className="min-w-0 flex-1">
									<div className="truncate text-sm font-medium">
										{decodeEntities(item.title)}
									</div>
									<div className="flex items-center gap-3 text-xs text-muted-foreground">
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
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
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
