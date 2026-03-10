import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import useActivation from '@/hooks/use-activation';
import useBulk from '@/hooks/use-bulk';
import { __ } from '@/lib/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { sprintf } from '@wordpress/i18n';
import {
	Download,
	DownloadCloud,
	Package,
	ShoppingBag,
	Trash2,
	X
} from 'lucide-react';
import { memo } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';

export default memo(function BulkAction() {
	const { items, removeItem, clearItems, install, download } = useBulk();
	const { active, activated, can_bulk_download, can_bulk_install } =
		useActivation();
	return (
		(can_bulk_download || can_bulk_install) && (
			<Dialog>
				<DialogTrigger asChild>
					<Button
						variant="outline"
						size={items && items.length > 0 ? 'default' : 'icon'}
						className="gap-2"
						disabled={!activated || !active}
					>
						<ShoppingBag size={16} />
						{items.length > 0 && <span>{items.length}</span>}
					</Button>
				</DialogTrigger>
				<DialogContent className="flex max-h-[80vh] flex-col gap-0 p-0">
					<DialogHeader className="px-6 pb-4 pt-6">
						<div className="flex items-center justify-between">
							<div>
								<DialogTitle className="flex items-center gap-2">
									{__('Bulk Cart')}
									{items.length > 0 && (
										<Badge variant="secondary">
											{sprintf(
												__('%d items'),
												items.length
											)}
										</Badge>
									)}
								</DialogTitle>
								<DialogDescription className="mt-1">
									{items.length > 0
										? __(
												'Review items before installing or downloading'
											)
										: __(
												'Add items to your cart to get started'
											)}
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					<Separator />

					{items.length > 0 ? (
						<>
							<ScrollArea className="max-h-[50vh] flex-1">
								<div className="divide-y">
									{items.map((item) => (
										<div
											key={item.id}
											className="flex items-center gap-3 px-6 py-3"
										>
											<img
												src={item.image ?? ''}
												alt=""
												className="size-10 shrink-0 rounded-md border object-contain"
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium">
													{decodeEntities(item.title)}
												</p>
												<p className="text-xs text-muted-foreground">
													{sprintf(
														__('v%s · %s'),
														item.version,
														item.type
													)}
												</p>
											</div>
											<Button
												variant="ghost"
												size="icon"
												className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
												onClick={() =>
													removeItem(item.id)
												}
											>
												<X className="size-4" />
											</Button>
										</div>
									))}
								</div>
							</ScrollArea>

							<Separator />

							<DialogFooter className="flex-row justify-between gap-2 px-6 py-4">
								<Button
									variant="ghost"
									size="sm"
									className="gap-1.5 text-muted-foreground"
									onClick={clearItems}
								>
									<Trash2 className="size-3.5" />
									{__('Clear')}
								</Button>
								<div className="flex gap-2">
									{can_bulk_download && (
										<DialogClose asChild>
											<Button
												variant="outline"
												size="sm"
												className="gap-1.5"
												disabled={items.length === 0}
												onClick={download}
											>
												<Download className="size-3.5" />
												{__('Download')}
											</Button>
										</DialogClose>
									)}
									{can_bulk_install && (
										<DialogClose asChild>
											<Button
												size="sm"
												className="gap-1.5"
												disabled={items.length === 0}
												onClick={install}
											>
												<DownloadCloud className="size-3.5" />
												{__('Install')}
											</Button>
										</DialogClose>
									)}
								</div>
							</DialogFooter>
						</>
					) : (
						<div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
							<div className="rounded-full bg-muted p-3">
								<Package className="size-6 text-muted-foreground" />
							</div>
							<div>
								<p className="text-sm font-medium">
									{__('Your cart is empty')}
								</p>
								<p className="text-xs text-muted-foreground">
									{__(
										'Browse items and add them to your cart'
									)}
								</p>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		)
	);
});
