import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type Props = {
	children: ReactNode;
	className?: string;
	/** Optional section heading (use with description for accessible structure) */
	title?: ReactNode;
	description?: ReactNode;
	/** Extra nodes on the right of the title row (e.g. link) */
	actions?: ReactNode;
};

export function PageSection({
	children,
	className,
	title,
	description,
	actions
}: Props) {
	const hasHeader = title != null || description != null || actions != null;

	return (
		<section className={cn('flex flex-col gap-4 sm:gap-5', className)}>
			{hasHeader ? (
				<div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
					<div className="min-w-0 space-y-1">
						{title != null ? (
							<h2 className="font-heading text-foreground text-lg font-semibold tracking-tight">
								{title}
							</h2>
						) : null}
						{description != null ? (
							<div className="text-muted-foreground text-sm">
								{description}
							</div>
						) : null}
					</div>
					{actions ? (
						<div className="flex shrink-0 flex-wrap gap-2">
							{actions}
						</div>
					) : null}
				</div>
			) : null}
			{children}
		</section>
	);
}
