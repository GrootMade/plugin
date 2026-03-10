import { __ } from '@/lib/i18n';
import { TPostItem } from '@/types/item';
import { useMemo } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import {
	BookOpen,
	Calendar,
	CheckCircle,
	Hash,
	Key,
	LayoutGrid,
	Monitor,
	Tag,
	User
} from 'lucide-react';
import moment from 'moment';
import type { ReactNode } from 'react';

function StatRow({
	icon,
	label,
	value
}: {
	icon: ReactNode;
	label: string;
	value: ReactNode;
}) {
	return (
		<li className="flex items-center gap-3 py-1">
			<p className="flex min-w-0 items-center gap-1.5 text-muted-foreground [&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_svg]:opacity-75">
				{icon}
				<span className="flex-1 truncate">{label}</span>
			</p>
			<hr className="min-w-2 flex-1" />
			<span className="shrink-0 font-medium tabular-nums">{value}</span>
		</li>
	);
}

type Props = {
	item: TPostItem;
};

type Row = {
	icon: ReactNode;
	label: string;
	value: ReactNode;
	enabled?: boolean;
};

export default function ItemDetail({ item }: Props) {
	const rows = useMemo<Row[]>(
		() => [
			{
				icon: <Hash />,
				label: __('Version'),
				value: item.version,
				enabled: item.type !== 'request'
			},
			{
				icon: <Tag />,
				label: __('Slug'),
				value: item.slugs[0],
				enabled: item.type !== 'request'
			},
			{
				icon: <CheckCircle />,
				label: __('Status'),
				value: 'Functional'
			},
			{
				icon: <Calendar />,
				label: __('Updated'),
				value: moment.unix(item.updated).format('MMM D, YYYY')
			},
			{
				icon: <Calendar />,
				label: __('Published'),
				value: moment.unix(item.created).format('MMM D, YYYY')
			},
			{
				icon: <User />,
				label: __('Author'),
				value: item.terms
					.filter((i) => i.taxonomy === 'fv_item_author')
					.map((i) => decodeEntities(i.name))
					.join(', '),
				enabled:
					item.terms.filter((i) => i.taxonomy === 'fv_item_author')
						.length > 0
			},
			{
				icon: <BookOpen />,
				label: __('Documentation'),
				value: item.terms
					.filter((i) => i.taxonomy === 'fv_documentation')
					.map((i) => decodeEntities(i.name))
					.join(', '),
				enabled:
					item.terms.filter((i) => i.taxonomy === 'fv_documentation')
						.length > 0
			},
			{
				icon: <LayoutGrid />,
				label: __('Gutenberg Optimized'),
				value: item.terms
					.filter((i) => i.taxonomy === 'fv_gutenberg_optimized')
					.map((i) => decodeEntities(i.name))
					.join(', '),
				enabled:
					item.terms.filter(
						(i) => i.taxonomy === 'fv_gutenberg_optimized'
					).length > 0
			},
			{
				icon: <Monitor />,
				label: __('High Resolution'),
				value: item.terms
					.filter((i) => i.taxonomy === 'fv_high_resolution')
					.map((i) => decodeEntities(i.name))
					.join(', '),
				enabled:
					item.terms.filter(
						(i) => i.taxonomy === 'fv_high_resolution'
					).length > 0
			},
			{
				icon: <LayoutGrid />,
				label: __('Widget Ready'),
				value: item.terms
					.filter((i) => i.taxonomy === 'fv_widget_ready')
					.map((i) => decodeEntities(i.name))
					.join(', '),
				enabled:
					item.terms.filter((i) => i.taxonomy === 'fv_widget_ready')
						.length > 0
			},
			{
				icon: <Key />,
				label: __('Access'),
				value: item.terms
					.filter((i) => i.taxonomy === 'fv_access_level')
					.map((i) => decodeEntities(i.name))
					.join(', '),
				enabled:
					item.terms.filter((i) => i.taxonomy === 'fv_access_level')
						.length > 0
			}
		],
		[item]
	);

	return (
		<div className="rounded-lg border p-5 max-md:order-3">
			<ul className="w-full text-sm">
				{rows.map(
					({ icon, label, value, enabled }) =>
						enabled !== false && (
							<StatRow
								key={label}
								icon={icon}
								label={label}
								value={value}
							/>
						)
				)}
			</ul>
		</div>
	);
}
