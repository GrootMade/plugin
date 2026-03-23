import useActivation from '@/hooks/use-activation';
import useBulk from '@/hooks/use-bulk';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { TPostItem } from '@/types/item';
import { ShoppingBag } from 'lucide-react';
import { Button, ButtonProps } from './ui/button';

type Props = {
	item: TPostItem;
} & ButtonProps;

export default function BulkButton({ item, variant, size }: Props) {
	const { addItem, hasItem, removeItem } = useBulk();
	const { activated, active, can_bulk_download, can_bulk_install } =
		useActivation();
	const isInBulk = hasItem(item.id);

	return (
		<Button
			variant={variant ?? 'secondary'}
			size={size ?? 'icon'}
			className={cn(
				'relative flex items-center gap-2',
				isInBulk &&
					'border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary dark:hover:bg-primary/20 dark:hover:text-primary'
			)}
			disabled={
				!activated ||
				!active ||
				(!can_bulk_download && !can_bulk_install)
			}
			title={
				isInBulk === true ? __('Remove from bulk') : __('Add to Bulk')
			}
			onClick={() => {
				if (isInBulk === true) {
					removeItem(item.id);
				} else {
					addItem({
						id: Number(item.id),
						type: item.type,
						image: item.thumbnail ?? item.image,
						title: item.title,
						version: item.version
					});
				}
			}}
		>
			<ShoppingBag
				width={16}
				className={cn(isInBulk && 'text-primary')}
			/>
		</Button>
	);
}
