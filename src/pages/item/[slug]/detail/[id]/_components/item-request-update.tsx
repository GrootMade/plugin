import ActionLoader from '@/components/ui/action-loader';
import { Button, ButtonProps } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import useApiMutation from '@/hooks/use-api-mutation';
import useNotification from '@/hooks/use-notification';
import { __ } from '@/lib/i18n';
import { TApiError } from '@/types/api';
import { TPostItem } from '@/types/item';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from '@wordpress/element';
import { RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Props = {
	item: TPostItem;
} & ButtonProps;

const VERSION_PATTERN = /^(?![0.]+$)[A-Z\d]+(?:\.[A-Z\d]+){1,5}$/i;

const compareVersionSegments = (left: string, right: string) => {
	const leftIsNumber = /^\d+$/.test(left);
	const rightIsNumber = /^\d+$/.test(right);

	if (leftIsNumber && rightIsNumber) {
		const leftNumber = Number(left);
		const rightNumber = Number(right);
		if (leftNumber > rightNumber) return 1;
		if (leftNumber < rightNumber) return -1;
		return 0;
	}

	const normalizedLeft = left.toLowerCase();
	const normalizedRight = right.toLowerCase();
	if (normalizedLeft > normalizedRight) return 1;
	if (normalizedLeft < normalizedRight) return -1;
	return 0;
};

const isVersionGreaterThan = (requested: string, current: string) => {
	const requestedParts = requested.split('.');
	const currentParts = current.split('.');
	const max = Math.max(requestedParts.length, currentParts.length);

	for (let index = 0; index < max; index++) {
		const requestedPart = requestedParts[index] ?? '0';
		const currentPart = currentParts[index] ?? '0';
		const compare = compareVersionSegments(requestedPart, currentPart);
		if (compare !== 0) {
			return compare > 0;
		}
	}

	return false;
};

const getUpdateRequestSchema = (currentVersion: string) =>
	z.object({
		version: z
			.string({ required_error: __('Version number cannot be empty') })
			.regex(VERSION_PATTERN, {
				message: __('Invalid version number')
			})
			.refine(
				(value) =>
					isVersionGreaterThan(value.trim(), currentVersion.trim()),
				{
					message: __(
						'Requested version must be newer than current version'
					)
				}
			)
	});

type TUpdateRequest = z.infer<ReturnType<typeof getUpdateRequestSchema>>;

export default function ItemRequestUpdate({ item, ...buttonProps }: Props) {
	const [open, setOpen] = useState(false);
	const notify = useNotification();
	const currentVersion = item.version ?? '';
	const parsedItemId = Number(item.id);
	const parsedTopicId = Number(item.topic_id ?? 0);
	const schema = useMemo(
		() => getUpdateRequestSchema(currentVersion),
		[currentVersion]
	);
	const form = useForm<TUpdateRequest>({
		resolver: zodResolver(schema),
		defaultValues: {
			version: currentVersion
		}
	});
	const { isPending, mutateAsync } = useApiMutation('item/request-update');
	const canRequestUpdate =
		Number.isFinite(parsedItemId) &&
		parsedItemId > 0 &&
		Number.isFinite(parsedTopicId) &&
		parsedTopicId > 0;

	async function onSubmit(data: TUpdateRequest) {
		if (!canRequestUpdate) {
			notify.error(__('Associated support thread not found'));
			return;
		}

		notify.promise(
			mutateAsync({
				item_id: parsedItemId,
				topic_id: parsedTopicId,
				version: data.version.trim()
			}),
			{
				loading: __('Making Update Request'),
				success: () => {
					setOpen(false);
					return __('Update request sent successfully');
				},
				error: (err: TApiError) =>
					err.message ?? __('Error making request'),
				finally() {
					form.reset({ version: currentVersion });
				}
			}
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				if (isPending) {
					return;
				}
				setOpen(isOpen);
				if (isOpen) {
					form.reset({ version: currentVersion });
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					title={
						canRequestUpdate
							? __('Request Update')
							: __('Support thread unavailable')
					}
					disabled={isPending || !canRequestUpdate}
					{...buttonProps}
				>
					{isPending ? (
						<ActionLoader />
					) : (
						<RefreshCw className="h-4 w-4" />
					)}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<Form {...form}>
						<DialogHeader>
							<DialogTitle>{__('Request Update')}</DialogTitle>
							<DialogDescription>
								{__(
									'Enter the latest version number to request an update for this item.'
								)}
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<FormField
								control={form.control}
								name="version"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input
												placeholder={__('New version')}
												disabled={isPending}
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
						<DialogFooter>
							<Button
								variant="default"
								type="submit"
								disabled={isPending}
								className="gap-2"
							>
								{isPending ? (
									<ActionLoader
										label={__('Requesting Update')}
									/>
								) : (
									<span>{__('Request Update')}</span>
								)}
							</Button>
						</DialogFooter>
					</Form>
				</form>
			</DialogContent>
		</Dialog>
	);
}
