import { EmptyState } from '@/components/page/empty-state';
import Paging from '@/components/paging';
import SimpleTable, { SimpleColumnDef } from '@/components/table/simple-table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { archiveItemCoverSrc } from '@/lib/archive-item-cover';
import { __ } from '@/lib/i18n';
import { Link } from '@/router';
import { HistoryCollectionType, HistoryItemType } from '@/types/history';
import { useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { Download, History, RefreshCw, Upload } from 'lucide-react';
import moment from 'moment';

const typeConfig: Record<
	string,
	{ label: string; icon: typeof Download; variant: 'secondary' | 'outline' }
> = {
	download: { label: __('Download'), icon: Download, variant: 'secondary' },
	install: { label: __('Install'), icon: Upload, variant: 'secondary' },
	update: { label: __('Update'), icon: RefreshCw, variant: 'outline' },
	download_additional: {
		label: __('Additional'),
		icon: Download,
		variant: 'outline'
	}
};

type Props = {
	data: HistoryCollectionType | undefined;
};
export default function HistoryItems({ data }: Props) {
	const columns = useMemo<SimpleColumnDef<HistoryItemType>[]>(
		() => [
			{
				id: 'title',
				label: __('Title'),
				className: 'w-full whitespace-nowrap text-muted-foreground',
				render({ row }) {
					return (
						<Link
							to="/item/:slug/detail/:id/:tab?"
							params={{ id: row.item.id, slug: row.item?.type }}
							className="text-foreground hover:text-primary flex items-center gap-3 font-medium hover:underline"
						>
							<Avatar className="size-8 shrink-0 rounded-md">
								<AvatarImage
									src={archiveItemCoverSrc(row.item)}
									alt={decodeEntities(row.item.title)}
								/>
								<AvatarFallback className="rounded-md text-xs">
									{decodeEntities(row.item.title)
										.charAt(0)
										.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-col gap-0.5">
								<span>{decodeEntities(row?.item?.title)}</span>
								{row.type === 'download_additional' &&
									row.media?.title && (
										<span className="text-muted-foreground text-xs font-normal">
											{row.media.title}
										</span>
									)}
							</div>
						</Link>
					);
				}
			},
			{
				id: 'type',
				label: __('Type'),
				render({ row }) {
					const config = typeConfig[row.type] ?? {
						label: row.type?.replace('_', ' '),
						icon: Download,
						variant: 'secondary' as const
					};
					const Icon = config.icon;
					return (
						<Badge
							variant={config.variant}
							className="gap-1 capitalize"
						>
							<Icon className="size-3" />
							{config.label}
						</Badge>
					);
				}
			},
			{
				id: 'date',
				label: __('Date'),
				className: 'whitespace-nowrap text-muted-foreground',
				render({ row }) {
					return moment.unix(row.created).fromNow();
				}
			},
			{
				id: 'version',
				label: __('Version'),
				className:
					'whitespace-nowrap font-mono text-xs text-muted-foreground',
				render({ row }) {
					const v = row?.media?.version ?? row?.item?.version;
					return v ? `v${v}` : '—';
				}
			}
		],
		[]
	);

	const rows = data?.data ?? [];
	const hasRows = rows.length > 0;

	return (
		<Card className="border-border/80 shadow-card overflow-hidden">
			<CardContent className="p-0 sm:p-0">
				<div className="flex flex-col gap-6 p-4 sm:p-6">
					{hasRows ? (
						<>
							<SimpleTable
								columns={columns}
								data={rows}
							/>
							{data?.meta ? (
								<Paging
									currentPage={data.meta.current_page}
									totalPages={Number(data.meta.last_page)}
									urlGenerator={(_page: number) =>
										`/history/${_page}`
									}
								/>
							) : null}
						</>
					) : (
						<EmptyState
							icon={History}
							title={__('No history yet')}
							description={__(
								'When you install or download items through GrootMade, they will be listed here.'
							)}
							action={{
								label: __('Browse themes'),
								to: '/item/theme'
							}}
						/>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
