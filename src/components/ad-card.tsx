import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import useActivation from '@/hooks/use-activation';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import {
	ArrowUpRight,
	CrownIcon,
	DownloadIcon,
	InfinityIcon,
	RefreshCwIcon,
	ShieldCheckIcon,
	SparklesIcon,
	ZapIcon
} from 'lucide-react';

type AdTier = 'free' | 'pro' | 'lifetime';

function useAdTier(): AdTier {
	const { activated, active, data } = useActivation();
	if (!activated || !active || !data?.download_allowed) return 'free';
	if (data?.gold) return 'lifetime';
	if (data?.plan_type === 'recurring' || data?.plan_type === 'onetime')
		return 'pro';
	return 'lifetime';
}

const tierContent: Record<
	AdTier,
	{
		title: string;
		button: string;
		href: string;
		highlights: Array<{
			label: string;
			value: string;
			icon: React.ReactNode;
		}>;
	}
> = {
	free: {
		title: __('Unlock Full Access'),
		button: __('View Plans'),
		href: `${siteConfig.provider}/pricing`,
		highlights: [
			{
				label: __('Downloads'),
				value: __('Unlimited'),
				icon: <DownloadIcon />
			},
			{
				label: __('Updates'),
				value: __('Automatic'),
				icon: <RefreshCwIcon />
			},
			{
				label: __('Bulk Actions'),
				value: __('Enabled'),
				icon: <ZapIcon />
			},
			{
				label: __('Support'),
				value: __('Priority'),
				icon: <ShieldCheckIcon />
			}
		]
	},
	pro: {
		title: __('Go Lifetime'),
		button: __('Upgrade'),
		href: `${siteConfig.provider}/pricing`,
		highlights: [
			{
				label: __('Billing'),
				value: __('One-time'),
				icon: <CrownIcon />
			},
			{
				label: __('Access'),
				value: __('Forever'),
				icon: <InfinityIcon />
			},
			{
				label: __('Updates'),
				value: __('Lifetime'),
				icon: <RefreshCwIcon />
			},
			{
				label: __('Support'),
				value: __('Priority'),
				icon: <ShieldCheckIcon />
			}
		]
	},
	lifetime: {
		title: __('Thank You!'),
		button: __('Visit Website'),
		href: siteConfig.provider,
		highlights: [
			{
				label: __('Plan'),
				value: __('Lifetime'),
				icon: <CrownIcon />
			},
			{
				label: __('Downloads'),
				value: __('Unlimited'),
				icon: <DownloadIcon />
			},
			{
				label: __('Updates'),
				value: __('Automatic'),
				icon: <RefreshCwIcon />
			},
			{
				label: __('Support'),
				value: __('Priority'),
				icon: <ShieldCheckIcon />
			}
		]
	}
};

const cardClass =
	'group relative flex flex-col items-start gap-4 w-full border bg-card p-5 rounded-lg text-card-foreground transition duration-100 ease-out transform-gpu after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:border-4 after:border-background';

type AdCardProps = {
	style?: React.CSSProperties;
	className?: string;
};

export default function AdCard({ style, className }: AdCardProps) {
	const tier = useAdTier();
	const content = tierContent[tier];
	const isThankYou = tier === 'lifetime';

	return (
		<a
			href={content.href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				cardClass,
				'hover:border-ring hover:bg-accent no-underline',
				className
			)}
			style={style}
		>
			{/* Hero banner — matches thumbnail area */}
			<div
				className={cn(
					'flex h-24 w-full items-center justify-center rounded-md',
					isThankYou
						? 'bg-linear-to-br from-emerald-500/20 via-emerald-500/10 to-transparent'
						: 'from-primary/15 via-primary/5 bg-linear-to-br to-transparent'
				)}
			>
				{isThankYou ? (
					<SparklesIcon className="size-10 text-emerald-500 opacity-60" />
				) : (
					<CrownIcon className="text-warning size-10 opacity-60" />
				)}
			</div>

			{/* Icon + title row — matches PostGridItem */}
			<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
				<div
					className={cn(
						'flex size-8 shrink-0 items-center justify-center rounded-md border p-1.5',
						isThankYou
							? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600'
							: 'border-amber-500/30 bg-amber-500/10 text-amber-500'
					)}
				>
					{isThankYou ? <SparklesIcon /> : <CrownIcon />}
				</div>
				<div className="min-w-0 flex-1">
					<h3 className="truncate text-base font-semibold tracking-tight">
						{content.title}
					</h3>
					<span className="text-muted-foreground text-xs">
						{siteConfig.name}
					</span>
				</div>
			</div>

			{/* Insights list — matches PostGridItem */}
			<div className="flex w-full flex-1 flex-col">
				<ul className="mt-auto w-full text-xs">
					{content.highlights.map(({ label, value, icon }) => (
						<li
							key={label}
							className="flex items-center gap-3 py-1"
						>
							<p className="text-muted-foreground flex min-w-0 items-center gap-1.5">
								<span className="h-[1.1em] w-[1.1em] shrink-0 opacity-75 [&>svg]:h-full [&>svg]:w-full">
									{icon}
								</span>
								<span className="flex-1 truncate">{label}</span>
							</p>
							<hr className="min-w-2 flex-1" />
							<span className="shrink-0 font-medium tabular-nums">
								{value}
							</span>
						</li>
					))}
				</ul>
			</div>

			{/* CTA button — matches PostGridItem button row */}
			<Button
				variant={isThankYou ? 'secondary' : 'default'}
				size="sm"
				className="pointer-events-none mt-auto w-full gap-1.5"
				asChild
			>
				<span>
					{content.button}
					<ArrowUpRight className="size-3.5" />
				</span>
			</Button>
		</a>
	);
}

export function AdCardSkeleton({ style, className }: AdCardProps) {
	return (
		<div
			className={cn(cardClass, 'items-stretch select-none', className)}
			style={style}
		>
			<Skeleton className="h-24 w-full rounded-md" />
			<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
				<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
				<div className="w-2/3">
					<Skeleton className="h-5 w-full" />
				</div>
			</div>
			<ul className="mt-auto w-full text-xs">
				<li className="flex items-center gap-3 py-1">
					<Skeleton className="h-4 w-16" />
					<hr className="min-w-2 flex-1" />
					<Skeleton className="h-4 w-12" />
				</li>
				<li className="flex items-center gap-3 py-1">
					<Skeleton className="h-4 w-16" />
					<hr className="min-w-2 flex-1" />
					<Skeleton className="h-4 w-14" />
				</li>
				<li className="flex items-center gap-3 py-1">
					<Skeleton className="h-4 w-16" />
					<hr className="min-w-2 flex-1" />
					<Skeleton className="h-4 w-20" />
				</li>
			</ul>
			<Skeleton className="h-8 w-full rounded-md" />
		</div>
	);
}
