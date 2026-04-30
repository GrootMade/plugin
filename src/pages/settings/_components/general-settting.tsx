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
import useSetting from '@/hooks/use-setting';
import { __ } from '@/lib/i18n';
import SettingControl from './settings-control';

export default function SettingsForm() {
	const { updateSettings, settings, setSetting } = useSetting();

	return (
		!!settings && (
			<Card className="overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/30 border-b">
					<CardTitle className="text-base font-semibold">
						{__('General')}
					</CardTitle>
					<CardDescription>
						{__('Manage general plugin behavior.')}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col pt-6">
					<SettingControl
						label={__('Auto Activate')}
						description={__(
							'Automatically activate plugin upon installation.'
						)}
					>
						<Switch
							checked={settings.autoactivate === true}
							onCheckedChange={(checked) =>
								setSetting('autoactivate', checked)
							}
						/>
					</SettingControl>
					<Separator />
					<SettingControl
						label={__('Remove Data on Uninstall')}
						description={__(
							'Remove plugin settings and activation data when uninstalling.'
						)}
					>
						<Switch
							checked={settings.clean_on_uninstall === true}
							onCheckedChange={(checked) =>
								setSetting('clean_on_uninstall', checked)
							}
						/>
					</SettingControl>
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
