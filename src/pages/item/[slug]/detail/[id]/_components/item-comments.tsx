import {
	Card,
	CardContent,
	CardFooter,
	CardHeader
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import renderHtml from '@/lib/render-html';
import { TCommentResponse } from '@/types/item';
import moment from 'moment';

type Props = {
	itemId: string;
	topicId: number;
};

type NormalizedComment = {
	id: number;
	display_name: string;
	avatar: string;
	comment: string;
	created_at: number;
	reads: number;
	post_number?: number;
};

function getTopicOrigin(topicUrl?: string): string {
	if (!topicUrl) {
		return '';
	}

	try {
		return new URL(topicUrl).origin;
	} catch {
		return '';
	}
}

function resolveAvatarUrl(template?: string, topicUrl?: string): string {
	if (!template) {
		return '';
	}

	const withSize = template.replace('{size}', '96');
	if (withSize.startsWith('http://') || withSize.startsWith('https://')) {
		return withSize;
	}

	if (withSize.startsWith('//')) {
		return `https:${withSize}`;
	}

	const origin = getTopicOrigin(topicUrl);
	if (!origin) {
		return withSize;
	}

	return withSize.startsWith('/')
		? `${origin}${withSize}`
		: `${origin}/${withSize}`;
}

function parseCreatedAt(input: unknown): number {
	if (typeof input === 'number' && Number.isFinite(input)) {
		return input > 1_000_000_000_000 ? Math.floor(input / 1000) : input;
	}

	if (typeof input === 'string') {
		const ms = Date.parse(input);
		if (!Number.isNaN(ms)) {
			return Math.floor(ms / 1000);
		}
	}

	return 0;
}

function normalizeComments(payload: unknown): NormalizedComment[] {
	if (!payload || typeof payload !== 'object') {
		return [];
	}

	const data = payload as {
		url?: string;
		comments?: Array<{
			id: number;
			display_name: string;
			avatar: string;
			comment: string;
			created_at: number;
			reads: number;
		}>;
		users?: Array<{
			username?: string;
			name?: string;
			avatar_template?: string;
		}>;
		post_stream?: {
			posts?: Array<{
				id?: number;
				username?: string;
				name?: string;
				display_username?: string;
				avatar_template?: string;
				cooked?: string;
				comment?: string;
				created_at?: string | number;
				reads?: number;
				post_number?: number;
			}>;
		};
	};

	if (Array.isArray(data.comments) && data.comments.length > 0) {
		return data.comments;
	}

	const posts = data.post_stream?.posts;
	if (!Array.isArray(posts)) {
		return [];
	}

	const usersByUsername = new Map(
		(data.users ?? [])
			.filter((user) => !!user.username)
			.map((user) => [user.username as string, user])
	);

	const origin = getTopicOrigin(data.url);

	return posts
		.filter(
			(post) =>
				!!post && typeof post === 'object' && post.post_number !== 1 // skip topic body (always post #1)
		)
		.map((post, index) => {
			const user = post.username
				? usersByUsername.get(post.username)
				: undefined;
			const displayName =
				post.display_username ||
				post.name ||
				user?.name ||
				post.username ||
				__('User');

			// Fix relative mention/avatar links to use the forum origin
			let cooked = post.cooked ?? post.comment ?? '';
			if (origin && cooked) {
				cooked = cooked.replace(
					/href="(\/[^"]*)"/g,
					`href="${origin}$1"`
				);
			}

			return {
				id: post.id ?? index,
				display_name: displayName,
				avatar: resolveAvatarUrl(
					post.avatar_template ?? user?.avatar_template,
					data.url
				),
				comment: cooked,
				created_at: parseCreatedAt(post.created_at),
				reads: Number(post.reads ?? 0),
				post_number: post.post_number
			};
		});
}

export default function ItemComments({ itemId, topicId }: Props) {
	const parsedItemId = Number(itemId);
	const parsedTopicId = Number(topicId);
	const { data, isLoading, isFetching, isError, error } =
		useApiFetch<TCommentResponse>(
			API.item.comments,
			{
				item_id: parsedItemId,
				topic_id: parsedTopicId
			},
			Number.isFinite(parsedItemId) &&
				parsedItemId > 0 &&
				Number.isFinite(parsedTopicId) &&
				parsedTopicId > 0
		);
	const comments = normalizeComments(data);
	const hasComments = comments.length > 0;
	const topicUrl =
		typeof (data as { url?: unknown } | undefined)?.url === 'string'
			? ((data as { url?: string }).url ?? '')
			: '';

	return (
		<div className="flex flex-col gap-5 max-md:order-6 sm:gap-7">
			<Card>
				<CardHeader className="border-b p-5 sm:p-7">
					{__('Comments')}
				</CardHeader>
				<CardContent className="p-0 text-sm">
					{isError ? (
						<div className="space-y-2 p-5 sm:p-7">
							<p className="text-destructive text-sm font-medium">
								{__('Failed to load comments.')}
							</p>
							{error &&
								typeof (error as { message?: string })
									.message === 'string' && (
									<p className="text-muted-foreground text-xs">
										{(error as { message: string }).message}
									</p>
								)}
						</div>
					) : hasComments ? (
						<div className="divide-y">
							{comments.map((comment) => (
								<div
									key={comment.id}
									className="flex gap-3 p-5 sm:p-6"
								>
									{/* Avatar */}
									<div className="bg-muted text-muted-foreground flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold">
										{comment.avatar ? (
											<img
												src={comment.avatar}
												alt={comment.display_name}
												className="h-full w-full object-cover"
											/>
										) : (
											comment.display_name
												.charAt(0)
												.toUpperCase()
										)}
									</div>

									{/* Content */}
									<div className="min-w-0 flex-1">
										<div className="mb-2 flex items-baseline justify-between gap-2">
											<span className="text-sm leading-none font-semibold">
												{comment.display_name}
											</span>
											{comment.created_at > 0 && (
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<span className="text-muted-foreground shrink-0 cursor-default text-xs">
																{moment
																	.unix(
																		comment.created_at
																	)
																	.fromNow()}
															</span>
														</TooltipTrigger>
														<TooltipContent>
															{moment
																.unix(
																	comment.created_at
																)
																.format(
																	'MMMM D, YYYY [at] HH:mm'
																)}
														</TooltipContent>
													</Tooltip>
												</TooltipProvider>
											)}
										</div>
										<div className="item-description discourse-content text-sm leading-relaxed">
											{renderHtml(comment.comment || '')}
										</div>
									</div>
								</div>
							))}
						</div>
					) : isLoading || isFetching ? (
						<div className="divide-y">
							{Array.from({ length: 3 }).map((_, i) => (
								<div
									key={i}
									className="flex gap-3 p-5 sm:p-6"
								>
									<Skeleton className="h-8 w-8 shrink-0 rounded-full" />
									<div className="flex-1 space-y-2 pt-0.5">
										<div className="flex items-center justify-between">
											<Skeleton className="h-3.5 w-28" />
											<Skeleton className="h-3 w-16" />
										</div>
										<Skeleton className="h-3 w-full" />
										<Skeleton className="h-3 w-4/5" />
										<Skeleton className="h-3 w-2/3" />
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="space-y-3 p-5 sm:p-7">
							{topicUrl && (
								<a
									href={topicUrl}
									target="_blank"
									rel="noreferrer"
									className="border-primary text-primary inline-flex border-b border-dashed text-sm"
								>
									{__('Discuss on forum')}
								</a>
							)}
							<p className="text-muted-foreground">
								{__(
									'No comments yet. Be the first to start the conversation!'
								)}
							</p>
							{topicUrl && (
								<a
									href={topicUrl}
									target="_blank"
									rel="noreferrer"
									className="border-primary text-primary hover:bg-primary/10 inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors"
								>
									{__('Start commenting')}
								</a>
							)}
						</div>
					)}
				</CardContent>
				{topicUrl && hasComments && (
					<CardFooter className="border-border justify-center border-t text-center">
						<a
							href={topicUrl}
							target="_blank"
							rel="noreferrer"
							className="border-primary text-primary border-b border-dashed text-sm"
						>
							{__('View more comments')}
						</a>
					</CardFooter>
				)}
			</Card>
		</div>
	);
}
