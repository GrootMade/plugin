import { Card, CardContent, CardHeader } from '@/components/ui/card';
import useApiFetch from '@/hooks/use-api-fetch';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import renderHtml from '@/lib/render-html';
import { DisclaimerType } from '@/types/disclaimer';
import { TPostItem } from '@/types/item';
import Linkify from 'linkify-react';

type Props = {
	item: TPostItem;
};
export default function ItemDisclaimer({ item }: Props) {
	const { data } = useApiFetch<DisclaimerType>(
		API.disclaimer.read,
		{},
		!!item.copyright === false
	);
	return (
		<Card className="max-md:order-5">
			<CardHeader className="flex flex-row items-center justify-between border-b">
				{__('Legal Disclaimer')}
			</CardHeader>
			<CardContent className="text-sm wrap-break-word">
				<Linkify
					options={{
						target: '_blank',
						rel: 'noopener noreferrer',
						className: 'underline'
					}}
				>
					{renderHtml(item.copyright ?? data?.content)}
				</Linkify>
			</CardContent>
		</Card>
	);
}
