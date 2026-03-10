import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';
import useApiFetch from '@/hooks/use-api-fetch';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { ItemStatsResponse } from '@/types/item';
import { useMemo } from '@wordpress/element';
import { Palette, Puzzle, ToyBrick } from 'lucide-react';
import millify from 'millify';
import CountUp from 'react-countup';
import { Cell, Pie, PieChart } from 'recharts';
import { ClassNameValue } from 'tailwind-merge';

type Props = {
	className?: ClassNameValue;
};

const chartConfig = {
	themes: {
		label: 'Themes',
		color: 'hsl(var(--chart-1))'
	},
	plugins: {
		label: 'Plugins',
		color: 'hsl(var(--chart-2))'
	},
	kits: {
		label: 'Template Kits',
		color: 'hsl(var(--chart-3))'
	}
} satisfies ChartConfig;

export default function OverviewStats({ className }: Props) {
	const { data } = useApiFetch<ItemStatsResponse>('item/stats');

	const chartData = useMemo(() => {
		if (!data) return [];
		return [
			{
				name: 'themes',
				value: data.themes,
				fill: 'hsl(var(--chart-1))'
			},
			{
				name: 'plugins',
				value: data.plugins,
				fill: 'hsl(var(--chart-2))'
			},
			{
				name: 'kits',
				value: data.kits,
				fill: 'hsl(var(--chart-3))'
			}
		];
	}, [data]);

	const stats = [
		{
			icon: Palette,
			label: __('Themes'),
			value: data?.themes ?? 0,
			color: 'hsl(var(--chart-1))'
		},
		{
			icon: ToyBrick,
			label: __('Plugins'),
			value: data?.plugins ?? 0,
			color: 'hsl(var(--chart-2))'
		},
		{
			icon: Puzzle,
			label: __('Template Kits'),
			value: data?.kits ?? 0,
			color: 'hsl(var(--chart-3))'
		}
	];

	return (
		<div
			className={cn(
				'grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:gap-7',
				className
			)}
		>
			{/* Stat Cards */}
			<div className="flex flex-col justify-center gap-4">
				<div>
					<div className="text-4xl font-bold">
						<CountUp
							start={0}
							end={data?.total ?? 0}
							duration={2}
							formattingFn={(num) => millify(num)}
						/>
					</div>
					<div className="text-sm text-muted-foreground">
						{__('Total Products Available')}
					</div>
				</div>
				<div className="flex flex-col gap-3">
					{stats.map((stat) => (
						<div
							key={stat.label}
							className="flex items-center gap-3"
						>
							<div
								className="flex h-8 w-8 items-center justify-center rounded-md"
								style={{ backgroundColor: stat.color + '20' }}
							>
								<stat.icon
									className="h-4 w-4"
									style={{ color: stat.color }}
								/>
							</div>
							<div className="flex-1">
								<div className="text-sm font-medium">
									{stat.label}
								</div>
							</div>
							<div className="text-sm font-semibold tabular-nums">
								<CountUp
									start={0}
									end={stat.value}
									duration={2}
									formattingFn={(num) => num.toLocaleString()}
								/>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pie Chart */}
			<div className="flex items-center justify-center">
				<ChartContainer
					config={chartConfig}
					className="h-[180px] w-[180px]"
				>
					<PieChart>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<Pie
							data={chartData}
							dataKey="value"
							nameKey="name"
							innerRadius={50}
							outerRadius={80}
							strokeWidth={3}
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
			</div>
		</div>
	);
}
