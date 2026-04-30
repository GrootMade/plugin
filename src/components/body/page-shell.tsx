import { __ } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Fragment, useEffect } from '@wordpress/element';
import { Home } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import BulkAction from '../bulk-action';
import TypeSenseSearch from '../typesense-search';
import { Card, CardContent } from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import Notices from './notices';
type BreadCrumbType = {
	label: string;
	href?: string;
};
type Props = {
	children: React.ReactNode;
	as?: ElementType;
	title: string;
	description?: string;
	showTitle?: boolean;
	isLoading?: boolean;
	isError?: boolean;
	preloader?: JSX.Element;
	error?: JSX.Element;
	breadcrump?: BreadCrumbType[];
	filterBar?: React.ReactNode;
	/** Right side of the title row (e.g. primary actions); wraps on small screens */
	headerActions?: ReactNode;
	onSearchQueryChange?: (query: string) => void;
	/** Tighter global header + toolbar; use with FilterBar variant compact on listing pages */
	compactListing?: boolean;
	/** When true the content fills the full available width; default is constrained to max-w-5xl */
	fullWidth?: boolean;
};

export function AppPageShell({
	children,
	as,
	title,
	description,
	showTitle = true,
	isLoading = false,
	isError = false,
	preloader: PreloaderComponent,
	error: ErrorComponent,
	breadcrump,
	filterBar,
	headerActions,
	onSearchQueryChange,
	compactListing = false,
	fullWidth = false
}: Props) {
	const Container = as ?? 'main';
	if (!PreloaderComponent) {
		PreloaderComponent = (
			<div className="bg-card rounded-lg border p-5 sm:p-7">
				<div className="space-y-3">
					<Skeleton className="h-5 w-56 max-w-[80%]" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
				</div>
			</div>
		);
	}
	if (!ErrorComponent) {
		ErrorComponent = (
			<Card>
				<CardContent className="text-muted-foreground p-5 text-center sm:p-7">
					{__('Invalid Request')}
				</CardContent>
			</Card>
		);
	}
	function Out() {
		return isLoading ? (
			PreloaderComponent
		) : isError ? (
			ErrorComponent
		) : (
			<>{children}</>
		);
	}
	return (
		<div className="w-full space-y-7">
			<PageHeader
				title={title}
				showTitle={showTitle}
				description={description}
				headerActions={headerActions}
				onSearchQueryChange={onSearchQueryChange}
				compactTop={compactListing}
				breadcrump={breadcrump}
			/>
			<Container
				className={cn(
					'relative flex flex-col pb-8',
					compactListing ? 'gap-3 sm:gap-4' : 'gap-5 sm:gap-7',
					!fullWidth && 'mx-auto max-w-5xl',
					// Blur only while showing the preloader; refetch would flicker if we blurred on every isFetching
					isLoading && 'blur-sm'
				)}
			>
				<Notices />
				{filterBar && (
					<div
						className={cn(
							!compactListing &&
								'border-border border-b pb-4 sm:pb-5'
						)}
					>
						{filterBar}
					</div>
				)}
				<Out />
				{isLoading && (
					<div className="absolute top-0 left-0 h-full w-full cursor-progress" />
				)}
			</Container>
		</div>
	);
}

type PageHeaderProps = {
	title: string;
	showTitle: boolean;
	description?: string;
	headerActions?: ReactNode;
	onSearchQueryChange?: (query: string) => void;
	compactTop?: boolean;
	breadcrump?: BreadCrumbType[];
};

function PageHeader({
	title,
	showTitle,
	headerActions,
	onSearchQueryChange,
	compactTop = false,
	breadcrump
}: PageHeaderProps) {
	useEffect(() => {
		document.title = title;
	}, [title]);
	return (
		<>
			<header
				className={cn(
					'border-border flex flex-col border-b',
					compactTop
						? 'gap-3 pt-0 pb-3'
						: 'gap-4 pb-5 lg:pt-2 lg:pb-6'
				)}
			>
				<div className="flex items-center gap-2">
					<div className="min-w-0 flex-1">
						<TypeSenseSearch onQueryChange={onSearchQueryChange} />
					</div>
					<div className="shrink-0">
						<BulkAction />
					</div>
				</div>
				{(showTitle || breadcrump) && (
					<div className="flex items-center justify-between gap-4">
						<div className="flex min-w-0 flex-1 flex-col gap-1">
							{breadcrump && (
								<nav
									aria-label="breadcrumb"
									className="text-muted-foreground flex items-center gap-1 text-xs"
								>
									<Link
										to="/"
										className="hover:text-foreground flex items-center gap-1 transition-colors"
									>
										<Home
											size={11}
											className="shrink-0"
										/>
										{__('Home')}
									</Link>
									{breadcrump.map((item, index) => (
										<Fragment key={index}>
											<span className="text-muted-foreground/40 select-none">
												/
											</span>
											{item.href ? (
												<Link
													to={item.href}
													className="hover:text-foreground truncate transition-colors"
												>
													{item.label}
												</Link>
											) : (
												<span className="text-foreground/70 truncate">
													{item.label}
												</span>
											)}
										</Fragment>
									))}
								</nav>
							)}
							{showTitle && (
								<h1
									className={cn(
										'font-heading text-foreground leading-tight font-bold tracking-tight',
										compactTop
											? 'text-base sm:text-lg'
											: 'text-xl sm:text-2xl'
									)}
								>
									{title}
								</h1>
							)}
						</div>
						{headerActions ? (
							<div className="flex shrink-0 flex-wrap items-center gap-2">
								{headerActions}
							</div>
						) : null}
					</div>
				)}
			</header>
		</>
	);
}
