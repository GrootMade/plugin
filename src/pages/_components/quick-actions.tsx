import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link } from '@/router';
import { Palette, Puzzle, RefreshCw, Settings } from 'lucide-react';

const actionClassBase =
	'flex items-center rounded-lg border border-border/80 bg-card font-medium text-card-foreground shadow-sm no-underline ring-0 transition-[box-shadow,background-color,border-color] hover:border-ring/40 hover:bg-muted/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

type Props = {
	compact?: boolean;
};

export default function QuickActions({ compact = false }: Props) {
	const actionClass = cn(
		actionClassBase,
		compact
			? 'gap-2 px-3 py-2.5 text-xs sm:text-sm'
			: 'gap-3 px-4 py-3.5 text-sm'
	);

	return (
		<div
			className={cn(
				'grid grid-cols-2 lg:grid-cols-4',
				compact ? 'gap-2' : 'gap-3'
			)}
		>
			<Link
				to="/item/:slug/:page?"
				params={{ slug: 'theme' }}
				className={actionClass}
			>
				<Palette
					className={cn(
						'text-primary shrink-0',
						compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
					)}
				/>
				{__('Browse Themes')}
			</Link>

			<Link
				to="/item/:slug/:page?"
				params={{ slug: 'plugin' }}
				className={actionClass}
			>
				<Puzzle
					className={cn(
						'text-primary shrink-0',
						compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
					)}
				/>
				{__('Browse Plugins')}
			</Link>

			<Link
				to="/updates"
				className={actionClass}
			>
				<RefreshCw
					className={cn(
						'text-primary shrink-0',
						compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
					)}
				/>
				{__('Manage Updates')}
			</Link>

			<Link
				to="/settings"
				className={actionClass}
			>
				<Settings
					className={cn(
						'text-primary shrink-0',
						compact ? 'h-3.5 w-3.5' : 'h-4 w-4'
					)}
				/>
				{__('Settings')}
			</Link>
		</div>
	);
}
