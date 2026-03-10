import useActivation from '@/hooks/use-activation';
import useInstall from '@/hooks/use-install';
import { __ } from '@/lib/i18n';
import { TPostItem } from '@/types/item';
import { useState } from '@wordpress/element';
import { Download, Loader } from 'lucide-react';
import { Button, ButtonProps } from './ui/button';

type Props = {
	item: TPostItem;
} & ButtonProps;

export default function DownloadButton({ item, variant, size }: Props) {
	const { activated, active, can_download } = useActivation();
	const { downloadItem } = useInstall();
	const [isPending, setIsPending] = useState(false);

	if (item.type === 'request' || !can_download) {
		return null;
	}

	return (
		<Button
			variant={variant ?? 'outline'}
			size={size ?? 'icon'}
			className="flex items-center gap-2"
			disabled={isPending || !activated || !active}
			title={__('Download')}
			onClick={() => {
				setIsPending(true);
				downloadItem(item)
					.then(() => setIsPending(false))
					.catch(() => setIsPending(false));
			}}
		>
			{isPending ? (
				<Loader className="h-4 w-4 animate-spin" />
			) : (
				<Download width={16} />
			)}
		</Button>
	);
}
