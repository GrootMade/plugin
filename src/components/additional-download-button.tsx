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
import { claimAfterDelay } from '@/lib/download-delay';
import { __ } from '@/lib/i18n';
import { useNavigate } from '@/router';
import { TApiError } from '@/types/api';
import { TDemoContent, TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { sprintf } from '@wordpress/i18n';
import { CloudDownload, Download, Loader } from 'lucide-react';
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
	const navigate = useNavigate();
	const notify = useNotification();
	const { data: activation, active, activated } = useActivation();
	const { isPending: isInstallPending, mutateAsync: downloadAdditional } =
		useApiMutation<PluginInstallResponse, AdditionalContentDownloadSchema>(
			'item/download-additional'
		);

	const { clearCache } = useInstalled();
	function download() {
		if (typeof activation?.plan_type == 'undefined') {
			notify.error(__('License not activated'));
			navigate('/activation');
			return;
		}
		const promise = downloadAdditional({
			item_id: item.id,
			media_id: media.id
		}).then(async (data) => {
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
					media.id
				);
				return {
					...data,
					link: claimed.link,
					filename: claimed.filename
				};
			}
			return data;
		});
		notify.promise(promise, {
			description: decodeEntities(media.title),
			loading: __('Downloading'),
			success(data) {
				if (data.link) {
					window.open(data.link, '_blank');
				}
				return __('Successful');
			},
			error(err: TApiError) {
				return err.message;
			},
			finally() {
				clearCache();
			}
		});
	}
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button
					variant={variant}
					size={size}
					className="flex items-center gap-2"
					disabled={isInstallPending || !activated || !active}
				>
					{isInstallPending ? (
						<Loader className="h-4 w-4 animate-spin" />
					) : (
						<CloudDownload width={16} />
					)}
					{size != 'icon' && <span>{__('Download')}</span>}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader className="text-center">
					<DialogTitle className="text-center leading-normal">
						{decodeEntities(media.title)}
					</DialogTitle>
					<DialogDescription
						className="flex flex-col gap-2 text-center"
						asChild
					>
						<div>
							<div>
								{sprintf(
									__('Download demo content %s of %s'),
									decodeEntities(media.title),
									decodeEntities(item.title)
								)}
							</div>
							<div>
								{sprintf(
									__(
										'%d download credit would be consumed from your account.'
									),
									1
								)}
							</div>
							<div className="flex flex-row justify-center divide-x">
								<div className="px-4">
									{sprintf(
										__('Daily Limit: %s'),
										activation?.today_limit?.toLocaleString()
									)}
								</div>
								<div className="px-4">
									{sprintf(
										__('Used Limit: %s'),
										activation?.today_limit_used?.toLocaleString()
									)}
								</div>
								{activation?.plan_title === 'recurring' && (
									<div className="p-4">
										{sprintf(
											__('Total Limit: %s'),
											activation?.total_limit?.toLocaleString()
										)}
									</div>
								)}
							</div>
						</div>
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<DialogClose asChild>
							<Button
								onClick={() => download()}
								className="gap-2"
							>
								<Download size={16} />
								<span>{__('Download')}</span>
							</Button>
						</DialogClose>

						<DialogClose asChild>
							<Button variant="outline">{__('Cancel')}</Button>
						</DialogClose>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
