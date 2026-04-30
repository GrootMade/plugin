import ActionLoader from '@/components/ui/action-loader';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
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
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';
import { licenseFormZodSchema } from '@/zod/license';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

type LicenseActivationResponse = {
	activation_key: string;
};
export type LicenseActivationSchema = z.infer<typeof licenseFormZodSchema>;
export default function RegisterLicenseForm() {
	const notify = useNotification();
	const form = useForm<LicenseActivationSchema>({
		resolver: zodResolver(licenseFormZodSchema),
		defaultValues: {
			license_key: ''
		}
	});
	const { isPending, mutateAsync } = useApiMutation<
		LicenseActivationResponse,
		LicenseActivationSchema
	>(API.license.create);
	async function onSubmit(data: LicenseActivationSchema) {
		notify.promise(mutateAsync(data), {
			loading: __('Activating License'),
			success: () => {
				window.location.reload();
				return __('License Activated Successfully');
			},
			error: __('Error Activating License'),
			finally() {
				form.reset();
			}
		});
	}
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card className="overflow-hidden">
					<CardHeader className="border-border/80 bg-muted/30 border-b">
						<CardTitle className="text-base font-semibold">
							{__('Activate License')}
						</CardTitle>
						<CardDescription>
							{__(
								'Paste your key below. It stays on this site only.'
							)}
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<FormField
							control={form.control}
							name="license_key"
							render={({ field }) => (
								<FormItem>
									<FormControl>
										<Input
											placeholder={__(
												'Enter License Key'
											)}
											disabled={isPending}
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter>
						<Button
							variant="default"
							type="submit"
							disabled={isPending}
							className="gap-2"
						>
							{isPending ? (
								<ActionLoader
									label={__('Activating License')}
								/>
							) : (
								<span>{__('Activate License')}</span>
							)}
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
