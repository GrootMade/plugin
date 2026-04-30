import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Link } from '@/router';
import { TPostItemCollection } from '@/types/item';
import { useMemo } from '@wordpress/element';
import { ClassNameValue } from 'tailwind-merge';
import { StackedBarChart, StackedBarChartDataType } from './stacked-bar-chart';

type Props = {
	className?: ClassNameValue;
	variant?: 'default' | 'compact';
};

export default function InstallStats({
	className,
	variant = 'default'
}: Props) {
	const compact = variant === 'compact';
	const { data } = useApiFetch<TPostItemCollection>(API.update.read, {});
	const themes = useMemo(() => {
		if (data?.data) {
			return data?.data?.filter((item) => item.type === 'theme');
		}
		return [];
	}, [data]);
	const plugins = useMemo(() => {
		if (data?.data) {
			return data?.data?.filter((item) => item.type === 'plugin');
		}
		return [];
	}, [data]);
	const chartData = useMemo<StackedBarChartDataType[]>(
		() => [
			{
				name: 'theme',
				label: __('Themes'),
				value: themes?.length,
				color: 'hsl(var(--chart-1))'
			},
			{
				name: 'plugin',
				label: __('Plugins'),
				value: plugins?.length,
				color: 'hsl(var(--chart-2))'
			}
		],
		[plugins, themes]
	);
	const total = plugins.length + themes.length;
	return (
		<Card className={cn('aspect-auto justify-between', className)}>
			<CardHeader
				className={cn(
					'border-border border-b',
					compact &&
						'flex flex-row flex-wrap items-center justify-between gap-2 py-3'
				)}
			>
				<CardTitle
					className={cn(
						'font-medium',
						compact ? 'text-sm' : 'text-lg'
					)}
				>
					{__('Installed Assets')}
				</CardTitle>
				{compact ? (
					<Link
						to="/updates"
						className="text-primary text-xs font-medium no-underline underline-offset-4 hover:underline sm:text-sm"
					>
						{__('Open updates')}
					</Link>
				) : null}
			</CardHeader>
			<CardContent
				className={cn(
					'flex flex-col',
					compact ? 'gap-2 pt-4' : 'gap-4'
				)}
			>
				<div
					className={cn(
						'text-muted-foreground',
						compact ? 'text-xs' : ''
					)}
				>
					{__('Installed')}
				</div>
				<div className="space-x-2">
					<span
						className={
							compact ? 'text-2xl font-semibold' : 'text-3xl'
						}
					>
						{total}
					</span>
					<span
						className={cn(
							'text-muted-foreground',
							compact ? 'text-sm' : ''
						)}
					>
						{__('Items')}
					</span>
				</div>
				<StackedBarChart
					compact={compact}
					data={chartData}
				/>
			</CardContent>
		</Card>
	);
}
