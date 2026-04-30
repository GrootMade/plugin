import ActionLoader from '@/components/ui/action-loader';
import { Button, ButtonProps } from '@/components/ui/button';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import useActivation from '@/hooks/use-activation';
import useApiMutation from '@/hooks/use-api-mutation';
import { PluginInstallResponse } from '@/hooks/use-install';
import useInstalled from '@/hooks/use-is-installed';
import useNotification from '@/hooks/use-notification';
import { API } from '@/lib/api-endpoints';
import { claimAfterDelay } from '@/lib/download-delay';
import { __, sprintf } from '@/lib/i18n';
import { useNavigate } from '@/router';
import { TApiError } from '@/types/api';
import { TDemoContent, TPostItem } from '@/types/item';
import { useState } from '@wordpress/element';
import { decodeEntities } from '@wordpress/html-entities';
import { CloudDownload, Download } from 'lucide-react';
type AdditionalContentDownloadSchema = {
	item_id: number | string;
	media_id?: number;
};
type Props = {
	item: TPostItem;
	media: TDemoContent;
} & ButtonProps;

export default function AdditionalDownloadButton({
	item,
	media,
	size,
	variant
}: Props) {
	const [open, setOpen] = useState(false);
	const navigate = useNavigate();
	const notify = useNotification();
	const { data: activation, active, activated } = useActivation();
	const { isPending: isInstallPending, mutateAsync: downloadAdditional } =
		useApiMutation<PluginInstallResponse, AdditionalContentDownloadSchema>(
			API.item.downloadAdditional
		);

	const { clearCache } = useInstalled();
	async function download() {
		if (typeof activation?.plan_type == 'undefined') {
			notify.error(__('License not activated'));
			navigate('/activation');
			return;
		}

		const uid = notify.add(
			__('Downloading'),
			'loading',
			decodeEntities(media.title)
		);

		try {
			const data = await downloadAdditional({
				item_id: item.id,
				media_id: media.id
			});

			let result = data;
			if (
				data.type === 'delay' &&
				data.delay_token &&
				data.delay_seconds
			) {
				const claimed = await claimAfterDelay(
					data.delay_token,
					data.delay_seconds,
					'download',
					item.id,
					undefined,
					media.id,
					undefined,
					(remaining) => {
						notify.update(uid, {
							title:
								remaining > 0
									? sprintf(
											__('Waiting %d seconds...'),
											remaining
										)
									: __('Downloading')
						});
					}
				);
				result = {
					...data,
					link: claimed.link,
					filename: claimed.filename
				};
			}

			if (result.link) {
				window.open(result.link, '_blank');
			}
			setOpen(false);
			notify.update(uid, {
				title: __('Successful'),
				status: 'success'
			});
			clearCache();
		} catch (err) {
			notify.update(uid, {
				title: (err as TApiError)?.message ?? __('Error'),
				status: 'error'
			});
			clearCache();
		}
	}
	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (!isInstallPending) {
					setOpen(isOpen);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className="flex items-center gap-2"
					disabled={isInstallPending || !activated || !active}
				>
					{isInstallPending ? (
						<ActionLoader />
					) : (
						<CloudDownload width={16} />
					)}
					{size != 'icon' && <span>{__('Download')}</span>}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="leading-normal">
						{decodeEntities(media.title)}
					</DialogTitle>
					<DialogDescription>
						{sprintf(
							__('Download demo content %s of %s'),
							decodeEntities(media.title),
							decodeEntities(item.title)
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="bg-muted/40 rounded-md border px-4 py-3 text-sm">
					<p className="text-muted-foreground mb-2">
						{sprintf(
							__(
								'%d download credit will be consumed from your account.'
							),
							1
						)}
					</p>
					<div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-1">
						<span>
							{sprintf(
								__('Daily Limit: %s'),
								activation?.today_limit?.toLocaleString()
							)}
						</span>
						<span>
							{sprintf(
								__('Used Today: %s'),
								activation?.today_limit_used?.toLocaleString()
							)}
						</span>
						{activation?.plan_title === 'recurring' && (
							<span>
								{sprintf(
									__('Total Limit: %s'),
									activation?.total_limit?.toLocaleString()
								)}
							</span>
						)}
					</div>
				</div>

				<DialogFooter className="sm:justify-between">
					<DialogClose asChild>
						<Button
							variant="outline"
							disabled={isInstallPending}
						>
							{__('Cancel')}
						</Button>
					</DialogClose>
					<Button
						onClick={() => download()}
						disabled={isInstallPending}
						className="gap-2"
					>
						{isInstallPending ? (
							<ActionLoader label={__('Downloading')} />
						) : (
							<>
								<Download size={16} />
								<span>{__('Download')}</span>
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
