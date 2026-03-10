import AdBanner from '@/components/ad-banner';
import AdCard from '@/components/ad-card';
import { AppPageShell } from '@/components/body/page-shell';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { __ } from '@/lib/i18n';
import InstallStats from './_components/install-stats';
import LicenseStatus from './_components/license-status';
import OverviewStats from './_components/overview-stats';
import PopularItems from './_components/popular-items';

export default function Component() {
	return (
		<AppPageShell
			title={__('Dashboard')}
			breadcrump={[
				{
					label: __('Dashboard')
				}
			]}
		>
			{/* Overview: product stats + pie chart */}
			<Card>
				<CardHeader className="border-b">
					<h3 className="text-lg font-semibold">
						{__('Product Overview')}
					</h3>
				</CardHeader>
				<CardContent>
					<OverviewStats />
				</CardContent>
			</Card>

			<AdBanner />

			{/* License + Installed side by side */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
				<LicenseStatus />
				<InstallStats />
			</div>

			<AdBanner />

			{/* Popular themes + plugins */}
			<div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-7">
				<PopularItems type="theme" />
				<PopularItems type="plugin" />
			</div>

			<AdCard />
		</AppPageShell>
	);
}
