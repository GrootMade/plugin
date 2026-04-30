import { DiscordIcon } from '@/components/icons/discord';
import { Badge } from '@/components/ui/badge';
import useApiFetch from '@/hooks/use-api-fetch';
import useInstalled from '@/hooks/use-is-installed';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { ItemStatsResponse } from '@/types/item';
import {
	ArrowLeft,
	BookOpen,
	Clock,
	Drum,
	Flame,
	Heart,
	HomeIcon,
	Layers,
	Library,
	List,
	MessageCircle,
	Palette,
	PlayCircle,
	Repeat,
	Settings,
	ShieldCheck,
	Sparkles,
	ToyBrick
} from 'lucide-react';
import React from 'react';
import useActivation from './use-activation';

type IconProps = React.HTMLAttributes<SVGElement>;

type NavItemBase = {
	label: string;
	icon: React.ComponentType<IconProps>;
	disabled?: boolean;
	/** Total items in catalog when loaded (from API) */
	count?: number;
	useNotice?: React.ComponentType | (() => React.ReactNode);
	as?: 'link' | 'a';
	external?: boolean;
};

type NavItemWithHref = NavItemBase & {
	href: string;
	subMenu?: never;
};

type NavItemWithSubMenu = NavItemBase & {
	href?: never;
	subMenu: {
		label: string;
		href: string;
		icon: React.ComponentType<IconProps>;
		external?: boolean;
		disabled?: boolean;
	}[];
};

export type NavItem = NavItemWithHref | NavItemWithSubMenu;

export type SidebarNavItems = {
	id: string;
	label: string;
	showLabel?: boolean;
	items: NavItem[];
};

export default function useSidebar() {
	const { updateable } = useInstalled();
	const { activated, active } = useActivation();
	const { data: stats, isSuccess: statsReady } =
		useApiFetch<ItemStatsResponse>(API.item.readStats);

	const licensed = activated && active;

	const items: SidebarNavItems[] = [
		{
			id: 'primary',
			showLabel: false,
			label: '',
			items: [
				{
					label: __('WP admin'),
					icon: ArrowLeft,
					href: 'index.php',
					as: 'a'
				},
				{
					label: __('Dashboard'),
					icon: HomeIcon,
					href: '/'
				}
			]
		},
		{
			id: 'explore',
			label: __('Explore'),
			showLabel: true,
			items: [
				{
					label: __('Browse all'),
					icon: Layers,
					href: '/browse',
					...(statsReady && stats
						? { count: stats.themes + stats.plugins }
						: {})
				},
				{
					label: __('Most popular'),
					icon: Flame,
					href: '/browse?order_by=popularity&order=desc'
				},
				{
					label: __('Latest updated'),
					icon: Clock,
					href: '/browse?order_by=updated&order=desc'
				},
				{
					label: __('Newest'),
					icon: Sparkles,
					href: '/browse?order_by=added&order=desc'
				},
				{
					label: __('Themes'),
					icon: Palette,
					href: '/item/theme',
					...(statsReady && stats ? { count: stats.themes } : {})
				},
				{
					label: __('Plugins'),
					icon: ToyBrick,
					href: '/item/plugin',
					...(statsReady && stats ? { count: stats.plugins } : {})
				},
				{
					label: __('Template kits'),
					icon: Drum,
					href: '/item/template-kit',
					...(statsReady && stats ? { count: stats.kits } : {})
				},
				{
					label: __('Requests'),
					icon: Library,
					href: '/item/request'
				}
			]
		},
		{
			id: 'library',
			label: __('Your library'),
			showLabel: true,
			items: [
				{
					label: __('Collections'),
					icon: Heart,
					href: '/collection',
					disabled: !licensed
				},
				{
					label: __('Updates'),
					icon: Repeat,
					href: '/updates',
					disabled: !licensed,
					useNotice: () => {
						if (updateable && updateable.length > 0) {
							return (
								<Badge
									variant="success"
									size="sm"
									className="shrink-0 tabular-nums"
								>
									{updateable.length}
								</Badge>
							);
						}
					}
				},
				{
					label: __('History'),
					icon: List,
					href: '/history',
					disabled: !licensed
				}
			]
		},
		{
			id: 'configuration',
			label: __('Configuration'),
			showLabel: true,
			items: [
				{
					label: __('License'),
					icon: ShieldCheck,
					href: '/activation'
				},
				{
					label: __('Plugin settings'),
					icon: Settings,
					href: '/settings'
				}
			]
		},
		{
			id: 'resources',
			label: __('Resources'),
			showLabel: true,
			items: [
				{
					label: __('AI Assistant'),
					icon: Sparkles,
					href: '/ai'
				},
				{
					label: __('Videos'),
					icon: PlayCircle,
					href: '/videos'
				},
				{
					label: __('Documentation'),
					icon: BookOpen,
					href: '/docs'
				},
				{
					label: __('Community'),
					icon: MessageCircle,
					href: 'https://meta.grootmade.com/',
					as: 'a',
					external: true
				},
				{
					label: __('Discord'),
					icon: DiscordIcon,
					href: 'https://discord.gg/grootmade',
					as: 'a',
					external: true
				}
			]
		}
	];

	return { items };
}
