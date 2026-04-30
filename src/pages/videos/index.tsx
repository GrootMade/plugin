import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { VideoCollection } from '@/types/video';
import { PlayCircle, SearchX } from 'lucide-react';

function getYouTubeEmbedUrl(url: string): string | null {
	try {
		const parsed = new URL(url);
		const watchId = parsed.searchParams.get('v');
		if (watchId) {
			return `https://www.youtube.com/embed/${watchId}`;
		}

		if (parsed.hostname.includes('youtu.be')) {
			const id = parsed.pathname.replace('/', '');
			return id.length > 0 ? `https://www.youtube.com/embed/${id}` : null;
		}
	} catch {
		return null;
	}

	return null;
}

export default function Component() {
	const { data, isLoading, isError } = useApiFetch<VideoCollection>(
		API.videos.read
	);

	return (
		<AppPageShell
			title={__('Videos')}
			description={__('Watch official GrootMade video resources.')}
			breadcrump={[{ label: __('Videos') }]}
			isLoading={isLoading}
			isError={isError}
			error={
				<EmptyState
					icon={SearchX}
					title={__('Could not load videos')}
					description={__(
						'Try refreshing the page or open our YouTube channel directly.'
					)}
					action={{
						label: __('Open YouTube'),
						href: 'https://www.youtube.com/watch?v=6rsqChgT-2A'
					}}
				/>
			}
		>
			<Card className="border-border/80 bg-background/95 overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/20 flex flex-row items-center justify-between border-b py-3">
					<h2 className="font-heading text-sm font-semibold tracking-tight sm:text-base">
						{__('Videos')}
					</h2>
				</CardHeader>
				<CardContent className="p-4 sm:p-5">
					<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
						{(data ?? []).map((video) => {
							const embedUrl = getYouTubeEmbedUrl(video.url);
							if (!embedUrl) {
								return null;
							}

							return (
								<article
									key={video.url}
									className="border-border/70 bg-background overflow-hidden rounded-lg border shadow-sm"
								>
									<iframe
										src={embedUrl}
										title={video.title}
										loading="lazy"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										referrerPolicy="strict-origin-when-cross-origin"
										allowFullScreen
										className="aspect-video w-full"
									/>
									<div className="flex items-center justify-between gap-2 p-3">
										<div className="flex min-w-0 items-center gap-2">
											<PlayCircle className="text-primary h-4 w-4 shrink-0" />
											<p className="text-foreground truncate text-sm font-medium">
												{video.title}
											</p>
										</div>
										<a
											href={video.url}
											target="_blank"
											rel="noreferrer"
											className="text-primary text-xs font-medium underline-offset-4 hover:underline"
										>
											{__('Open')}
										</a>
									</div>
								</article>
							);
						})}
					</div>
					{data && data.length === 0 ? (
						<div className="text-muted-foreground p-6 text-center text-sm">
							{__('No videos found yet.')}
						</div>
					) : null}
				</CardContent>
			</Card>
		</AppPageShell>
	);
}
