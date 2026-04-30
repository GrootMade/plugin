import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link } from '@/router';
import { Layers } from 'lucide-react';
import { ClassNameValue } from 'tailwind-merge';

type Props = {
	className?: ClassNameValue;
};

export default function HomeHero({ className }: Props) {
	return (
		<Card
			className={cn(
				'border-border/80 from-muted/40 via-card to-card relative overflow-hidden bg-gradient-to-br',
				className
			)}
		>
			<div
				className="bg-primary/[0.07] pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full blur-3xl"
				aria-hidden
			/>
			<div
				className="bg-chart-2/[0.08] pointer-events-none absolute -bottom-32 -left-16 h-56 w-56 rounded-full blur-3xl"
				aria-hidden
			/>
			<CardContent className="relative flex flex-col gap-5 pt-8 sm:flex-row sm:items-center sm:gap-8 sm:pt-10">
				<div className="border-border/80 bg-background/80 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm backdrop-blur-sm">
					<Layers
						className="text-primary h-7 w-7"
						strokeWidth={1.75}
						aria-hidden
					/>
				</div>
				<div className="min-w-0 flex-1 space-y-2">
					<h2 className="font-heading text-foreground text-xl font-semibold tracking-tight sm:text-2xl">
						<span>
							{__(
								'Unlimited themes, plugins and template kits,'
							)}{' '}
						</span>
						<span className="text-primary">
							{__('all in one place')}
						</span>
					</h2>
					<p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
						{__(
							'Access an unrivaled range of quality themes, plugins and template kits, with one simple subscription for a fraction of cost'
						)}
					</p>
				</div>
			</CardContent>
			<CardFooter className="border-border/80 bg-muted/20 relative flex flex-col gap-3 border-t py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
				<p className="text-muted-foreground text-xs sm:text-sm">
					{__(
						'Start with popular themes or open the catalog from the sidebar.'
					)}
				</p>
				<Button
					asChild
					size="sm"
					className="w-full sm:w-auto"
				>
					<Link
						to="/popular/:slug?"
						params={{ slug: 'theme' }}
						className="no-underline"
					>
						{__('Get started')}
					</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
