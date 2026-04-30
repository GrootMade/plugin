export type AnnouncementItemType = {
	id: number;
	title: string;
	slug: string;
	last_posted_at: string;
	excerpt?: string;
};
export type AnnouncementItemCollectionType = AnnouncementItemType[];
