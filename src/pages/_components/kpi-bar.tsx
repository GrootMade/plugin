import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';
import { Progress } from '@/components/ui/progress';
import useActivation from '@/hooks/use-activation';
import useApiFetch from '@/hooks/use-api-fetch';
import useInstalled from '@/hooks/use-is-installed';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { formatCompactNumber } from '@/lib/number-format';
import { cn } from '@/lib/utils';
import { ItemStatsResponse } from '@/types/item';
import { HardDrive, Library, RefreshCw, Zap } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

type Props = {
	/** Smaller padding and type for dense dashboards */
	compact?: boolean;
};

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
	},
	current: {
		label: __('Up to date'),
		color: 'hsl(var(--chart-2))'
	},
	pending: {
		label: __('Updates available'),
		color: 'hsl(var(--chart-4))'
	},
	used: {
		label: __('Used'),
		color: 'hsl(var(--chart-4))'
	},
	remaining: {
		label: __('Remaining'),
		color: 'hsl(var(--chart-2))'
	}
} satisfies ChartConfig;

export default function KpiBar({ compact = false }: Props) {
	const { data: itemStats } = useApiFetch<ItemStatsResponse>(
		API.item.readStats
	);
	const { list, updateable } = useInstalled();
	const { data: license } = useActivation();

	const totalAssets = Number(itemStats?.total ?? 0);
	const installed = Number(list?.length ?? 0);
	const pending = Number(updateable?.length ?? 0);
	const current = Math.max(0, installed - pending);
	const todayLimit = Number(license?.today_limit ?? 0);
	const todayUsed = Number(license?.today_limit_used ?? 0);
	const todayRemaining = Math.max(todayLimit - todayUsed, 0);
	const creditsPercent = todayLimit > 0 ? (todayUsed / todayLimit) * 100 : 0;

	const catalogRows = [
		{
			key: 'themes',
			name: 'themes',
			label: __('Themes'),
			count: Number(itemStats?.themes ?? 0),
			fill: 'hsl(var(--chart-1))'
		},
		{
			key: 'plugins',
			name: 'plugins',
			label: __('Plugins'),
			count: Number(itemStats?.plugins ?? 0),
			fill: 'hsl(var(--chart-2))'
		},
		{
			key: 'kits',
			name: 'kits',
			label: __('Kits'),
			count: Number(itemStats?.kits ?? 0),
			fill: 'hsl(var(--chart-3))'
		}
	];
	const catalogMax = Math.max(...catalogRows.map((r) => r.count), 1);

	const installRows = [
		{
			key: 'current',
			name: 'current',
			label: __('Up to date'),
			value: current,
			fill: 'hsl(var(--chart-2))'
		},
		{
			key: 'pending',
			name: 'pending',
			label: __('Needs update'),
			value: pending,
			fill: 'hsl(var(--chart-4))'
		}
	];
	const installMax = Math.max(current, pending, 1);

	const creditRows = [
		{
			key: 'used',
			name: 'used',
			label: __('Used'),
			value: todayUsed,
			fill: 'hsl(var(--chart-4))'
		},
		{
			key: 'remaining',
			name: 'remaining',
			label: __('Remaining'),
			value: todayRemaining,
			fill: 'hsl(var(--chart-2))'
		}
	];
	const creditsMax = Math.max(todayUsed, todayRemaining, 1);

	return (
		<div
			className={cn(
				'grid grid-cols-1 lg:grid-cols-3',
				compact ? 'gap-2 sm:gap-3' : 'gap-4'
			)}
		>
			<Card className="overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/30 border-b py-3">
					<CardTitle className="flex items-center gap-2 text-sm font-semibold">
						<Library className="text-chart-1 h-4 w-4" />
						{__('Catalog Distribution')}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 pt-4">
					<div className="text-muted-foreground text-xs">
						{__('Total assets')}
						<span className="text-foreground ml-1 font-semibold">
							{formatCompactNumber(totalAssets)}
						</span>
					</div>
					<ChartContainer
						config={chartConfig}
						className="h-35 w-full"
					>
						<BarChart
							data={catalogRows}
							layout="vertical"
							margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
						>
							<CartesianGrid
								horizontal={false}
								className="stroke-border/50"
							/>
							<XAxis
								type="number"
								domain={[0, catalogMax * 1.15]}
								tickLine={false}
								axisLine={false}
								hide
							/>
							<YAxis
								dataKey="label"
								type="category"
								tickLine={false}
								axisLine={false}
								width={64}
								tick={{ fontSize: 11 }}
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
								maxBarSize={20}
							>
								{catalogRows.map((row) => (
									<Cell
										key={row.key}
										fill={row.fill}
									/>
								))}
							</Bar>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card className="overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/30 border-b py-3">
					<CardTitle className="flex items-center gap-2 text-sm font-semibold">
						<RefreshCw className="text-chart-3 h-4 w-4" />
						{__('Installation Health')}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 pt-4">
					<div className="text-muted-foreground text-xs">
						{__('Installed items')}
						<span className="text-foreground ml-1 font-semibold">
							{installed.toLocaleString()}
						</span>
					</div>
					<ChartContainer
						config={chartConfig}
						className="h-35 w-full"
					>
						<BarChart
							data={installRows}
							layout="vertical"
							margin={{ left: 0, right: 8, top: 8, bottom: 0 }}
						>
							<CartesianGrid
								horizontal={false}
								className="stroke-border/50"
							/>
							<XAxis
								type="number"
								domain={[0, installMax * 1.15]}
								tickLine={false}
								axisLine={false}
								hide
							/>
							<YAxis
								dataKey="label"
								type="category"
								tickLine={false}
								axisLine={false}
								width={88}
								tick={{ fontSize: 11 }}
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
								dataKey="value"
								radius={[0, 6, 6, 0]}
								maxBarSize={20}
							>
								{installRows.map((row) => (
									<Cell
										key={row.key}
										fill={row.fill}
									/>
								))}
							</Bar>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>

			<Card className="overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/30 border-b py-3">
					<CardTitle className="flex items-center gap-2 text-sm font-semibold">
						<Zap className="text-chart-4 h-4 w-4" />
						{__('Credit Usage Today')}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 pt-4">
					<div className="flex items-end justify-between gap-2">
						<div className="flex items-center gap-2 text-sm">
							<HardDrive className="text-muted-foreground h-4 w-4" />
							<span className="font-semibold tabular-nums">
								{todayUsed.toLocaleString()}/
								{todayLimit.toLocaleString()}
							</span>
						</div>
						<div className="text-muted-foreground text-xs font-medium">
							{creditsPercent.toFixed(0)}%
						</div>
					</div>
					<Progress
						value={Math.min(100, Math.max(0, creditsPercent))}
					/>
					<ChartContainer
						config={chartConfig}
						className="h-23 w-full"
					>
						<BarChart
							data={creditRows}
							layout="vertical"
							margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
						>
							<XAxis
								type="number"
								domain={[0, creditsMax * 1.1]}
								tickLine={false}
								axisLine={false}
								hide
							/>
							<YAxis
								dataKey="label"
								type="category"
								tickLine={false}
								axisLine={false}
								width={72}
								tick={{ fontSize: 11 }}
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
								dataKey="value"
								radius={[0, 6, 6, 0]}
								maxBarSize={18}
							>
								{creditRows.map((row) => (
									<Cell
										key={row.key}
										fill={row.fill}
									/>
								))}
							</Bar>
						</BarChart>
					</ChartContainer>
				</CardContent>
			</Card>
		</div>
	);
}
