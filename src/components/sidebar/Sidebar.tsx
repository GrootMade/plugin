import LanguageSelector from '@/components/language-select';
import ModeToggle from '@/components/mode-toggle';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { siteConfig } from '@/config/site';
import useTheme from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Textfit } from 'react-textfit';
import { SidebarNav } from './SidebarNav';

type Props = {
	showLogo?: boolean;
	collapsed?: boolean;
	onToggleCollapse?: () => void;
};

export function Sidebar({
	showLogo = true,
	collapsed = false,
	onToggleCollapse
}: Props) {
	const { effectiveTheme } = useTheme();
	return (
		<aside className="flex h-full w-full flex-col overflow-hidden">
			{showLogo && (
				<div
					className={cn(
						'border-border/60 items-center border-b lg:border-0',
						collapsed
							? 'flex justify-center py-3'
							: 'justify-between py-5 lg:pt-2 lg:pb-4'
					)}
				>
					<Link
						to="/"
						className={cn(
							'flex items-center leading-tight',
							collapsed ? 'justify-center' : 'gap-3'
						)}
					>
						{siteConfig.logo[effectiveTheme]?.length > 0 ? (
							<>
								<img
									src={siteConfig.logo[effectiveTheme]}
									alt={siteConfig.name}
									className={cn(
										'w-auto transition-[height] duration-200',
										collapsed ? 'h-7' : 'h-9'
									)}
								/>
								{!collapsed && (
									<span className="font-heading text-foreground text-xl font-semibold">
										{siteConfig.name}
									</span>
								)}
							</>
						) : (
							!collapsed && (
								<Textfit
									mode="multi"
									className="flex flex-col justify-center"
									style={{
										height: 80,
										width: 230
									}}
								>
									{siteConfig.name}
								</Textfit>
							)
						)}
					</Link>
				</div>
			)}

			<ScrollArea className="flex-1">
				<div
					className={cn(
						'h-full w-full py-3',
						collapsed ? 'px-2' : 'px-3'
					)}
				>
					<SidebarNav isCollapsed={collapsed} />
				</div>
				<ScrollBar orientation="vertical" />
			</ScrollArea>

			<div
				className={cn(
					'border-border/60 flex border-t py-3',
					collapsed
						? 'flex-col items-center gap-2 px-2'
						: 'items-center gap-2 px-3'
				)}
			>
				{!collapsed && <LanguageSelector />}
				<ModeToggle />
			</div>

			{onToggleCollapse && (
				<button
					onClick={onToggleCollapse}
					className="border-border/60 text-muted-foreground hover:text-foreground hidden items-center justify-center border-t py-3 transition-colors lg:flex"
				>
					{collapsed ? (
						<ChevronsRight className="h-4 w-4" />
					) : (
						<ChevronsLeft className="h-4 w-4" />
					)}
				</button>
			)}
		</aside>
	);
}
