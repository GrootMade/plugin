import {
	Card,
	CardContent,
	CardFooter,
	CardHeader
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import useApiFetch from '@/hooks/use-api-fetch';
import { __ } from '@/lib/i18n';
import renderHtml from '@/lib/render-html';
import { TCommentResponse } from '@/types/item';
import moment from 'moment';

type Props = {
	itemId: string;
	topicId: number;
};

export default function ItemComments({ itemId, topicId }: Props) {
	const parsedItemId = Number(itemId);
	const parsedTopicId = Number(topicId);
	const { data, isLoading, isFetching } = useApiFetch<TCommentResponse>(
		'item/comments',
		{
			item_id: parsedItemId,
			topic_id: parsedTopicId
		},
		Number.isFinite(parsedItemId) &&
			parsedItemId > 0 &&
			Number.isFinite(parsedTopicId) &&
			parsedTopicId > 0
	);
	return (
		<div className="flex flex-col gap-5 max-md:order-6 sm:gap-7">
			<Card>
				<CardHeader className="border-b p-5 sm:p-7">
					{__('Comments')}
				</CardHeader>
				<CardContent className="item-description p-5 text-sm leading-relaxed sm:p-7">
					{data ? (
						<div className="flex flex-col gap-4 divide-y">
							{data?.comments?.map((comment) => (
								<div
									key={comment.id}
									className="flex flex-col gap-3 pt-4 first:pt-0"
								>
									<div className="flex items-center gap-2">
										<div className="text-primary-background flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground">
											<img
												src={comment.avatar}
												className="rounded-full "
											/>
										</div>
										<div className="flex flex-col">
											<div className="text-sm font-semibold">
												{comment.display_name}
											</div>
											<div className="text-xs text-muted-foreground">
												{moment
													.unix(comment.created_at)
													.format(
														'MMM DD, YYYY HH:mm'
													)}
											</div>
										</div>
									</div>
									<div className="text-sm">
										{renderHtml(comment.comment)}
									</div>
								</div>
							))}
						</div>
					) : isLoading || isFetching ? (
						<div className="flex flex-col gap-4">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex flex-col gap-3"
								>
									<div className="flex items-center gap-2">
										<Skeleton className="size-8 rounded-full" />
										<div className="flex flex-col gap-1">
											<Skeleton className="h-3 w-28" />
											<Skeleton className="h-2.5 w-20" />
										</div>
									</div>
									<Skeleton className="h-3 w-full" />
									<Skeleton className="h-3 w-2/3" />
								</div>
							))}
						</div>
					) : (
						<div className="">{__('No Items Found')}</div>
					)}
				</CardContent>
				{data && (
					<CardFooter className="justify-center border-t border-border text-center">
						<a
							href={data?.url}
							target="_blank"
							rel="noreferrer"
							className="border-b border-dashed border-primary text-sm text-primary"
						>
							{__('View more comments')}
						</a>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
