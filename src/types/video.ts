export type VideoItem = {
	id: string;
	title: string;
	url: string;
	published_at?: string;
	thumbnail?: string;
};

export type VideoCollection = VideoItem[];
