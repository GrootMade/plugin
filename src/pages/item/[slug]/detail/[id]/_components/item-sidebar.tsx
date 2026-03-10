import AdCard from '@/components/ad-card';
import { __ } from '@/lib/i18n';
import { TPostItem } from '@/types/item';
import DownloadCard from './download-card';
import ItemDetail from './item-detail';
import ItemDisclaimer from './item-disclaimer';
import ItemTerms from './item-terms';
import VirusTotalScan from './item-virus-total';

type Props = {
	item: TPostItem;
};
export default function ItemSidebar({ item }: Props) {
	return (
		<div className="sticky top-0 flex flex-col gap-5 max-md:contents sm:gap-7">
			<DownloadCard item={item} />
			<ItemDetail item={item} />
			<AdCard />
			<VirusTotalScan item={item} />
			<ItemDisclaimer item={item} />
			<ItemTerms
				title={__('Tags')}
				terms={item.terms?.filter((i) => i.taxonomy === 'fv_tag')}
			/>
			<ItemTerms
				title={__('Browsers')}
				terms={item.terms.filter(
					(i) => i.taxonomy === 'fv_compatible_browsers'
				)}
			/>
			<ItemTerms
				title={__('Compatible With')}
				terms={item.terms?.filter(
					(i) => i.taxonomy === 'fv_compatible_with'
				)}
			/>
			<ItemTerms
				title={__('Included Files')}
				terms={item.terms?.filter(
					(i) => i.taxonomy === 'files_included'
				)}
			/>
			<ItemTerms
				title={__('Software Versions')}
				terms={item.terms?.filter(
					(i) => i.taxonomy === 'software_version'
				)}
			/>
		</div>
	);
}
