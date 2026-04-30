import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { archiveItemCoverSrc } from '@/lib/archive-item-cover';
import { __ } from '@/lib/i18n';
import renderHtml from '@/lib/render-html';
import { cn } from '@/lib/utils';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: true, breaks: true, linkify: true });

type Props = {
	item: TPostItem;
};
export default function ItemDescription({ item }: Props) {
	const imageSrc = archiveItemCoverSrc(item);
	const imageAlt = decodeEntities(item.title || __('Featured image'));
	const rawSummary = decodeEntities(item.summary ?? '');
	const isHtml = /<\/?[a-z][\s\S]*>/i.test(rawSummary);
	const summaryHtml = isHtml ? rawSummary : md.render(rawSummary);
	const hasHtmlTags = true;

	return (
		<Card className="max-md:order-4">
			<CardHeader className="border-b p-5 sm:p-7">
				{__('About')}
			</CardHeader>
			<div className="bg-muted/20 border-b p-5 sm:p-7">
				<div className="bg-card overflow-hidden rounded-lg border">
					<img
						src={imageSrc}
						alt={imageAlt}
						className="aspect-video w-full object-cover"
						loading="lazy"
					/>
				</div>
			</div>
			<CardContent
				className={cn(
					'item-description p-5 text-sm leading-relaxed wrap-break-word sm:p-7',
					!hasHtmlTags && 'whitespace-pre-line'
				)}
			>
				{renderHtml(summaryHtml)}
			</CardContent>
		</Card>
	);
}
