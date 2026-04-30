import AdBanner from '@/components/ad-banner';
import { AppPageShell } from '@/components/body/page-shell';
import { EmptyState } from '@/components/page/empty-state';
import { MarketingSlot } from '@/components/page/marketing-slot';
import { PageSection } from '@/components/page/page-section';
import useActivation from '@/hooks/use-activation';
import useInstalled from '@/hooks/use-is-installed';
import { __ } from '@/lib/i18n';
import { useNavigate } from '@/router';
import { useEffect } from '@wordpress/element';
import { Package } from 'lucide-react';
import PendingInstallsCard from './_components/pending-installs-card';
import UpdatesTable, {
	UpdatesTableSkeleton
} from './_components/updates-table';

export default function Component() {
	const { list, isLoading } = useInstalled();
	const navigate = useNavigate();
	const { active, activated } = useActivation();
	useEffect(() => {
		if (!active || !activated) {
			navigate('/');
		}
	}, [activated, active, navigate]);

	const hasItems = list && list.length > 0;
	const showEmpty = list && list.length === 0;
	const pageTitle = __('Updates');
	const pageDescription = __(
		'Update or reinstall items you have already installed from GrootMade.'
	);

	return (
		<AppPageShell
			title={pageTitle}
			compactListing
			showTitle={false}
			isLoading={isLoading}
			preloader={<UpdatesTableSkeleton />}
			breadcrump={[
				{
					label: __('Updates')
				}
			]}
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
				<div className="gm-reveal-stagger flex flex-col gap-5 sm:gap-6">
					<PendingInstallsCard />
					{hasItems ? (
						<PageSection
							title={__('Installed items')}
							description={__(
								'Select rows for bulk update, reinstall, or auto-update toggles.'
							)}
						>
							<UpdatesTable data={list} />
						</PageSection>
					) : null}
					<MarketingSlot>
						<AdBanner />
					</MarketingSlot>
					{showEmpty ? (
						<EmptyState
							icon={Package}
							title={__('No installed items yet')}
							description={__(
								'Install a theme or plugin from the library first. Updates for those items will appear here.'
							)}
							action={{
								label: __('Browse themes'),
								to: '/item/theme'
							}}
						/>
					) : null}
				</div>
			</div>
		</AppPageShell>
	);
}
