import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';
import useInstalled from '@/hooks/use-is-installed';
import { __ } from '@/lib/i18n';
import { useMemo } from '@wordpress/element';
import { Cell, Pie, PieChart } from 'recharts';

const chartConfig = {
	theme: {
		label: __('Themes'),
		color: 'hsl(var(--chart-1))'
	},
	plugin: {
		label: __('Plugins'),
		color: 'hsl(var(--chart-2))'
	}
} satisfies ChartConfig;

export default function InstalledMixDonut() {
	const { list } = useInstalled();

	const chartData = useMemo(() => {
		if (!list?.length) return [];
		const themes = list.filter((i) => i.type === 'theme').length;
		const plugins = list.filter((i) => i.type === 'plugin').length;
		return [
			{
				name: 'theme',
				value: themes,
				fill: 'hsl(var(--chart-1))'
			},
			{
				name: 'plugin',
				value: plugins,
				fill: 'hsl(var(--chart-2))'
			}
		].filter((d) => d.value > 0);
	}, [list]);

	if (!chartData.length) {
		return (
			<div className="text-muted-foreground flex h-45 items-center justify-center text-center text-sm">
				{__('No installed items yet.')}
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
			<ChartContainer
				config={chartConfig}
				className="mx-auto aspect-square h-40 w-40 sm:h-45 sm:w-45"
			>
				<PieChart>
					<ChartTooltip
						cursor={false}
						content={
							<ChartTooltipContent
								hideLabel
								nameKey="name"
							/>
						}
					/>
					<Pie
						data={chartData}
						dataKey="value"
						nameKey="name"
						innerRadius={52}
						outerRadius={72}
						strokeWidth={2}
						stroke="var(--background)"
					>
						{chartData.map((entry) => (
							<Cell
								key={entry.name}
								fill={entry.fill}
							/>
						))}
					</Pie>
				</PieChart>
			</ChartContainer>
			<ul className="text-muted-foreground flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs sm:flex-col sm:justify-center sm:text-sm">
				{chartData.map((d) => (
					<li
						key={d.name}
						className="flex items-center gap-2"
					>
						<span
							className="h-2.5 w-2.5 shrink-0 rounded-full"
							style={{ backgroundColor: d.fill }}
						/>
						<span className="text-foreground font-medium">
							{d.value.toLocaleString()}
						</span>
						<span>
							{d.name === 'theme' ? __('Themes') : __('Plugins')}
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
