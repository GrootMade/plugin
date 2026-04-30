import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { DocumentationTopicDetail } from '@/types/documentation';
import {
	ArrowLeft,
	ExternalLink,
	MessageSquare,
	SearchX,
	ThumbsUp
} from 'lucide-react';
import moment from 'moment';
import { Link, useParams } from 'react-router-dom';

function normalizeCookedHtml(html?: string) {
	if (!html) {
		return '';
	}

	let normalized = html;

	// Remove auto-generated heading anchors that clutter headings in app view.
	normalized = normalized.replace(/<a[^>]*class="anchor"[^>]*><\/a>/gi, '');

	// Convert Discourse checklist placeholders to lightweight visual boxes.
	normalized = normalized.replace(
		/<span[^>]*class="[^"]*chcklst-box[^"]*"[^>]*><\/span>/gi,
		'<span class="docs-checklist-box" aria-hidden="true"></span>'
	);

	// Convert broken image placeholder markup to readable fallback chip.
	normalized = normalized.replace(
		/<span[^>]*class="[^"]*broken-image[^"]*"[^>]*>[\s\S]*?<\/span>/gi,
		'<span class="docs-broken-image">Image unavailable</span>'
	);

	return normalized;
}

export default function Component() {
	const { id } = useParams();
	const topicId = Number(id);
	const enabled = Number.isFinite(topicId) && topicId > 0;

	const { data, isLoading, isError } = useApiFetch<
		DocumentationTopicDetail,
		{ id: number }
	>(API.documentation.readTopic, { id: topicId }, enabled);

	const renderedHtml = normalizeCookedHtml(data?.cooked);

	return (
		<AppPageShell
			title={data?.title || __('Documentation Topic')}
			description={__('Read documentation content inside the plugin.')}
			breadcrump={[
				{ label: __('Documentation'), href: '/docs' },
				{ label: data?.title || __('Topic') }
			]}
			isLoading={isLoading}
			isError={isError || !enabled}
			error={
				<EmptyState
					icon={SearchX}
					title={__('Could not load topic')}
					description={__(
						'Return to documentation and try opening the topic again.'
					)}
					action={{ label: __('Back to documentation'), to: '/docs' }}
				/>
			}
		>
			<Card className="border-border/80 bg-background/95 overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/20 flex flex-row items-center justify-between gap-2 border-b py-3">
					<div className="flex items-center gap-2">
						<Link
							to="/docs"
							className="text-primary inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline sm:text-sm"
						>
							<ArrowLeft className="h-3.5 w-3.5" />
							{__('Back')}
						</Link>
					</div>
					{data?.external_url ? (
						<a
							href={data.external_url}
							target="_blank"
							rel="noreferrer"
							className="text-primary inline-flex items-center gap-1 text-xs font-medium underline-offset-4 hover:underline sm:text-sm"
						>
							{__('Open original')}
							<ExternalLink className="h-3.5 w-3.5" />
						</a>
					) : null}
				</CardHeader>
				<CardContent className="space-y-4 p-4 sm:p-5">
					<div className="space-y-2">
						<h1 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
							{data?.title}
						</h1>
						<div className="flex flex-wrap items-center gap-1.5">
							{data?.last_posted_at ? (
								<Badge
									variant="secondary"
									size="sm"
									className="text-muted-foreground font-normal"
								>
									{moment(data.last_posted_at).fromNow()}
								</Badge>
							) : null}
							{typeof data?.posts_count === 'number' ? (
								<Badge
									variant="secondary"
									size="sm"
									className="text-muted-foreground font-normal"
								>
									<MessageSquare className="mr-1 h-3 w-3" />
									{data.posts_count}
								</Badge>
							) : null}
							{typeof data?.views === 'number' ? (
								<Badge
									variant="secondary"
									size="sm"
									className="text-muted-foreground font-normal"
								>
									{`${data.views.toLocaleString()} views`}
								</Badge>
							) : null}
							{typeof data?.like_count === 'number' &&
							data.like_count > 0 ? (
								<Badge
									variant="secondary"
									size="sm"
									className="text-muted-foreground font-normal"
								>
									<ThumbsUp className="mr-1 h-3 w-3" />
									{data.like_count}
								</Badge>
							) : null}
						</div>
					</div>

					<div className="border-border/70 bg-background rounded-lg border p-4">
						<div
							className="discourse-content docs-topic-content prose prose-sm dark:prose-invert max-w-none"
							dangerouslySetInnerHTML={{ __html: renderedHtml }}
						/>
					</div>
				</CardContent>
			</Card>
		</AppPageShell>
	);
}
