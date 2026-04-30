export type DocumentationTopic = {
	id: number;
	title: string;
	slug: string;
	last_posted_at: string;
	excerpt?: string;
	posts_count?: number;
	views?: number;
	like_count?: number;
};

export type DocumentationTopicCollection = DocumentationTopic[];

export type DocumentationTopicDetail = {
	id: number;
	title: string;
	slug: string;
	last_posted_at: string;
	posts_count?: number;
	views?: number;
	like_count?: number;
	cooked?: string;
	external_url?: string;
};
