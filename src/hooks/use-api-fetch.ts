import { buildApiUrl } from '@/lib/api-route';
import { TApiError } from '@/types/api';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';

export default function useApiFetch<
	ResponseDataType,
	PostDataType = Record<string, unknown> | never,
	TError = TApiError
>(path: string, data?: PostDataType, enabled: boolean = true) {
	const apiUrl = buildApiUrl(path);
	const query = useQuery<PostDataType, TError, ResponseDataType>({
		queryKey: [apiUrl, data].filter((item) => item),
		queryFn: () =>
			apiFetch({
				url: apiUrl,
				method: 'POST',
				data
			}),
		placeholderData: keepPreviousData,
		enabled
	});

	return query;
}
