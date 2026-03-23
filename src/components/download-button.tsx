import useActivation from '@/hooks/use-activation';
import useInstall from '@/hooks/use-install';
import { __ } from '@/lib/i18n';
import { TPostItem } from '@/types/item';
import { useState } from '@wordpress/element';
import { Download } from 'lucide-react';
import ActionLoader from './ui/action-loader';
import { Button, ButtonProps } from './ui/button';

type Props = {
	item: TPostItem;
} & ButtonProps;

export default function DownloadButton({ item, variant, size }: Props) {
	const { activated, active, can_download } = useActivation();
	const { downloadItem } = useInstall();
	const [isPending, setIsPending] = useState(false);

	if (item.type === 'request') {
		return null;
	}

	return (
		<Button
			variant={variant ?? 'outline'}
			size={size ?? 'icon'}
			className="flex items-center gap-2"
			disabled={isPending || !activated || !active || !can_download}
			title={__('Download')}
			onClick={() => {
				setIsPending(true);
				downloadItem(item).finally(() => setIsPending(false));
			}}
		>
			{isPending ? <ActionLoader /> : <Download width={16} />}
		</Button>
	);
}
