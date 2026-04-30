import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { type ButtonProps, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '@/components/ui/tooltip';
import useSidebar, { NavItem } from '@/hooks/use-sidebar';
import { cn, isLinkActive } from '@/lib/utils';
import { memo, useMemo } from '@wordpress/element';
import { type VariantProps } from 'class-variance-authority';
import { ChevronDown, ExternalLinkIcon } from 'lucide-react';
import { millify } from 'millify';
import { Link, useLocation } from 'react-router-dom';
import BulkAction from '../bulk-action';

type LinkStyleProps = {
	active?: boolean;
	disabled?: boolean;
	className?: string;
} & VariantProps<typeof buttonVariants>;

function formatSidebarCount(n: number) {
	return millify(n, { precision: n >= 1000 ? 1 : 0, lowercase: true });
}

function linkStyle({ active, disabled, className, ...props }: LinkStyleProps) {
	return cn(
		buttonVariants({
			variant: active ? 'secondary' : 'ghost',
			size: props.size,
			...props
		}),
		'flex h-9 w-full items-center justify-start gap-3 rounded-md px-3 text-sm transition-colors',
		disabled && 'pointer-events-none opacity-50',
		className
	);
}

type SidebarNavProps = {
	isCollapsed?: boolean;
};

export function SidebarNav({ isCollapsed = false }: SidebarNavProps) {
	const { pathname, search } = useLocation();
	const { items } = useSidebar();

	// Memoize the useNotice functions for each item to ensure stability
	const memoizedItems = useMemo(() => {
		return items.map((nav) => ({
			...nav,
			items: nav.items.map((item) => ({
				...item,
				useNotice: item.useNotice // Assuming useNotice is defined per item
			}))
		}));
	}, [items]);

	return (
		<TooltipProvider
			disableHoverableContent
			delayDuration={0}
		>
			<nav className="flex flex-col gap-2">
				<div className="flex flex-row gap-2 lg:hidden">
					<BulkAction />
				</div>
				{memoizedItems.map((nav, index) => (
					<div key={nav.id}>
						{nav.showLabel && !isCollapsed && (
							<h3 className="text-muted-foreground mb-2 px-2 pt-2 text-[11px] font-semibold tracking-wider uppercase">
								{nav.label}
							</h3>
						)}
						<ul className="flex flex-col gap-1">
							{nav.items.map((item) => (
								<li key={item.label}>
									{/**
									 * if the item has a subMenu, we will render an accordion component to handle the subMenu
									 * otherwise, we will render a simple link
									 */}
									{item.subMenu ? (
										<Accordion
											type="single"
											collapsible
											defaultValue={
												item.subMenu.find((subItem) =>
													isLinkActive(
														pathname,
														subItem.href,
														search
													)
												)
													? item.label
													: undefined
											}
										>
											<AccordionItem value={item.label}>
												<Tooltip>
													<TooltipTrigger asChild>
														<AccordionTrigger
															className={linkStyle(
																{
																	className:
																		'justify-between'
																}
															)}
														>
															<div className="flex items-center justify-start gap-3">
																<item.icon
																	className={cn(
																		'shrink-0',
																		isCollapsed
																			? 'h-5 w-5'
																			: 'h-4 w-4'
																	)}
																/>
																{!isCollapsed && (
																	<span className="truncate">
																		{
																			item.label
																		}
																	</span>
																)}
															</div>
														</AccordionTrigger>
													</TooltipTrigger>
													{isCollapsed && (
														<TooltipContent
															side="right"
															className="flex items-center gap-2 font-medium"
														>
															<span>
																{item.label}
															</span>
															<ChevronDown className="h-4 w-4" />
														</TooltipContent>
													)}
												</Tooltip>
												<AccordionContent
													className={cn(
														'flex flex-col gap-1 pt-1',
														isCollapsed
															? ''
															: 'relative pr-0 pl-7'
													)}
												>
													{item.subMenu.map(
														(subItem) => (
															<Tooltip
																key={
																	subItem.label
																}
															>
																<TooltipTrigger className="h-full w-full">
																	<NavLink
																		{...subItem}
																		active={isLinkActive(
																			pathname,
																			subItem.href,
																			search
																		)}
																		isCollapsed={
																			isCollapsed
																		}
																	/>
																</TooltipTrigger>
																{isCollapsed && (
																	<TooltipContent
																		side="right"
																		className="flex items-center gap-4 font-medium"
																	>
																		{
																			subItem.label
																		}
																	</TooltipContent>
																)}
															</Tooltip>
														)
													)}

													{!isCollapsed && (
														<Separator
															orientation="vertical"
															className="absolute right-auto bottom-2 left-5"
														/>
													)}
												</AccordionContent>
											</AccordionItem>
										</Accordion>
									) : (
										<Tooltip>
											<TooltipTrigger className="h-full w-full">
												<NavLink
													{...item}
													active={isLinkActive(
														pathname,
														item.href,
														search
													)}
													isCollapsed={isCollapsed}
													useNotice={item.useNotice} // Pass the memoized useNotice
												/>
											</TooltipTrigger>
											{isCollapsed && (
												<TooltipContent
													side="right"
													className="flex max-w-xs flex-wrap items-center gap-2 font-medium"
												>
													<span>{item.label}</span>
													{'href' in item &&
														typeof item.count ===
															'number' && (
															<span className="text-muted-foreground tabular-nums">
																(
																{formatSidebarCount(
																	item.count
																)}
																)
															</span>
														)}
												</TooltipContent>
											)}
										</Tooltip>
									)}
								</li>
							))}
						</ul>

						{index !== memoizedItems.length - 1 && (
							<Separator className="my-1.5 opacity-60" />
						)}
					</div>
				))}
			</nav>
		</TooltipProvider>
	);
}

// Style the NavLink component to match the design system

type NavLinkProps = NavItem & {
	active?: boolean;
	isCollapsed?: boolean;
	size?: ButtonProps['size'];
};

function NavLink({
	href,
	as = 'link',
	label,
	icon: Icon,
	disabled,
	active,
	size = 'default',
	isCollapsed,
	external,
	count,
	useNotice: Notice
}: NavLinkProps) {
	const isExternal = href?.startsWith('http') ?? external;
	const linkTarget = isExternal ? '_blank' : '_self';
	const content = (
		<>
			<Icon
				className={cn('shrink-0', isCollapsed ? 'h-5 w-5' : 'h-4 w-4')}
			/>
			{!isCollapsed && (
				<span className="min-w-0 flex-1 truncate text-left">
					{label}
				</span>
			)}
			{isExternal && (
				<span className="text-muted-foreground shrink-0">
					<ExternalLinkIcon className="ml-1 h-3 w-3" />
				</span>
			)}
			{!isCollapsed && typeof count === 'number' && (
				<Badge
					variant="secondary"
					size="sm"
					className="text-muted-foreground ml-1.5 shrink-0 font-normal tabular-nums"
					title={String(count)}
				>
					{formatSidebarCount(count)}
				</Badge>
			)}
			{Notice ? <Notice /> : null}
		</>
	);
	if (as === 'link') {
		return (
			<Link
				to={href ?? ''}
				className={linkStyle({ active, disabled, size })}
				target={linkTarget}
				rel="noreferrer"
			>
				{content}
			</Link>
		);
	}
	return (
		<a
			href={href}
			className={linkStyle({ active, disabled, size })}
			target={linkTarget}
			rel="noreferrer"
		>
			{content}
		</a>
	);
}

// Memoize NavLink to prevent unnecessary re-renders
export default memo(NavLink);
