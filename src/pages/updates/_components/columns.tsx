import InstallButton from '@/components/install-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { archiveItemCoverSrc } from '@/lib/archive-item-cover';
import { __, sprintf } from '@/lib/i18n';
import { TypeToItemType, TypeToSlug } from '@/lib/type-to-slug';
import version_compare from '@/lib/version_compare';
import { Link } from '@/router';
import { TThemePluginItem } from '@/types/item';
import { type ColumnDef } from '@tanstack/react-table';
import { decodeEntities } from '@wordpress/html-entities';
import { ArrowRight } from 'lucide-react';
import AutoUpdateSwitcher from './autoupdate-switch';

export function getColumns(): ColumnDef<TThemePluginItem>[] {
	return columns;
}
export const columns: ColumnDef<TThemePluginItem>[] = [
	{
		id: 'select',
		header: ({ table }) => (
			<Checkbox
				checked={
					table.getIsAllPageRowsSelected()
						? true
						: table.getIsSomePageRowsSelected()
							? 'indeterminate'
							: false
				}
				onCheckedChange={(value) =>
					table.toggleAllPageRowsSelected(!!value)
				}
				aria-label={__('Select all')}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
				aria-label={__('Select row')}
			/>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'title',
		header: () => <span className="pl-2">{__('Item')}</span>,
		id: 'title',
		cell: ({ row }) => {
			return (
				<div className="flex items-center gap-3 py-0.5">
					<Avatar className="h-8 w-8 shrink-0 rounded-md">
						<AvatarImage
							src={archiveItemCoverSrc(row.original)}
							alt={decodeEntities(row.original.title)}
						/>
						<AvatarFallback className="rounded-md text-[10px]">
							{decodeEntities(row.original.title)
								.slice(0, 2)
								.toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<div className="flex min-w-0 flex-col gap-1">
						<div className="line-clamp-1 font-semibold">
							<Link
								to={`/item/:slug/detail/:id/:tab?`}
								params={{
									id: String(row.original.id),
									slug: TypeToSlug(row.original.type)
								}}
							>
								{decodeEntities(row.original.title)}
							</Link>
						</div>
						{row.original.original_title && (
							<div className="text-muted-foreground line-clamp-1 text-xs">
								{sprintf(
									__('Forked From: %s'),
									decodeEntities(row.original.original_title)
								)}
							</div>
						)}
					</div>
				</div>
			);
		}
	},
	{
		accessorKey: 'type',
		header: __('Type'),
		cell: ({ row }) => {
			const item_type = TypeToItemType(row.original.type);
			return (
				<Badge
					variant="outline"
					className="text-xs capitalize"
				>
					{item_type?.label_singular}
				</Badge>
			);
		},
		filterFn: (row, id, value) => {
			return !!value.includes(row.original.type);
		}
	},

	{
		accessorKey: 'installed_version',
		header: __('Version'),
		cell: ({ row }) => {
			const isNew = version_compare(
				row.original.version,
				row.original.installed_version ?? '',
				'gt'
			);
			return (
				<div className="flex items-center gap-1.5">
					<Badge
						variant="secondary"
						className="font-mono capitalize"
					>
						{row.original.installed_version}
					</Badge>
					<ArrowRight className="text-muted-foreground h-3 w-3 shrink-0" />
					<Badge
						variant={isNew ? 'success' : 'secondary'}
						className="font-mono capitalize"
					>
						{row.original.version}
					</Badge>
				</div>
			);
		}
	},
	{
		accessorKey: 'autoupdate',
		header: __('Auto Update'),
		cell: ({ row }) => {
			return <AutoUpdateSwitcher item={row.original} />;
		},
		enableSorting: true,
		sortingFn: (rowA) => {
			const isNewA = version_compare(
				rowA.original.version,
				rowA.original.installed_version ?? '',
				'gt'
			);
			return isNewA ? -1 : 1;
		}
	},
	{
		accessorKey: 'actions',
		header: '',
		cell: ({ row }) => {
			return (
				<InstallButton
					item={row.original}
					size="icon"
				/>
			);
		},
		enableHiding: false,
		enableSorting: false
	}
];
