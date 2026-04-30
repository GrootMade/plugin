import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import useSetting from '@/hooks/use-setting';
import { __ } from '@/lib/i18n';
import moment from 'moment';
import SettingControl from './settings-control';

const weekdaysShort = moment.weekdaysMin();

export default function AutoupdateSetting() {
	const { updateSettings, settings, setSetting } = useSetting();

	return (
		!!settings && (
			<Card className="overflow-hidden">
				<CardHeader className="border-border/80 bg-muted/30 border-b">
					<CardTitle className="text-base font-semibold">
						{__('Auto Update')}
					</CardTitle>
					<CardDescription>
						{__('Configure automatic update schedule.')}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col pt-6">
					<SettingControl
						label={__('Days of Week')}
						description={__(
							'Select which days auto-updates should run.'
						)}
					>
						<div className="flex flex-row flex-wrap items-center gap-4">
							{Array.from({ length: 7 }, (_, index) => index).map(
								(day) => (
									<label
										className="flex cursor-pointer items-center gap-2 text-sm uppercase"
										key={day}
									>
										<Checkbox
											checked={settings.autoupdate_day_of_week?.includes(
												day
											)}
											onCheckedChange={(checked) => {
												const _days = new Set(
													settings.autoupdate_day_of_week
												);
												if (checked) {
													_days.add(day);
												} else {
													_days.delete(day);
												}
												setSetting(
													'autoupdate_day_of_week',
													Array.from(_days)
												);
											}}
										/>
										<span>{weekdaysShort[day]}</span>
									</label>
								)
							)}
						</div>
					</SettingControl>
					<Separator />
					<SettingControl
						label={__('Time')}
						description={__(
							'Set the time of day for scheduled updates.'
						)}
					>
						<div className="flex items-center gap-2">
							<Select
								onValueChange={(val) =>
									setSetting('autoupdate_hour', val)
								}
								defaultValue={settings.autoupdate_hour.toString()}
							>
								<SelectTrigger className="w-[72px]">
									<SelectValue placeholder="00" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{Array.from(
											{ length: 24 },
											(_, index) => index
										).map((hour) => (
											<SelectItem
												value={hour.toString()}
												key={hour}
											>
												{hour
													.toString()
													.padStart(2, '0')}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
							<span className="text-muted-foreground">:</span>
							<Select
								onValueChange={(val) =>
									setSetting('autoupdate_minute', val)
								}
								defaultValue={settings.autoupdate_minute.toString()}
							>
								<SelectTrigger className="w-[72px]">
									<SelectValue placeholder="00" />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{Array.from(
											{ length: 60 },
											(_, index) => index
										).map((minute) => (
											<SelectItem
												value={minute.toString()}
												key={minute}
											>
												{minute
													.toString()
													.padStart(2, '0')}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
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
