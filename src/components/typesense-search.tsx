import { __ } from '@/lib/i18n';
import placeholder from '@/lib/placeholder';
import { cn } from '@/lib/utils';
import { Link } from '@/router';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { Loader, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Hits, useSearchBox } from 'react-instantsearch';
import { Input } from './ui/input';

function Hit({ hit }: { hit: TPostItem }) {
	return (
		<div className="group/hit relative flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-accent">
			<img
				src={hit.image ?? placeholder(hit.title)}
				className="size-10 shrink-0 rounded-md border object-cover"
			/>
			<div className="flex min-w-0 flex-1 flex-col">
				<span className="truncate text-sm font-medium">
					{decodeEntities(hit.title)}
				</span>
				{hit.is_forked && hit.original_title ? (
					<span className="truncate text-xs text-muted-foreground">
						{__('Forked From')} {decodeEntities(hit.original_title)}
					</span>
				) : null}
			</div>
			<Link
				to={'/item/:slug/detail/:id/:tab?'}
				params={{
					id: hit.id,
					slug: hit.type
				}}
				className="absolute inset-0"
			/>
		</div>
	);
}

export default function TypeSenseSearch() {
	const { query, refine, isSearchStalled, clear } = useSearchBox();
	const [showResults, setShowResults] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				wrapperRef.current &&
				!wrapperRef.current.contains(event.target as Node)
			) {
				setShowResults(false);
			}
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<div
			className="relative"
			ref={wrapperRef}
		>
			<div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50">
				{isSearchStalled ? (
					<Loader className="size-4 animate-spin" />
				) : (
					<Search className="size-4" />
				)}
			</div>

			<Input
				ref={inputRef}
				type="text"
				value={query}
				onChange={(event) => {
					refine(event.currentTarget.value);
					setShowResults(event.currentTarget.value.length > 0);
				}}
				onClick={(event) => {
					setShowResults(event.currentTarget.value.length > 0);
				}}
				placeholder={__('Search themes and plugins...')}
				className={cn('pl-9', query.length > 0 && 'pr-9')}
			/>

			{query.length > 0 && (
				<button
					type="button"
					onClick={() => {
						clear();
						setShowResults(false);
						inputRef.current?.focus();
					}}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
				>
					<X className="size-4" />
				</button>
			)}

			{showResults && query.length > 0 && (
				<Hits
					hitComponent={Hit}
					className="absolute left-0 top-full z-[999] mt-1 max-h-80 w-full overflow-y-auto overscroll-contain rounded-lg border bg-popover p-1 text-popover-foreground shadow-md"
				/>
			)}
		</div>
	);
}
