import { cn } from '@/lib/utils';
import { useEffect } from '@wordpress/element';
import { useLocation } from 'react-router-dom';
type Props = {
	title: string;
	back?: boolean;
};
export default function PageTitle({ title }: Props) {
	const location = useLocation();
	useEffect(() => {
		document.title = title;
	}, [location, title]);
	return (
		title && (
			<div
				className={cn(
					'flex w-full flex-row items-center justify-between gap-3'
				)}
			>
				<h2 className={cn('text-foreground text-xl font-semibold')}>
					{title}
				</h2>
			</div>
		)
	);
}
