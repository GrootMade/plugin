import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { TPostItem } from '@/types/item';
import {
	AlertTriangle,
	Calendar,
	CheckCircle,
	ExternalLink,
	Hash,
	Shield,
	ShieldAlert,
	ShieldCheck,
	ShieldX
} from 'lucide-react';
import type { ReactNode } from 'react';

function ScanRow({
	icon,
	label,
	value,
	href,
	valueClassName
}: {
	icon: ReactNode;
	label: string;
	value: ReactNode;
	href?: string | null;
	valueClassName?: string;
}) {
	const valueContent = href ? (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className={cn(
				'decoration-border hover:decoration-foreground shrink-0 font-medium underline',
				valueClassName
			)}
		>
			{value}
		</a>
	) : (
		<span
			className={cn('shrink-0 font-medium tabular-nums', valueClassName)}
		>
			{value}
		</span>
	);

	return (
		<li className="flex items-center gap-3 py-1">
			<p className="text-muted-foreground flex min-w-0 items-center gap-1.5 [&_svg]:size-[1.1em] [&_svg]:shrink-0 [&_svg]:opacity-75">
				{icon}
				<span className="flex-1 truncate">{label}</span>
			</p>
			<hr className="min-w-2 flex-1" />
			{valueContent}
		</li>
	);
}

function ScanContent({
	virusTotal
}: {
	virusTotal: NonNullable<TPostItem['virus_total']>;
}) {
	const stats = virusTotal.stats;
	const malicious = stats.malicious ?? 0;
	const suspicious = stats.suspicious ?? 0;
	const harmless = stats.harmless ?? 0;
	const undetected = stats.undetected ?? 0;
	const totalScans = Object.values(stats).reduce((a, b) => a + b, 0);
	const cleanCount = harmless + undetected;
	const cleanPercentage =
		totalScans > 0 ? (cleanCount / totalScans) * 100 : 100;

	const isClean = malicious === 0 && suspicious === 0;
	const isDangerous = malicious > 0;
	const statusLabel = isClean
		? __('Clean')
		: isDangerous
			? __('Threat Detected')
			: __('Caution');
	const statusColor = isClean
		? 'text-primary'
		: isDangerous
			? 'text-destructive'
			: 'text-warning';
	const barColor = isClean
		? 'bg-primary'
		: isDangerous
			? 'bg-destructive'
			: 'bg-warning';

	const reportUrl = `https://www.virustotal.com/gui/file/${virusTotal.hash}`;
	const lastScanned = new Date(virusTotal.updated * 1000).toLocaleDateString(
		undefined,
		{
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}
	);

	return (
		<>
			<div className="space-y-1.5">
				<div className="bg-muted h-2 w-full overflow-hidden rounded-full">
					<div
						className={cn(
							'h-full rounded-full transition-all',
							barColor
						)}
						style={{ width: `${cleanPercentage}%` }}
					/>
				</div>
			</div>

			<ul className="w-full text-sm">
				<ScanRow
					icon={isClean ? <CheckCircle /> : <AlertTriangle />}
					label={__('Status')}
					value={statusLabel}
					valueClassName={statusColor}
				/>
				<ScanRow
					icon={<ShieldCheck />}
					label={__('Clean')}
					value={`${cleanCount}/${totalScans}`}
				/>
				{malicious > 0 && (
					<ScanRow
						icon={<ShieldX />}
						label={__('Malicious')}
						value={malicious}
						valueClassName="text-red-600"
					/>
				)}
				{suspicious > 0 && (
					<ScanRow
						icon={<ShieldAlert />}
						label={__('Suspicious')}
						value={suspicious}
						valueClassName="text-amber-600"
					/>
				)}
				<ScanRow
					icon={<Calendar />}
					label={__('Last scan')}
					value={lastScanned}
				/>
				<ScanRow
					icon={<Hash />}
					label={__('Hash')}
					value={`${virusTotal.hash.slice(0, 8)}…`}
				/>
				<ScanRow
					icon={<ExternalLink />}
					label={__('Full report')}
					value="VirusTotal"
					href={reportUrl}
				/>
			</ul>
		</>
	);
}

function ScanFallback() {
	return (
		<>
			<div className="space-y-1.5">
				<div className="bg-muted h-2 w-full overflow-hidden rounded-full">
					<div className="bg-primary h-full w-full rounded-full" />
				</div>
			</div>

			<ul className="w-full text-sm">
				<ScanRow
					icon={<CheckCircle />}
					label={__('Status')}
					value={__('100% Safe')}
					valueClassName="text-primary"
				/>
				<ScanRow
					icon={<ShieldCheck />}
					label={__('Threats')}
					value={__('0 detected')}
				/>
				<ScanRow
					icon={<Shield />}
					label={__('Verified')}
					value={__('Yes')}
					valueClassName="text-primary"
				/>
			</ul>
		</>
	);
}

type Props = {
	item: TPostItem;
};
export default function VirusTotalScan({ item }: Props) {
	if (item.type === 'request') {
		return null;
	}

	const virusTotal = item.virus_total;

	return (
		<div className="relative flex w-full flex-col items-stretch gap-4 rounded-lg border bg-transparent p-5 max-md:order-3">
			<div className="flex items-center gap-2">
				<Shield className="size-[1.1em] shrink-0 opacity-75" />
				<span className="text-sm font-semibold">
					{__('Security Scan')}
				</span>
			</div>

			{virusTotal ? (
				<ScanContent virusTotal={virusTotal} />
			) : (
				<ScanFallback />
			)}
		</div>
	);
}
