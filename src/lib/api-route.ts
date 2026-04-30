import { siteConfig } from '@/config/site';
import { API, type ApiPath } from './api-endpoints';

const routeAliases: Record<string, ApiPath> = {
	'announcement/latest': API.announcement.read,
	'collection/add': API.collection.create,
	'collection/detail': API.collection.readDetail,
	'collection/item/add': API.collection.createItem,
	'collection/items': API.collection.readItems,
	'collection/list': API.collection.read,
	'disclaimer/get': API.disclaimer.read,
	'history/list': API.history.read,
	'item/detail': API.item.readDetail,
	'item/install': API.item.update,
	'item/list': API.item.readList,
	'item/stats': API.item.readStats,
	'license/activate': API.license.create,
	'license/deactivate': API.license.delete,
	'license/detail': API.license.read,
	'pack/download': API.pack.create,
	'pending-install/check-now': API.pendingInstall.create,
	'pending-install/status': API.pendingInstall.read,
	'popular/plugin': API.popular.readPlugins,
	'popular/theme': API.popular.readThemes,
	'setting/get': API.setting.read,
	'update/list': API.update.read,
	'update/setting/get': API.update.readSettings,
	'update/update-autoupdate': API.update.update
};

export function normalizeApiPath(path: string) {
	return routeAliases[path] ?? path;
}

export function buildApiUrl(path: string) {
	const normalizedPath = normalizeApiPath(path);
	const restPath = `/wp-json/${siteConfig.slug}/v1/${normalizedPath}`;

	if (typeof window === 'undefined') {
		return restPath;
	}

	return new URL(restPath, window.location.origin).toString();
}
