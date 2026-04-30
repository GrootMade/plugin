import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { __ } from '@/lib/i18n';
import { useState } from '@wordpress/element';
import { ArrowUpRight, MessageSquare, Search, Sparkles } from 'lucide-react';

const DISCOURSE_AI_BOT = 'creative';
const DISCOURSE_BASE_URL = 'https://meta.grootmade.com';

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialQuestion?: string;
};

export function AskAiDialog({
	open,
	onOpenChange,
	initialQuestion = ''
}: Props) {
	const [question, setQuestion] = useState(initialQuestion);

	const canSubmit = question.trim().length > 0;

	const openForumUrl = (url: string) => {
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	const handleAskAI = () => {
		if (!canSubmit) return;
		const title = encodeURIComponent(question.trim().slice(0, 200));
		const body = encodeURIComponent(question.trim());
		openForumUrl(
			`${DISCOURSE_BASE_URL}/new-message?username=${DISCOURSE_AI_BOT}&title=${title}&body=${body}`
		);
	};

	const handleSearchForum = () => {
		if (!canSubmit) return;
		openForumUrl(
			`${DISCOURSE_BASE_URL}/search?q=${encodeURIComponent(question.trim())}`
		);
	};

	const handlePostSupport = () => {
		if (!canSubmit) return;
		const title = encodeURIComponent(question.trim().slice(0, 200));
		const body = encodeURIComponent(question.trim());
		openForumUrl(
			`${DISCOURSE_BASE_URL}/new-topic?title=${title}&body=${body}&category=support`
		);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Sparkles className="text-primary h-4 w-4" />
						{__('Ask AI')}
					</DialogTitle>
					<DialogDescription>
						{__(
							'Ask a question and get AI-powered help from the GrootMade community forum.'
						)}
					</DialogDescription>
				</DialogHeader>

				<div className="flex flex-col gap-4">
					<Textarea
						value={question}
						onChange={(e) => setQuestion(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
								handleAskAI();
							}
						}}
						placeholder={__('What do you need help with?')}
						className="min-h-24 resize-none"
						autoFocus
					/>

					<div className="flex flex-col gap-2">
						<Button
							onClick={handleAskAI}
							disabled={!canSubmit}
							className="w-full"
						>
							<Sparkles className="mr-2 h-4 w-4" />
							{__('Ask AI')}
							<ArrowUpRight className="ml-auto h-4 w-4" />
						</Button>

						<div className="flex gap-2">
							<Button
								variant="outline"
								onClick={handleSearchForum}
								disabled={!canSubmit}
								className="flex-1"
							>
								<Search className="mr-2 h-4 w-4" />
								{__('Search forum')}
							</Button>
							<Button
								variant="outline"
								onClick={handlePostSupport}
								disabled={!canSubmit}
								className="flex-1"
							>
								<MessageSquare className="mr-2 h-4 w-4" />
								{__('Post support topic')}
							</Button>
						</div>
					</div>

					<p className="text-muted-foreground text-center text-xs">
						{__(
							'Opens in the GrootMade community forum. A forum account is required.'
						)}
					</p>
				</div>
			</DialogContent>
		</Dialog>
	);
}
