import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Props = {
	icon?: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		/** In-app navigation */
		to?: string;
		/** External URL */
		href?: string;
		onClick?: () => void;
	};
	children?: ReactNode;
	className?: string;
};

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	children,
	className
}: Props) {
	return (
		<Card
			className={cn(
				'border-border/80 bg-muted/20 border-dashed shadow-none',
				className
			)}
		>
			<CardContent className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:px-10 sm:py-14">
				{Icon ? (
					<div className="bg-muted/80 text-muted-foreground flex h-14 w-14 items-center justify-center rounded-2xl">
						<Icon
							className="h-7 w-7"
							strokeWidth={1.5}
						/>
					</div>
				) : null}
				<div className="max-w-md space-y-2">
					<h2 className="font-heading text-foreground text-lg font-semibold">
						{title}
					</h2>
					{description ? (
						<p className="text-muted-foreground text-sm leading-relaxed">
							{description}
						</p>
					) : null}
				</div>
				{action ? (
					action.to ? (
						<Button asChild>
							<Link to={action.to}>{action.label}</Link>
						</Button>
					) : action.href ? (
						<Button asChild>
							<a
								href={action.href}
								target="_blank"
								rel="noopener noreferrer"
							>
								{action.label}
							</a>
						</Button>
					) : (
						<Button
							type="button"
							onClick={action.onClick}
						>
							{action.label}
						</Button>
					)
				) : null}
				{children}
			</CardContent>
		</Card>
	);
}
