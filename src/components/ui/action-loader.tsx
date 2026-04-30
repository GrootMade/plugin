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
						'text-primary size-4 animate-spin',
						iconClassName
					)}
				/>
				{showPulse && (
					<span className="bg-primary/70 absolute inline-flex size-2 animate-ping rounded-full opacity-70" />
				)}
			</span>
			{label ? (
				<span className="text-muted-foreground text-xs font-medium">
					{label}
				</span>
			) : null}
		</span>
	);
}
