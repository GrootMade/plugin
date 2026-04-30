import useDataCollection from '@/hooks/use-data-collection';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useEffect, useState } from '@wordpress/element';
import { X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '../ui/input';

type Props = {
	collection: ReturnType<typeof useDataCollection>;
	/** Slightly shorter field for compact listing toolbars */
	compact?: boolean;
};
export default function Search({ collection, compact = false }: Props) {
	const [text, setText] = useState<string>(collection.search?.keyword ?? '');
	const debounced = useDebouncedCallback((value: string) => {
		collection.setSearch(value);
	}, 500);
	useEffect(() => {
		setText(collection.search?.keyword || '');
	}, [collection.search?.keyword]);
	return (
		<div
			className={cn(
				'relative w-full min-w-0',
				compact ? 'sm:max-w-[min(100%,280px)]' : 'sm:w-auto'
			)}
		>
			<Input
				value={text}
				className={cn(
					'w-full pr-7 transition-[width]',
					compact ? 'h-8 sm:max-w-70' : 'h-9 sm:w-75'
				)}
				placeholder={__('Search Title')}
				onChange={(e) => {
					const value = e.target.value;
					setText(value);
					debounced(value);
				}}
			/>
			{text.length > 0 && (
				<X
					className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer opacity-100 transition-opacity hover:opacity-70"
					size={14}
					onClick={() => {
						setText('');
						debounced.cancel();
						collection.setSearch('');
					}}
				/>
			)}
		</div>
	);
}
