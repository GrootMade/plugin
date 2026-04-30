import { AppPageShell } from '@/components/body/page-shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { DocumentationTopicCollection } from '@/types/documentation';
import { useMemo, useState } from '@wordpress/element';
import {
	ArrowUpRight,
	BookOpen,
	MessageSquare,
	Search,
	Sparkles
} from 'lucide-react';
import moment from 'moment';
import { Link } from 'react-router-dom';

const DISCOURSE_BASE = 'https://meta.grootmade.com';
const AI_BOT_USERNAME = 'creative';

function openUrl(url: string) {
	window.open(url, '_blank', 'noopener,noreferrer');
}

export default function Component() {
	const [question, setQuestion] = useState('');

	const { data: topics } = useApiFetch<DocumentationTopicCollection>(
		API.documentation.read
	);

	const suggestedTopics = useMemo(() => {
		const q = question.trim().toLowerCase();
		if (!q || !topics) return [];
		return topics
			.filter((t) => {
				const title = t.title?.toLowerCase() ?? '';
				const excerpt = t.excerpt?.toLowerCase() ?? '';
				return title.includes(q) || excerpt.includes(q);
			})
			.slice(0, 4);
	}, [question, topics]);

	const canSubmit = question.trim().length > 0;

	const handleAskAI = () => {
		if (!canSubmit) return;
		const q = question.trim();
		openUrl(
			`${DISCOURSE_BASE}/new-message?username=${AI_BOT_USERNAME}&title=${encodeURIComponent(q.slice(0, 200))}&body=${encodeURIComponent(q)}`
		);
	};

	const handleSearchForum = () => {
		if (!canSubmit) return;
		openUrl(
			`${DISCOURSE_BASE}/search?q=${encodeURIComponent(question.trim())}`
		);
	};

	const handlePostTopic = () => {
		if (!canSubmit) return;
		const q = question.trim();
		openUrl(
			`${DISCOURSE_BASE}/new-topic?title=${encodeURIComponent(q.slice(0, 200))}&body=${encodeURIComponent(q)}&category=support`
		);
	};

	return (
		<AppPageShell
			title={__('AI Assistant')}
			description={__(
				'Ask a question and get AI-powered help from the GrootMade community.'
			)}
			breadcrump={[{ label: __('AI Assistant') }]}
			showTitle={false}
		>
			<div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
				{/* Header */}
				<div className="border-border/80 bg-card rounded-lg border p-4 shadow-sm sm:p-5">
					<div className="flex items-center gap-3">
						<div className="border-primary/20 bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
							<Sparkles className="h-5 w-5" />
						</div>
						<div className="min-w-0">
							<h1 className="font-heading text-foreground text-lg font-semibold tracking-tight sm:text-xl">
								{__('AI Assistant')}
							</h1>
							<p className="text-muted-foreground mt-0.5 text-xs leading-snug sm:text-sm">
								{__(
									'Get instant help from our AI on the community forum. A forum account is required.'
								)}
							</p>
						</div>
					</div>
				</div>

				{/* Input card */}
				<Card className="border-border/80">
					<CardContent className="flex flex-col gap-3 p-4 sm:p-5">
						<Textarea
							value={question}
							onChange={(e) => setQuestion(e.target.value)}
							onKeyDown={(e) => {
								if (
									e.key === 'Enter' &&
									(e.ctrlKey || e.metaKey)
								) {
									handleAskAI();
								}
							}}
							placeholder={__('What do you need help with?')}
							className="min-h-28 resize-none"
						/>

						<Button
							onClick={handleAskAI}
							disabled={!canSubmit}
							className="w-full gap-2"
						>
							<Sparkles className="h-4 w-4" />
							{__('Ask AI')}
							<ArrowUpRight className="ml-auto h-4 w-4" />
						</Button>

						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={handleSearchForum}
								disabled={!canSubmit}
								className="flex-1 gap-2"
							>
								<Search className="h-4 w-4" />
								{__('Search forum')}
							</Button>
							<Button
								variant="outline"
								onClick={handlePostTopic}
								disabled={!canSubmit}
								className="flex-1 gap-2"
							>
								<MessageSquare className="h-4 w-4" />
								{__('Post support topic')}
							</Button>
						</div>

						<p className="text-muted-foreground text-center text-xs">
							{__(
								'Opens the GrootMade community forum in a new tab.'
							)}{' '}
							<kbd className="border-border rounded border px-1 py-0.5 font-mono text-[10px]">
								Ctrl+Enter
							</kbd>{' '}
							{__('to send.')}
						</p>
					</CardContent>
				</Card>

				{/* Suggested docs from search */}
				{suggestedTopics.length > 0 && (
					<Card className="border-border/80">
						<CardHeader className="border-border/80 bg-muted/20 border-b py-3">
							<h2 className="font-heading text-sm font-semibold tracking-tight">
								{__('Related documentation')}
							</h2>
						</CardHeader>
						<CardContent className="flex flex-col gap-2 p-3">
							{suggestedTopics.map((topic) => (
								<Link
									key={topic.id}
									to={`/docs/${topic.id}`}
									className="group border-border/70 bg-background hover:border-primary/40 flex items-start gap-3 rounded-md border p-3 no-underline transition-all hover:shadow-sm"
								>
									<div className="border-border/70 bg-muted/20 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border">
										<BookOpen className="h-3.5 w-3.5" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-foreground line-clamp-1 text-sm font-medium">
											{topic.title}
										</p>
										{topic.excerpt && (
											<p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
												{topic.excerpt}
											</p>
										)}
									</div>
									<div className="flex shrink-0 flex-wrap items-center gap-1">
										<Badge
											variant="secondary"
											size="sm"
											className="text-muted-foreground font-normal"
										>
											{moment(
												topic.last_posted_at
											).fromNow()}
										</Badge>
									</div>
								</Link>
							))}
						</CardContent>
					</Card>
				)}

				{/* Quick links */}
				<Card className="border-border/80">
					<CardHeader className="border-border/80 bg-muted/20 border-b py-3">
						<h2 className="font-heading text-sm font-semibold tracking-tight">
							{__('Quick links')}
						</h2>
					</CardHeader>
					<CardContent className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
						{[
							{
								label: __('Browse documentation'),
								description: __(
									'Step-by-step guides and tutorials'
								),
								to: '/docs' as const,
								icon: BookOpen
							},
							{
								label: __('Community forum'),
								description: __(
									'Ask questions and get help from the community'
								),
								href: `${DISCOURSE_BASE}/`,
								icon: MessageSquare
							},
							{
								label: __('Support category'),
								description: __(
									'Open a support request on the forum'
								),
								href: `${DISCOURSE_BASE}/c/support/4`,
								icon: Search
							},
							{
								label: __('All AI features'),
								description: __(
									'Explore AI tools available on the forum'
								),
								href: `${DISCOURSE_BASE}/`,
								icon: Sparkles
							}
						].map((item) => {
							const Icon = item.icon;
							const inner = (
								<>
									<div className="border-border/70 bg-muted/20 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded border transition-colors">
										<Icon className="h-4 w-4" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-foreground text-sm font-medium">
											{item.label}
										</p>
										<p className="text-muted-foreground line-clamp-1 text-xs">
											{item.description}
										</p>
									</div>
									{item.href && (
										<ArrowUpRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
									)}
								</>
							);

							const className =
								'group flex items-center gap-3 rounded-md border border-border/70 bg-background p-3 no-underline transition-all hover:border-primary/40 hover:shadow-sm';

							return 'to' in item && item.to ? (
								<Link
									key={item.label}
									to={item.to}
									className={className}
								>
									{inner}
								</Link>
							) : (
								<a
									key={item.label}
									href={item.href}
									target="_blank"
									rel="noreferrer"
									className={className}
								>
									{inner}
								</a>
							);
						})}
					</CardContent>
				</Card>
			</div>
		</AppPageShell>
	);
}
