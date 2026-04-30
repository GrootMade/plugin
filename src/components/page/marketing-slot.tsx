import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
};

/** Consistent vertical rhythm around promotional / ad blocks */
export function MarketingSlot({ children, className }: Props) {
	return (
		<div
			className={cn('py-1 *:rounded-lg first:pt-0 last:pb-0', className)}
		>
			{children}
		</div>
	);
}
