import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { ItemStatsResponse } from '@/types/item';
import { useMemo } from '@wordpress/element';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

const chartConfig = {
	themes: {
		label: __('Themes'),
		color: 'hsl(var(--chart-1))'
	},
	plugins: {
		label: __('Plugins'),
		color: 'hsl(var(--chart-2))'
	},
	kits: {
		label: __('Template Kits'),
		color: 'hsl(var(--chart-3))'
	}
} satisfies ChartConfig;

export default function CatalogTypeBarChart() {
	const { data } = useApiFetch<ItemStatsResponse>(API.item.readStats);

	const rows = useMemo(() => {
		if (!data) return [];
		return [
			{
				key: 'themes',
				name: 'themes',
				label: __('Themes'),
				count: data.themes,
				fill: 'hsl(var(--chart-1))'
			},
			{
				key: 'plugins',
				name: 'plugins',
				label: __('Plugins'),
				count: data.plugins,
				fill: 'hsl(var(--chart-2))'
			},
			{
				key: 'kits',
				name: 'kits',
				label: __('Template Kits'),
				count: data.kits,
				fill: 'hsl(var(--chart-3))'
			}
		];
	}, [data]);

	if (!data || rows.every((r) => r.count === 0)) {
		return (
			<div className="text-muted-foreground flex h-50 items-center justify-center text-sm">
				{__('No catalog data yet.')}
			</div>
		);
	}

	const max = Math.max(...rows.map((r) => r.count), 1);

	return (
		<ChartContainer
			config={chartConfig}
			className="aspect-auto h-50 w-full sm:h-55"
		>
			<BarChart
				accessibilityLayer
				data={rows}
				layout="vertical"
				margin={{ left: 4, right: 12, top: 8, bottom: 8 }}
			>
				<CartesianGrid
					horizontal={false}
					strokeDasharray="3 3"
					className="stroke-border/50"
				/>
				<XAxis
					domain={[0, max * 1.1]}
					type="number"
					tickLine={false}
					axisLine={false}
					tickFormatter={(v) => Number(v).toLocaleString()}
				/>
				<YAxis
					dataKey="label"
					type="category"
					tickLine={false}
					axisLine={false}
					width={96}
					tick={{ fontSize: 12 }}
				/>
				<ChartTooltip
					cursor={{ fill: 'hsl(var(--muted) / 0.25)' }}
					content={
						<ChartTooltipContent
							hideLabel
							nameKey="name"
						/>
					}
				/>
				<Bar
					dataKey="count"
					radius={[0, 6, 6, 0]}
					maxBarSize={28}
				>
					{rows.map((r) => (
						<Cell
							key={r.key}
							fill={r.fill}
						/>
					))}
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
