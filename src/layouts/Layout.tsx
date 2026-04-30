import { AppHeader } from '@/components/header/app-header';
import { Sidebar } from '@/components/sidebar/Sidebar';
import useSidebarCollapse from '@/hooks/use-sidebar-collapse';
import { cn } from '@/lib/utils';
import { Outlet } from 'react-router-dom';

export default function Layout() {
	const { collapsed, toggle } = useSidebarCollapse();
	return (
		<div className="container flex max-w-[100vw] items-start gap-6 px-3 sm:gap-8 sm:px-4 lg:px-6">
			<div
				className={cn(
					'sticky top-0 left-0 hidden h-screen shrink-0 transition-[width] duration-200 ease-in-out lg:block',
					collapsed ? 'w-16' : 'w-52 xl:w-60'
				)}
			>
				<Sidebar
					collapsed={collapsed}
					onToggleCollapse={toggle}
				/>
			</div>
			<section className="min-h-screen w-full min-w-0 flex-1">
				<div className="border-border bg-background/95 supports-backdrop-filter:bg-background/80 sticky top-0 right-0 left-0 z-50 -mx-3 border-b px-3 backdrop-blur sm:-mx-4 sm:px-4 lg:mx-0 lg:hidden lg:px-0">
					<AppHeader />
				</div>
				<div className="w-full py-4 sm:py-6 lg:py-8">
					<Outlet />
				</div>
			</section>
		</div>
	);
}
