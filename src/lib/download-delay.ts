import { buildApiUrl } from '@/lib/api-route';
import { __ } from '@/lib/i18n';
import apiFetch from '@wordpress/api-fetch';

type ClaimResponse = {
	link: string;
	filename: string;
};

class TransientError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'TransientError';
	}
}

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

async function claimDownload(
	delayToken: string,
	method: string,
	itemId: number | string,
	slug?: string,
	mediaId?: number,
	signal?: AbortSignal
): Promise<ClaimResponse> {
	let lastError: Error | null = null;

	for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
		if (signal?.aborted) {
			throw new DOMException(__('Download claim aborted'), 'AbortError');
		}

		try {
			const data = await apiFetch<
				ClaimResponse & {
					error_code?: number;
					error?: boolean;
					message?: string;
				}
			>({
				url: buildApiUrl('item/claim'),
				method: 'POST',
				data: {
					delay_token: delayToken,
					method,
					item_id: itemId,
					slug,
					media_id: mediaId
				}
			});

			if (data.error) {
				const message = data.message || __('Failed to claim download');
				const errorCode = data.error_code;

				if (errorCode === 5001) {
					throw new TransientError(message);
				}

				throw new Error(message);
			}

			return data as ClaimResponse;
		} catch (err) {
			if (err instanceof DOMException && err.name === 'AbortError') {
				throw err;
			}

			lastError = err as Error;

			if (!(err instanceof TransientError) || attempt === MAX_RETRIES) {
				throw lastError;
			}

			const backoff = BASE_DELAY_MS * 2 ** attempt;
			await new Promise((resolve) => setTimeout(resolve, backoff));
		}
	}

	throw lastError ?? new Error(__('Failed to claim download'));
}

export async function claimAfterDelay(
	token: string,
	seconds: number,
	method: string,
	itemId: number | string,
	slug?: string,
	mediaId?: number,
	signal?: AbortSignal,
	onTick?: (remaining: number) => void
): Promise<ClaimResponse> {
	for (let remaining = seconds; remaining > 0; remaining--) {
		if (signal?.aborted) {
			throw new DOMException(__('Download delay aborted'), 'AbortError');
		}
		onTick?.(remaining);
		await new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(resolve, 1000);
			signal?.addEventListener(
				'abort',
				() => {
					clearTimeout(timeout);
					reject(
						new DOMException(
							__('Download delay aborted'),
							'AbortError'
						)
					);
				},
				{ once: true }
			);
		});
	}
	onTick?.(0);

	return claimDownload(token, method, itemId, slug, mediaId, signal);
}
