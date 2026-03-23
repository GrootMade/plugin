import { Button, ButtonProps } from '@/components/ui/button';
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger
} from '@/components/ui/popover';
import useActivation from '@/hooks/use-activation';
import useBookmark from '@/hooks/use-collection';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { BookmarkCollectionType } from '@/types/bookmark';
import { TPostItem } from '@/types/item';
import { useCallback } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { Check, Star } from 'lucide-react';
import AddCollectionButton from './add-collection-dialog';
import ActionLoader from './ui/action-loader';
type Props = {
	item: TPostItem;
} & ButtonProps;
export default function CollectionButton({ item, size, variant }: Props) {
	const { addItemToCollection, collections, pendingCollectionItemIds } =
		useBookmark();
	const { activated, active } = useActivation();
	const isAnyPending = pendingCollectionItemIds.length > 0;
	const collectionCount = item.collections?.length ?? 0;
	const isInCollection = collectionCount > 0;

	const addItem = useCallback(
		(collection: BookmarkCollectionType) => {
			addItemToCollection(item, collection);
		},
		[item, addItemToCollection]
	);
	return (
		<Popover>
			<PopoverTrigger
				asChild
				disabled={!activated || !active || isAnyPending}
			>
				<Button
					variant={variant ?? 'secondary'}
					size={size}
					className={cn(
						'relative flex items-center gap-2',
						isInCollection &&
							'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary dark:hover:bg-primary/20 dark:hover:text-primary'
					)}
					title={
						isInCollection
							? collectionCount === 1
								? __('In 1 collection')
								: `${collectionCount} ${__('collections')}`
							: __('Add to Collection')
					}
				>
					{isAnyPending ? (
						<ActionLoader />
					) : (
						<Star
							width={16}
							className={cn(isInCollection && 'text-primary')}
						/>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent>
				<Command>
					<CommandList>
						<CommandGroup heading={__('List')}>
							{collections && collections.data.length > 0
								? collections.data.map((collection) => {
										const isPending =
											pendingCollectionItemIds.includes(
												collection.id
											);
										return (
											<CommandItem
												key={collection.id}
												disabled={isPending}
												className="flex cursor-pointer flex-row justify-between gap-2"
												onSelect={() => {
													if (isPending) {
														return;
													}
													addItem(collection);
												}}
											>
												<span>
													{decodeEntities(
														collection.title
													)}
												</span>
												{isPending ? (
													<ActionLoader />
												) : item.collections?.includes(
														collection.id
												  ) ? (
													<Check size={16} />
												) : null}
											</CommandItem>
										);
									})
								: null}
						</CommandGroup>
						<CommandSeparator />
						<CommandItem>
							<AddCollectionButton />
						</CommandItem>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
