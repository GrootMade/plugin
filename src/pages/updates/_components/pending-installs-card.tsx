import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useApiMutation from '@/hooks/use-api-mutation';
import useNotification from '@/hooks/use-notification';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { useCallback, useEffect, useState } from '@wordpress/element';
import { CloudDownload } from 'lucide-react';

type PendingInstallStatus = {
	last_check: {
		time: number;
		count: number;
		error?: string;
	} | null;
	next_scheduled: number | false;
};

type CheckNowResponse = {
	message: string;
	count: number;
};

export default function PendingInstallsCard() {
	const notify = useNotification();
	const { mutateAsync: checkNow, isPending: isChecking } =
		useApiMutation<CheckNowResponse>(API.pendingInstall.create);
	const { mutateAsync: getStatus } = useApiMutation<PendingInstallStatus>(
		API.pendingInstall.read
	);
	const [status, setStatus] = useState<PendingInstallStatus | null>(null);

	const fetchStatus = useCallback(async () => {
		try {
			const result = await getStatus({});
			setStatus(result);
		} catch {
			// silently fail
		}
	}, [getStatus]);

	useEffect(() => {
		fetchStatus();
	}, [fetchStatus]);

	const handleCheckNow = useCallback(async () => {
		try {
			const result = await checkNow({});
			notify.success(result.message);
			await fetchStatus();
		} catch {
			notify.error(__('Failed to check for pending installs'));
		}
	}, [checkNow, fetchStatus, notify]);

	const formatTimestamp = (ts: number) => {
		const date = new Date(ts * 1000);
		return date.toLocaleString();
	};

	return (
		<Alert>
			<CloudDownload className="h-4 w-4" />
			<AlertTitle>{__('Remote Installs')}</AlertTitle>
			<AlertDescription>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="text-muted-foreground text-sm">
						{status?.last_check
							? `${__('Last checked')}: ${formatTimestamp(status.last_check.time)} · ${status.last_check.count} ${__('items found')}`
							: __(
									'Items queued for remote installation will be checked every 5 minutes.'
								)}
					</div>
					<Button
						onClick={handleCheckNow}
						disabled={isChecking}
						size="sm"
						variant="outline"
						className="shrink-0 self-start sm:self-auto"
					>
						{isChecking ? __('Checking...') : __('Check Now')}
					</Button>
				</div>
			</AlertDescription>
		</Alert>
	);
}
