import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import useActivation from '@/hooks/use-activation';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ArrowUpRight, CrownIcon } from 'lucide-react';

type AdTier = 'free' | 'pro' | 'lifetime';

function useAdTier(): AdTier {
	const { activated, active, data } = useActivation();
	if (!activated || !active || !data?.download_allowed) return 'free';
	if (data?.gold) return 'lifetime';
	if (data?.plan_type === 'recurring' || data?.plan_type === 'onetime')
		return 'pro';
	return 'lifetime';
}

const tierBanner: Record<
	AdTier,
	{ name: string; description: string; button: string; href: string }
> = {
	free: {
		name: __('Unlock Full Access'),
		description: __(
			'Get unlimited downloads, auto-updates, and bulk actions with a membership plan.'
		),
		button: __('View Plans'),
		href: `${siteConfig.provider}/pricing`
	},
	pro: {
		name: __('Go Lifetime'),
		description: __(
			'Upgrade to a lifetime plan for unlimited access with no recurring fees.'
		),
		button: __('Upgrade'),
		href: `${siteConfig.provider}/pricing`
	},
	lifetime: {
		name: __('Thank You!'),
		description: __(
			"You're on a lifetime plan. Enjoy unlimited access and premium features."
		),
		button: __('Visit Website'),
		href: siteConfig.provider
	}
};

export default function AdBanner() {
	const tier = useAdTier();
	const content = tierBanner[tier];
	const isThankYou = tier === 'lifetime';

	return (
		<a
			href={content.href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'flex flex-row items-center gap-3 rounded-lg border px-3 py-2.5 no-underline transition-colors md:px-4',
				isThankYou
					? 'border-emerald-500/35 bg-linear-to-r from-emerald-500/12 via-emerald-500/6 to-transparent hover:from-emerald-500/18 hover:via-emerald-500/8'
					: 'border-l-primary/60 bg-card hover:bg-accent border-l-2'
			)}
		>
			<CrownIcon
				className={cn(
					'size-3.5 shrink-0 sm:size-4',
					isThankYou ? 'text-emerald-500' : 'text-warning'
				)}
			/>

			<div
				className={cn(
					'mr-auto text-xs leading-tight sm:text-sm',
					isThankYou
						? 'text-emerald-800/80 dark:text-emerald-200/80'
						: 'text-muted-foreground'
				)}
			>
				<strong
					className={cn(
						'font-medium',
						isThankYou
							? 'text-emerald-900 dark:text-emerald-100'
							: 'text-foreground'
					)}
				>
					{content.name}
				</strong>
				: {content.description}
			</div>

			<Button
				variant={isThankYou ? 'secondary' : 'default'}
				size="sm"
				className="pointer-events-none hidden shrink-0 gap-1.5 leading-none sm:inline-flex"
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
