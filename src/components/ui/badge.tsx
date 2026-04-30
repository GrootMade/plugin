import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
	'inline-flex items-center gap-1 rounded-md border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 [&_svg]:pointer-events-none [&_svg]:size-3 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default:
					'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				destructive:
					'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
				outline: 'text-foreground',
				background: 'bg-background text-background-foreground',
				success:
					'border-transparent bg-success text-success-foreground shadow-sm',
				info: 'border-transparent bg-primary/10 text-primary',
				gold: 'border border-yellow-500/40 bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
				silver: 'border border-border bg-muted text-muted-foreground',
				bronze: 'border border-orange-600/40 bg-orange-600/15 text-orange-700 dark:text-orange-400'
			},
			size: {
				sm: 'text-xs px-2 py-0.5',
				md: 'text-sm px-2.5 py-1',
				lg: 'text-base px-4 py-2'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'sm'
		}
	}
);

export interface BadgeProps
	extends
		React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
	return (
		<div
			className={cn(badgeVariants({ variant, size }), className)}
			{...props}
		/>
	);
}

export { Badge, badgeVariants };
