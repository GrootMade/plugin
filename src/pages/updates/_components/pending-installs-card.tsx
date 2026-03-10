import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader
} from '@/components/ui/card';
import useApiMutation from '@/hooks/use-api-mutation';
import useNotification from '@/hooks/use-notification';
import { __ } from '@/lib/i18n';
import { useCallback, useEffect, useState } from '@wordpress/element';

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
		useApiMutation<CheckNowResponse>('pending-install/check-now');
	const { mutateAsync: getStatus } = useApiMutation<PendingInstallStatus>(
		'pending-install/status'
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
			// Refresh status after check
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
		<Card>
			<CardHeader className="border-b">
				{__('Remote Installs')}
			</CardHeader>
			<CardContent className="flex flex-col gap-4 pt-4">
				<p className="text-sm text-muted-foreground">
					{__(
						'Items queued for remote installation from the web dashboard will be checked every 5 minutes. Use the button below to check immediately.'
					)}
				</p>
				{status?.last_check && (
					<div className="flex flex-col gap-2 rounded-lg border p-3 text-sm">
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								{__('Last checked')}
							</span>
							<span>
								{formatTimestamp(status.last_check.time)}
							</span>
						</div>
						<div className="flex justify-between">
							<span className="text-muted-foreground">
								{__('Items found')}
							</span>
							<span>{status.last_check.count}</span>
						</div>
						{status.last_check.error && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									{__('Note')}
								</span>
								<span className="text-orange-500">
									{status.last_check.error}
								</span>
							</div>
						)}
						{status.next_scheduled && (
							<div className="flex justify-between">
								<span className="text-muted-foreground">
									{__('Next check')}
								</span>
								<span>
									{formatTimestamp(
										status.next_scheduled as number
									)}
								</span>
							</div>
						)}
					</div>
				)}
			</CardContent>
			<CardFooter className="border-t pt-4">
				<Button
					onClick={handleCheckNow}
					disabled={isChecking}
					size="sm"
				>
					{isChecking ? __('Checking...') : __('Check Now')}
				</Button>
			</CardFooter>
		</Card>
	);
}
