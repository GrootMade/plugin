import { millify } from 'millify';

export function formatCompactNumber(value: number): string {
	if (!Number.isFinite(value)) {
		return '0';
	}

	return millify(value);
}
