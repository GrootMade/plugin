import AdBanner from '@/components/ad-banner';
import { AppPageShell } from '@/components/body/page-shell';
import useActivation from '@/hooks/use-activation';
import useInstalled from '@/hooks/use-is-installed';
import { __ } from '@/lib/i18n';
import { useNavigate } from '@/router';
import { useEffect } from 'react';
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
	return (
		<AppPageShell
			title={__('Updates')}
			isLoading={isLoading}
			preloader={<UpdatesTableSkeleton />}
			breadcrump={[
				{
					label: __('Updates')
				}
			]}
		>
			<PendingInstallsCard />
			<AdBanner />
			{list && <UpdatesTable data={list} />}
		</AppPageShell>
	);
}
