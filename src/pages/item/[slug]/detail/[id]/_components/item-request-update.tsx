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
import { useState } from '@wordpress/element';
import { Loader, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

type Props = {
	item: TPostItem;
} & ButtonProps;

export const updateRequestSchema = z.object({
	version: z
		.string({ required_error: __('Version number cannot be empty') })
		.regex(/^(?![0.]+$)[A-Z\d]+(?:\.[A-Z\d]+){1,5}$/i, {
			message: 'Invalid version number'
		})
});
type TUpdateRequest = z.infer<typeof updateRequestSchema>;

export default function ItemRequestUpdate({ item, ...buttonProps }: Props) {
	const [open, setOpen] = useState(false);
	const notify = useNotification();
	const form = useForm<TUpdateRequest>({
		resolver: zodResolver(updateRequestSchema),
		defaultValues: {
			version: ''
		}
	});
	const { isPending, mutateAsync } = useApiMutation('item/request-update');

	async function onSubmit(data: TUpdateRequest) {
		notify.promise(mutateAsync({ ...data, item_id: item.id }), {
			loading: __('Making Update Request'),
			success: () => {
				setOpen(false);
				return __('Update request sent successfully');
			},
			error: (err: TApiError) =>
				err.message ?? __('Error making request'),
			finally() {
				form.reset();
			}
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={setOpen}
		>
			<DialogTrigger asChild>
				<Button
					title={__('Request Update')}
					{...buttonProps}
				>
					<RefreshCw />
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
								<span>{__('Request Update')}</span>
								{isPending && (
									<Loader className="h-4 w-4 animate-spin" />
								)}
							</Button>
						</DialogFooter>
					</Form>
				</form>
			</DialogContent>
		</Dialog>
	);
}
