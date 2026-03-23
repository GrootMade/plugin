import DOMPurify from 'dompurify';
import HTMLReactParser from 'html-react-parser';

export default function renderHtml(
	html: string
): ReturnType<typeof HTMLReactParser> {
	return HTMLReactParser(DOMPurify.sanitize(html), {
		trim: true
	});
}
