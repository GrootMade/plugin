import useDataCollection from '@/hooks/use-data-collection';
import { __ } from '@/lib/i18n';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import FilterItem from './filter-item';
import PerPage from './filter-per-page';
import FilterSheet from './filter-sheet';
import Search from './search-input';
import FilterToolbar from './toolbars';
type Props = {
	collection: ReturnType<typeof useDataCollection>;
	meta?: React.ReactNode;
};
export default function FilterBar({ collection, meta }: Props) {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex flex-row flex-wrap items-center justify-between gap-2">
				<Search collection={collection} />
				<div className="flex flex-row flex-wrap items-center justify-end gap-2">
					{meta}
					<PerPage collection={collection} />
					<FilterToolbar
						label={__('Order By')}
						collection={collection}
					/>
				</div>
			</div>
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
								<span>{__('Clear Filters')}</span>{' '}
								<X size="14" />
							</Button>
						)}
					</>
				)}
			</div>
		</div>
	);
}
