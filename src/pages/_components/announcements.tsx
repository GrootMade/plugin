import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __, sprintf } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { AnnouncementItemType } from '@/types/announcement';
import moment from 'moment';
import { ClassNameValue } from 'tailwind-merge';

type Props = {
	className?: ClassNameValue;
	variant?: 'default' | 'compact';
};

const COMPACT_MAX_ITEMS = 3;

export default function Announcements({
	className,
	variant = 'default'
}: Props) {
	const { data: announcements } = useApiFetch<AnnouncementItemType[]>(
		API.announcement.read
	);
	const compact = variant === 'compact';
	const list =
		compact && announcements?.length
			? announcements.slice(0, COMPACT_MAX_ITEMS)
			: announcements;

	return (
		<Card
			className={cn('flex min-h-0 flex-col overflow-hidden', className)}
		>
			<CardHeader
				className={cn(
					'border-border/80 bg-muted/30 flex shrink-0 flex-row items-center justify-between space-y-0 border-b',
					compact ? 'py-2.5' : 'py-4'
				)}
			>
				<h3
					className={cn(
						'font-heading font-semibold tracking-tight',
						compact ? 'text-sm' : 'text-base'
					)}
				>
					{__('Announcements')}
				</h3>
				<a
					href="https://meta.grootmade.com/c/announcements/6"
					target="_blank"
					className={cn(
						'text-primary font-medium underline-offset-4 hover:underline',
						compact ? 'text-xs' : 'text-sm'
					)}
					rel="noreferrer"
				>
					{__('View All')}
				</a>
			</CardHeader>
			<CardContent
				className={cn(
					'min-h-0 flex-1 overflow-y-auto',
					compact
						? 'pt-3 pb-4'
						: 'pt-4 pb-6 lg:max-h-[min(26rem,50vh)]'
				)}
			>
				{list && list.length > 0 ? (
					<div className="flex flex-col divide-y">
						{list.map((item) => (
							<div
								key={item.id}
								className={cn(
									'flex flex-col justify-between gap-1 first:pt-0 last:pb-0 lg:flex-row lg:items-center',
									compact
										? 'py-2.5 text-xs sm:text-sm'
										: 'gap-2 py-4 text-sm'
								)}
							>
								<div>
									<a
										href={`https://meta.grootmade.com/t/${item.slug}/${item.id}`}
										target="_blank"
										className="hover:text-muted-foreground transition-colors"
										rel="noreferrer"
									>
										{item.title}
									</a>
									{item.excerpt && (
										<p
											className={cn(
												'text-muted-foreground mt-1',
												compact
													? 'line-clamp-1 text-[11px] sm:text-xs'
													: 'line-clamp-2 text-xs sm:text-sm'
											)}
										>
											{item.excerpt}
										</p>
									)}
								</div>
								<div
									className={cn(
										'text-muted-foreground whitespace-nowrap',
										compact && 'text-[11px] sm:text-xs'
									)}
								>
									{sprintf(
										__('Updated %s'),
										moment(item.last_posted_at).fromNow()
									)}
								</div>
							</div>
						))}
					</div>
				) : (
					<div
						className={cn(
							'text-muted-foreground text-center italic',
							compact ? 'text-xs' : 'text-sm'
						)}
					>
						{__('No new announcements')}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
