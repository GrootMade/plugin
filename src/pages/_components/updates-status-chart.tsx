import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';
import useInstalled from '@/hooks/use-is-installed';
import { __ } from '@/lib/i18n';
import { useMemo } from '@wordpress/element';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';

const chartConfig = {
	current: {
		label: __('Up to date'),
		color: 'hsl(var(--chart-2))'
	},
	pending: {
		label: __('Updates available'),
		color: 'hsl(var(--chart-4))'
	}
} satisfies ChartConfig;

export default function UpdatesStatusChart() {
	const { list, updateable } = useInstalled();

	const data = useMemo(() => {
		const total = list?.length ?? 0;
		const pending = updateable?.length ?? 0;
		const current = Math.max(0, total - pending);
		return [
			{
				label: __('Up to date'),
				key: 'current',
				name: 'current',
				value: current,
				fill: 'hsl(var(--chart-2))'
			},
			{
				label: __('Updates available'),
				key: 'pending',
				name: 'pending',
				value: pending,
				fill: 'hsl(var(--chart-4))'
			}
		];
	}, [list, updateable]);

	const max = Math.max(data[0].value, data[1].value, 1);

	if (!list?.length) {
		return (
			<div className="text-muted-foreground flex h-[160px] items-center justify-center text-sm">
				{__('No installs to compare.')}
			</div>
		);
	}

	return (
		<ChartContainer
			config={chartConfig}
			className="aspect-auto h-[200px] max-h-[220px] w-full"
		>
			<BarChart
				accessibilityLayer
				data={data}
				margin={{ left: 4, right: 8, top: 8, bottom: 8 }}
			>
				<CartesianGrid
					vertical={false}
					strokeDasharray="3 3"
					className="stroke-border/50"
				/>
				<XAxis
					dataKey="label"
					tickLine={false}
					axisLine={false}
					tick={{ fontSize: 11 }}
					interval={0}
					height={48}
				/>
				<YAxis
					domain={[0, max * 1.15]}
					tickLine={false}
					axisLine={false}
					width={32}
					tickFormatter={(v) => String(Math.round(Number(v)))}
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
					radius={[6, 6, 0, 0]}
					maxBarSize={48}
				>
					{data.map((d) => (
						<Cell
							key={d.key}
							fill={d.fill}
						/>
					))}
				</Bar>
			</BarChart>
		</ChartContainer>
	);
}
