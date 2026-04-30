import '@/styles/custom.css';
import '@/styles/globals.css';
import { createRoot } from '@wordpress/element';
import App from './App';
const container_id = 'app';
const el = document.getElementById(container_id);
if (el) {
	const root = createRoot(el);
	root.render(<App />);
	el.classList.add('ready');
}
