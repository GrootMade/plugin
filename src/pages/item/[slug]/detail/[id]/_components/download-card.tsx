import BulkButton from '@/components/bulk-button';
import CollectionButton from '@/components/collection-button';
import InstallButton from '@/components/install-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useActivation from '@/hooks/use-activation';
import { __ } from '@/lib/i18n';
import { TPostItem } from '@/types/item';
import { Eye } from 'lucide-react';
import ItemRequestUpdate from './item-request-update';

type Props = {
	item: TPostItem;
};
export default function DownloadCard({ item }: Props) {
	const { activated, active } = useActivation();

	if (item.type === 'request') {
		return null;
	}

	return (
		<Card className="max-md:order-3">
			<CardHeader className="flex flex-row items-center justify-between border-b">
				<span className="font-semibold">{__('Download')}</span>
				<Badge
					variant="outline"
					className="text-muted-foreground"
				>
					{__('Download Now')}
				</Badge>
			</CardHeader>
			<CardContent className="flex flex-col gap-4">
				<ButtonGroup className="w-full">
					<InstallButton
						item={item}
						variant="default"
						className="min-w-0 flex-1"
					/>
					<BulkButton
						item={item}
						variant="secondary"
						size="icon"
					/>
					<CollectionButton
						item={item}
						variant="secondary"
						size="icon"
					/>
					{item.product_url && item.product_url.length > 0 && (
						<Button
							variant="secondary"
							size="icon"
							asChild
						>
							<a
								href={item.product_url}
								target="_blank"
								rel="noreferrer"
								title={__('View Original Product Page')}
							>
								<Eye className="h-4 w-4" />
							</a>
						</Button>
					)}
					{activated && active && (
						<ItemRequestUpdate
							item={item}
							variant="secondary"
							size="icon"
						/>
					)}
				</ButtonGroup>
			</CardContent>
		</Card>
	);
}
