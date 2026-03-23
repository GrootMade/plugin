import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ActionLoaderProps = {
	label?: string;
	className?: string;
	iconClassName?: string;
	showPulse?: boolean;
};

export default function ActionLoader({
	label,
	className,
	iconClassName,
	showPulse = true
}: ActionLoaderProps) {
	return (
		<span
			role="status"
			aria-live="polite"
			className={cn('inline-flex items-center gap-2', className)}
		>
			<span className="relative inline-flex items-center justify-center">
				<Loader2
					className={cn(
						'size-4 animate-spin text-primary',
						iconClassName
					)}
				/>
				{showPulse && (
					<span className="absolute inline-flex size-2 animate-ping rounded-full bg-primary/70 opacity-70" />
				)}
			</span>
			{label ? (
				<span className="text-xs font-medium text-muted-foreground">
					{label}
				</span>
			) : null}
		</span>
	);
}
