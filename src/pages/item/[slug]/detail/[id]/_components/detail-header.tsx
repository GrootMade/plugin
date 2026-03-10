import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TPostItem } from '@/types/item';
import { decodeEntities } from '@wordpress/html-entities';
import { LayoutTemplate, Paintbrush, Plug } from 'lucide-react';

export function ItemDetailHeaderSkeleton() {
	return (
		<div className="grid gap-6 md:grid-cols-3 lg:gap-8">
			{/* Content column */}
			<div className="flex flex-col gap-5 sm:gap-7 md:col-span-2">
				{/* Header skeleton */}
				<div className="flex items-center gap-3 rounded-lg border bg-background/80 p-3">
					<Skeleton className="size-8 rounded-md" />
					<Skeleton className="h-5 w-52" />
					<Skeleton className="ml-auto hidden h-4 w-16 sm:block" />
				</div>

				{/* Forked-from skeleton */}
				<div className="flex flex-col gap-4">
					<div className="flex items-center gap-3 rounded-lg border bg-accent/40 px-4 py-3">
						<div className="flex flex-col gap-1.5">
							<Skeleton className="h-3 w-20" />
							<Skeleton className="h-4 w-36" />
						</div>
					</div>
					<Skeleton className="h-3 w-full" />
					<Skeleton className="h-3 w-3/4" />
				</div>

				{/* Image skeleton */}
				<Skeleton className="aspect-[16/9] w-full rounded-lg" />

				{/* Description skeleton */}
				<Card>
					<CardHeader className="border-b p-5 sm:p-7">
						<Skeleton className="h-4 w-28" />
					</CardHeader>
					<CardContent className="space-y-3 p-5 sm:p-7">
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-4/5" />
						<Skeleton className="h-3 w-full" />
						<Skeleton className="h-3 w-2/3" />
					</CardContent>
				</Card>
			</div>

			{/* Sidebar column */}
			<div className="flex flex-col gap-5 sm:gap-7 md:col-span-1">
				{/* Download card skeleton */}
				<Card>
					<CardHeader className="flex flex-row items-center justify-between border-b">
						<Skeleton className="h-4 w-24" />
						<Skeleton className="h-5 w-28 rounded-full" />
					</CardHeader>
					<CardContent className="flex flex-col gap-4">
						<Skeleton className="h-9 w-full rounded" />
					</CardContent>
				</Card>

				{/* Stats skeleton */}
				<div className="rounded-lg border p-5">
					<ul className="space-y-2">
						{Array.from({ length: 6 }).map((_, i) => (
							<li
								key={i}
								className="flex items-center gap-3 py-1"
							>
								<Skeleton className="size-4 rounded" />
								<Skeleton className="h-3 w-20" />
								<hr className="min-w-2 flex-1" />
								<Skeleton className="h-3 w-16" />
							</li>
						))}
					</ul>
				</div>

				{/* VirusTotal skeleton */}
				<div className="rounded-lg border p-5">
					<div className="space-y-3">
						<Skeleton className="h-2 w-full rounded-full" />
						<ul className="space-y-2">
							{Array.from({ length: 4 }).map((_, i) => (
								<li
									key={i}
									className="flex items-center gap-3 py-1"
								>
									<Skeleton className="size-4 rounded" />
									<Skeleton className="h-3 w-24" />
									<hr className="min-w-2 flex-1" />
									<Skeleton className="h-3 w-12" />
								</li>
							))}
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}

function TypeIcon({ type }: { type: string }) {
	const Icon =
		type === 'plugin'
			? Plug
			: type === 'theme'
				? Paintbrush
				: LayoutTemplate;

	return (
		<div className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-accent p-1.5">
			<Icon className="size-full text-muted-foreground" />
		</div>
	);
}

type Props = {
	item: TPostItem;
};
export default function ItemDetailHeader({ item }: Props) {
	return (
		<div className="sticky top-0 z-10 flex items-center gap-3 rounded-lg border bg-background/80 p-3 backdrop-blur-sm max-md:order-1">
			<TypeIcon type={item.type} />

			<div className="flex min-w-0 flex-1 items-center gap-2">
				<h1 className="truncate text-lg font-semibold leading-tight">
					{decodeEntities(item.title)}
				</h1>
				{item.version && item.type !== 'request' && (
					<span className="shrink-0 text-base text-muted-foreground">
						v{item.version}
					</span>
				)}
			</div>
		</div>
	);
}
