import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { DocumentationTopicCollection } from '@/types/documentation';
import {
	ArrowRight,
	BookOpen,
	MessageSquare,
	Search,
	SearchX,
	ThumbsUp
} from 'lucide-react';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

function getTopicExcerpt(excerpt?: string) {
	const text = excerpt?.trim();
	if (text) {
		return text;
	}

	return __('Open this topic to read the full documentation guide.');
}

export default function Component() {
	const [query, setQuery] = useState('');
	const { data, isLoading, isError } =
		useApiFetch<DocumentationTopicCollection>(API.documentation.read);

	const filteredTopics = useMemo(() => {
		if (!data) {
			return [];
		}

		const normalizedQuery = query.trim().toLowerCase();
		if (!normalizedQuery) {
			return data;
		}

		return data.filter((topic) => {
			const title = topic.title?.toLowerCase() ?? '';
			const excerpt = topic.excerpt?.toLowerCase() ?? '';
			return (
				title.includes(normalizedQuery) ||
				excerpt.includes(normalizedQuery)
			);
		});
	}, [data, query]);

	return (
		<AppPageShell
			title={__('Documentation')}
			description={__(
				'Browse the latest documentation topics from the community forum.'
			)}
			breadcrump={[{ label: __('Documentation') }]}
			isLoading={isLoading}
			isError={isError}
			error={
				<EmptyState
					icon={SearchX}
					title={__('Could not load documentation')}
					description={__(
						'Try refreshing the page or open the forum directly.'
					)}
					action={{
						label: __('Open documentation forum'),
						href: 'https://meta.grootmade.com/c/documentation/8'
					}}
				/>
			}
		>
			<div className="mx-auto w-full max-w-5xl">
				<Card className="border-border/80 bg-background/95 overflow-hidden">
					<CardHeader className="border-border/80 bg-muted/20 flex flex-row items-center justify-between border-b py-3">
						<h2 className="font-heading text-sm font-semibold tracking-tight sm:text-base">
							{__('Latest Topics')}
						</h2>
						<a
							href="https://meta.grootmade.com/c/documentation/8"
							target="_blank"
							rel="noreferrer"
							className="text-primary inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline sm:text-sm"
						>
							{__('Open forum')}
							<ArrowRight className="h-3.5 w-3.5" />
						</a>
					</CardHeader>
					<CardContent className="p-4 sm:p-5">
						<div className="mb-4">
							<div className="relative">
								<Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
								<Input
									value={query}
									onChange={(event) =>
										setQuery(event.target.value)
									}
									placeholder={__('Search topics...')}
									className="h-10 pl-9"
								/>
							</div>
						</div>

						{data && data.length > 0 ? (
							filteredTopics.length > 0 ? (
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{filteredTopics.map((topic) => (
										<Link
											key={topic.id}
											to={`/docs/${topic.id}`}
											className="group border-border/70 bg-background hover:border-primary/40 flex min-h-29.5 flex-col justify-between rounded-lg border p-3 no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow"
										>
											<div className="flex items-start gap-3">
												<div className="border-border/70 bg-muted/20 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors">
													<BookOpen className="h-4 w-4" />
												</div>
												<div className="min-w-0 flex-1">
													<h3 className="text-foreground line-clamp-2 text-sm font-semibold sm:text-[15px]">
														{topic.title}
													</h3>
													<p className="text-muted-foreground mt-1.5 line-clamp-2 text-xs sm:text-[13px]">
														{getTopicExcerpt(
															topic.excerpt
														)}
													</p>
												</div>
											</div>
											<div className="mt-3 flex flex-wrap items-center gap-1.5">
												<Badge
													variant="secondary"
													size="sm"
													className="text-muted-foreground font-normal"
												>
													{moment(
														topic.last_posted_at
													).fromNow()}
												</Badge>
												{typeof topic.posts_count ===
													'number' && (
													<Badge
														variant="secondary"
														size="sm"
														className="text-muted-foreground font-normal"
													>
														<MessageSquare className="mr-1 h-3 w-3" />
														{topic.posts_count}
													</Badge>
												)}
												{typeof topic.views ===
													'number' && (
													<Badge
														variant="secondary"
														size="sm"
														className="text-muted-foreground font-normal"
													>
														{`${topic.views.toLocaleString()} views`}
													</Badge>
												)}
												{typeof topic.like_count ===
													'number' &&
													topic.like_count > 0 && (
														<Badge
															variant="secondary"
															size="sm"
															className="text-muted-foreground font-normal"
														>
															<ThumbsUp className="mr-1 h-3 w-3" />
															{topic.like_count}
														</Badge>
													)}
											</div>
										</Link>
									))}
								</div>
							) : (
								<div className="border-border/80 bg-muted/20 text-muted-foreground rounded-lg border border-dashed px-4 py-6 text-center text-sm">
									{__('No topics match your search.')}
								</div>
							)
						) : (
							<div className="text-muted-foreground p-6 text-center text-sm">
								{__('No documentation topics found.')}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</AppPageShell>
	);
}
