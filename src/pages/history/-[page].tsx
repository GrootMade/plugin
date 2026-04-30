import { AppPageShell } from '@/components/body/page-shell';
import useActivation from '@/hooks/use-activation';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { useNavigate, useParams } from '@/router';
import { HistoryCollectionType } from '@/types/history';
import { useEffect } from '@wordpress/element';
import HistoryItems from './_components/history-items';

export default function Component() {
	const { page } = useParams('/history/:page?');
	const navigate = useNavigate();
	const { active, activated } = useActivation();

	useEffect(() => {
		if (!active || !activated) {
			navigate('/');
		}
	}, [activated, active, navigate]);
	const { data, isLoading } = useApiFetch<HistoryCollectionType>(
		API.history.read,
		{
			page: Number(page ?? 1)
		}
	);
	const pageTitle = __('History');
	const pageDescription = __(
		'A log of downloads and installs from this WordPress site.'
	);
	return (
		<AppPageShell
			title={pageTitle}
			compactListing
			showTitle={false}
			isLoading={isLoading}
			breadcrump={[{ label: __('History') }]}
		>
			<div className="flex flex-col gap-3">
				<div className="border-border/80 bg-card rounded-lg border p-3 shadow-sm sm:p-4">
					<div className="min-w-0">
						<h1 className="font-heading text-foreground text-lg font-semibold tracking-tight sm:text-xl">
							{pageTitle}
						</h1>
						<p className="text-muted-foreground mt-0.5 text-xs leading-snug sm:text-sm">
							{pageDescription}
						</p>
					</div>
				</div>
				<div className="gm-reveal-stagger">
					<HistoryItems data={data} />
				</div>
			</div>
		</AppPageShell>
	);
}
