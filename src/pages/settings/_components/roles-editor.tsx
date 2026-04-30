import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import useApiFetch from '@/hooks/use-api-fetch';
import useSetting from '@/hooks/use-setting';
import { API } from '@/lib/api-endpoints';
import { __ } from '@/lib/i18n';

export default function RolesAccessForm() {
	const { setSetting, settings, updateSettings } = useSetting();
	const { data: roles } = useApiFetch<Record<string, string>>(
		API.setting.readRoles,
		{},
		!!settings
	);

	return (
		!!settings && (
			<Card className="overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/30 border-b">
					<CardTitle className="text-base font-semibold">
						{__('Role Access')}
					</CardTitle>
					<CardDescription>
						{__('Grant access to user roles beyond administrator.')}
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					{roles && (
						<div className="flex flex-col">
							{Object.entries(roles).map(
								([role, label], index) => (
									<div key={role}>
										<div className="flex items-center justify-between gap-4 py-4">
											<span className="text-sm font-medium">
												{label}
											</span>
											<Switch
												checked={settings.roles?.includes(
													role
												)}
												onCheckedChange={(checked) => {
													const _roles = new Set(
														settings.roles
													);
													if (checked) {
														_roles.add(role);
													} else {
														_roles.delete(role);
													}
													setSetting(
														'roles',
														Array.from(_roles)
													);
												}}
											/>
										</div>
										{index <
											Object.keys(roles).length - 1 && (
											<Separator />
										)}
									</div>
								)
							)}
						</div>
					)}
				</CardContent>
				<Separator />
				<CardFooter className="pt-5">
					<Button onClick={updateSettings}>
						{__('Save Settings')}
					</Button>
				</CardFooter>
			</Card>
		)
	);
}
