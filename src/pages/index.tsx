import AdBanner from '@/components/ad-banner';
import { AppPageShell } from '@/components/body/page-shell';
import { MarketingSlot } from '@/components/page/marketing-slot';
import { PageSection } from '@/components/page/page-section';
import { Button } from '@/components/ui/button';
import { __ } from '@/lib/i18n';
import { Link } from '@/router';
import Announcements from './_components/announcements';
import KpiBar from './_components/kpi-bar';
import LicenseStatus from './_components/license-status';
import PopularItems from './_components/popular-items';
import QuickActions from './_components/quick-actions';

export default function Component() {
	return (
		<AppPageShell
			title={__('Dashboard')}
			description={__('License and a snapshot of your catalog.')}
			breadcrump={[
				{
					label: __('Dashboard')
				}
			]}
			headerActions={
				<Button
					asChild
					size="sm"
				>
					<Link
						to="/popular/:slug?"
						params={{ slug: 'theme' }}
						className="no-underline"
					>
						{__('Browse themes')}
					</Link>
				</Button>
			}
		>
			<div className="gm-reveal-stagger mx-auto flex w-full max-w-6xl flex-col gap-5 sm:gap-6">
				<KpiBar compact />

				<div className="flex flex-col gap-2">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<p className="text-muted-foreground text-xs font-medium">
							{__('Shortcuts')}
						</p>
						<Link
							to="/popular/:slug?"
							params={{ slug: 'theme' }}
							className="text-primary text-xs font-medium no-underline underline-offset-4 hover:underline sm:text-sm"
						>
							{__('Browse catalog')}
						</Link>
					</div>
					<QuickActions compact />
				</div>

				<MarketingSlot>
					<AdBanner />
				</MarketingSlot>

				<PageSection title={__('Overview')}>
					<div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-5">
						<div className="min-w-0 lg:col-span-6">
							<LicenseStatus variant="compact" />
						</div>
						<div className="min-w-0 lg:col-span-6">
							<Announcements variant="compact" />
						</div>
					</div>
				</PageSection>

				<PageSection title={__('Discover')}>
					<div className="grid grid-cols-1 gap-4 xl:grid-cols-2 xl:gap-5">
						<div className="min-w-0">
							<PopularItems type="theme" />
						</div>

						<div className="min-w-0">
							<PopularItems type="plugin" />
						</div>
					</div>
				</PageSection>
			</div>
		</AppPageShell>
	);
}
