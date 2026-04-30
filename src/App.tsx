import { routes } from '@generouted/react-router/lazy';
import { RouterProvider, createHashRouter } from 'react-router-dom';
import { Providers } from './components/providers';

const router = createHashRouter(routes);

export default function App() {
	return (
		<Providers>
			<RouterProvider
				router={router}
				hydrateFallbackElement={null}
			/>
		</Providers>
	);
}
