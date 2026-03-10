import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { __ } from '@/lib/i18n';
import renderHtml from '@/lib/render-html';
import { TPostItem } from '@/types/item';

type Props = {
	item: TPostItem;
};
export default function ItemDescription({ item }: Props) {
	return (
		<Card className="max-md:order-4">
			<CardHeader className="border-b p-5 sm:p-7">
				{__('Description')}
			</CardHeader>
			<CardContent className="item-description break-words p-5 text-sm leading-relaxed sm:p-7">
				{renderHtml(item.summary ?? '')}
			</CardContent>
		</Card>
	);
}
