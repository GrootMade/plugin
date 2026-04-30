export const API = {
	announcement: {
		read: 'announcement/read'
	},
	collection: {
		create: 'collection/create',
		createItem: 'collection/create/item',
		delete: 'collection/delete',
		read: 'collection/read',
		readDetail: 'collection/read/detail',
		readItems: 'collection/read/items'
	},
	documentation: {
		read: 'documentation/read',
		readTopic: 'documentation/read/topic'
	},
	disclaimer: {
		read: 'disclaimer/read'
	},
	history: {
		read: 'history/read'
	},
	item: {
		categories: 'item/categories',
		changelog: 'item/changelog',
		comments: 'item/comments',
		demoContent: 'item/demo-content',
		downloadAdditional: 'item/download-additional',
		readDetail: 'item/read/detail',
		readList: 'item/read/list',
		readStats: 'item/read/stats',
		requestUpdate: 'item/request-update',
		terms: 'item/terms',
		update: 'item/update'
	},
	license: {
		create: 'license/create',
		delete: 'license/delete',
		read: 'license/read'
	},
	pack: {
		create: 'pack/create'
	},
	pendingInstall: {
		create: 'pending-install/create',
		read: 'pending-install/read'
	},
	popular: {
		readPlugins: 'popular/read/plugins',
		readThemes: 'popular/read/themes'
	},
	setting: {
		language: 'setting/language',
		read: 'setting/read',
		readRoles: 'setting/read/roles',
		update: 'setting/update'
	},
	update: {
		create: 'update/create',
		delete: 'update/delete',
		read: 'update/read',
		readSettings: 'update/read/settings',
		update: 'update/update'
	},
	videos: {
		read: 'videos/read'
	}
} as const;

type ApiValues<T> = T[keyof T];

type ApiLeafValues<T> = T extends string
	? T
	: T extends Record<string, unknown>
		? ApiLeafValues<ApiValues<T>>
		: never;

export type ApiPath = ApiLeafValues<typeof API>;
