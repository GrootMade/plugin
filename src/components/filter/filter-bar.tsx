import useDataCollection from '@/hooks/use-data-collection';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import FilterItem from './filter-item';
import PerPage from './filter-per-page';
import FilterSheet from './filter-sheet';
import Search from './search-input';
import FilterToolbar from './toolbars';

type Props = {
	collection: ReturnType<typeof useDataCollection>;
	meta?: ReactNode;
	/** When set with variant compact, title moves into this bar with filters */
	pageTitle?: string;
	pageDescription?: ReactNode;
	variant?: 'default' | 'compact';
};

export default function FilterBar({
	collection,
	meta,
	pageTitle,
	pageDescription,
	variant = 'default'
}: Props) {
	const compact = variant === 'compact';

	const toolbarRow = (
		<div
			className={cn(
				'flex flex-row flex-wrap items-center justify-between gap-2',
				compact && 'border-border/60 border-t pt-3'
			)}
		>
			<Search
				collection={collection}
				compact={compact}
			/>
			<div className="flex flex-row flex-wrap items-center justify-end gap-2">
				{!compact ? meta : null}
				<PerPage collection={collection} />
				<FilterToolbar
					label={__('Order By')}
					collection={collection}
				/>
			</div>
		</div>
	);

	const chipsRow = (
		<div className="flex flex-row flex-wrap items-center gap-2">
			{collection.options && (
				<>
					{collection.options
						.filter(
							(option) =>
								option.onBarView === true &&
								option.enabled !== false
						)
						.map((option) => {
							return (
								<FilterItem
									key={option.id}
									item={option}
									collection={collection}
								/>
							);
						})}
					<FilterSheet collection={collection} />
					{Object.keys(collection.filter).length > 0 && (
						<Button
							variant="ghost"
							size="sm"
							className="flex flex-row gap-2"
							onClick={collection.clearFilter}
						>
							<span>{__('Clear Filters')}</span> <X size="14" />
						</Button>
					)}
				</>
			)}
		</div>
	);

	if (compact) {
		return (
			<div
				className={cn(
					'border-border/80 bg-card rounded-lg border p-3 shadow-sm sm:p-4',
					'flex flex-col gap-3'
				)}
			>
				<div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
					<div className="min-w-0 flex-1">
						{pageTitle ? (
							<h1 className="font-heading text-foreground text-lg font-semibold tracking-tight sm:text-xl">
								{pageTitle}
							</h1>
						) : null}
						{pageDescription ? (
							<div
								className={cn(
									'text-muted-foreground text-xs leading-snug sm:text-sm',
									pageTitle && 'mt-0.5'
								)}
							>
								{pageDescription}
							</div>
						) : null}
					</div>
					{meta ? (
						<div className="flex flex-wrap items-center justify-end gap-2">
							{meta}
						</div>
					) : null}
				</div>
				{toolbarRow}
				{chipsRow}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			{toolbarRow}
			{chipsRow}
		</div>
	);
}
