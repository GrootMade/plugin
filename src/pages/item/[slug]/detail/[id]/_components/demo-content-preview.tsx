import {
	Card,
	CardContent,
	CardFooter,
	CardHeader
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { Link, useParams } from '@/router';
import { TDemoContentCollection, TPostItem } from '@/types/item';
import { DemoContentTable } from './item-demo-contents';

type Props = {
	item: TPostItem;
};

export default function DemoContentPreview({ item }: Props) {
	const params = useParams('/item/:slug/detail/:id/:tab?');
	const { data, isLoading, isFetching } = useApiFetch<TDemoContentCollection>(
		API.item.demoContent,
		{
			item_id: params.id
		}
	);
	return (
		<div className="flex flex-col gap-5 sm:gap-7">
			<Card>
				<CardHeader className="border-b p-5 sm:p-7">
					{__('Demo Contents')}
				</CardHeader>
				<CardContent className="p-5 text-sm sm:p-7">
					{data?.data ? (
						<div className="flex flex-col gap-4">
							<DemoContentTable
								item={item}
								data={data?.data.slice(0, 5)}
							/>
						</div>
					) : isLoading || isFetching ? (
						<div className="space-y-3">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex items-center gap-3 rounded-md border px-3 py-2"
								>
									<Skeleton className="h-4 w-20" />
									<Skeleton className="h-4 flex-1" />
									<Skeleton className="h-8 w-10" />
								</div>
							))}
						</div>
					) : (
						<div className="">{__('No Items Found')}</div>
					)}
				</CardContent>
				<CardFooter className="border-border justify-center border-t text-center">
					<Link
						to="/item/:slug/detail/:id/:tab?"
						params={{ ...params, tab: 'demo-contents' }}
						className="border-primary text-primary border-b border-dashed text-sm"
					>
						{__('View More')}
					</Link>
				</CardFooter>
			</Card>
		</div>
	);
}
