import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { siteConfig } from '@/config/site';
import useActivation from '@/hooks/use-activation';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ArrowUpRight, CrownIcon, SparklesIcon } from 'lucide-react';

type AdTier = 'free' | 'pro' | 'lifetime';

function useAdTier(): AdTier {
	const { activated, active, data } = useActivation();
	if (!activated || !active || !data?.download_allowed) return 'free';
	if (data?.plan_type === 'recurring' || data?.plan_type === 'onetime')
		return 'pro';
	return 'lifetime';
}

const tierContent: Record<
	AdTier,
	{ title: string; description: string; button: string; href: string }
> = {
	free: {
		title: __('Unlock Full Access'),
		description: __(
			'Get unlimited downloads, auto-updates, and bulk actions. Activate your license to get started.'
		),
		button: __('View Plans'),
		href: `${siteConfig.provider}/pricing`
	},
	pro: {
		title: __('Go Lifetime'),
		description: __(
			'Upgrade to a lifetime plan for unlimited access with no recurring fees.'
		),
		button: __('Upgrade'),
		href: `${siteConfig.provider}/pricing`
	},
	lifetime: {
		title: __('Thank You!'),
		description: __(
			"You're on a lifetime plan. Enjoy unlimited access, priority support, and all premium features."
		),
		button: __('Visit Website'),
		href: siteConfig.provider
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
				'animate-reveal no-underline',
				isThankYou
					? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
					: 'border-l-2 border-l-primary/60 hover:bg-accent',
				className
			)}
			style={style}
		>
			<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
				<div
					className={cn(
						'flex size-8 shrink-0 items-center justify-center rounded-md p-1.5',
						isThankYou
							? 'bg-emerald-500/20 text-emerald-600'
							: 'bg-amber-500/15 text-amber-500'
					)}
				>
					{isThankYou ? <SparklesIcon /> : <CrownIcon />}
				</div>
				<h3 className="text-base font-semibold tracking-tight text-card-foreground">
					{content.title}
				</h3>
			</div>

			<p className="flex-1 text-sm leading-relaxed text-muted-foreground">
				{content.description}
			</p>

			<Button
				variant={isThankYou ? 'secondary' : 'default'}
				size="sm"
				className="pointer-events-none w-full gap-1.5"
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
			className={cn(cardClass, 'select-none items-stretch', className)}
			style={style}
		>
			<div className="flex w-full flex-row flex-wrap items-center gap-x-3 gap-y-2">
				<Skeleton className="h-8 w-8 shrink-0 rounded-md" />
				<div className="w-2/3">
					<Skeleton className="h-5">&nbsp;</Skeleton>
				</div>
			</div>
			<div className="flex flex-col gap-1">
				<Skeleton className="h-4 w-full">&nbsp;</Skeleton>
				<Skeleton className="h-4 w-2/3">&nbsp;</Skeleton>
			</div>
			<Skeleton className="h-8 w-full rounded-md">&nbsp;</Skeleton>
		</div>
	);
}
