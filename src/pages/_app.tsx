import { Button } from '@/components/ui/button';
import Layout from '@/layouts/Layout';
import { __ } from '@/lib/i18n';
import { AlertTriangle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
export default function Component() {
	return <Layout />;
}
export function Catch() {
	const navigate = useNavigate();
	const location = useLocation();
	function onBack() {
		if (location.key !== 'default') {
			navigate(-1);
		} else {
			navigate('/');
		}
	}
	return (
		<main className="bg-background flex min-h-[70vh] flex-col items-center justify-center px-6 py-16 text-center">
			<div className="flex max-w-md flex-col items-center gap-4">
				<div className="bg-destructive/10 text-destructive flex h-16 w-16 items-center justify-center rounded-2xl">
					<AlertTriangle
						className="h-8 w-8"
						strokeWidth={1.5}
						aria-hidden
					/>
				</div>
				<h1 className="font-heading text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
					{__('Something went wrong')}
				</h1>
				<p className="text-muted-foreground text-sm leading-relaxed">
					{__(
						'An unexpected error occurred. Try going back or return to the dashboard.'
					)}
				</p>
				<Button
					type="button"
					onClick={onBack}
					className="mt-2"
				>
					{__('Go back')}
				</Button>
			</div>
		</main>
	);
}
