import { Label } from '@/components/ui/label';
import {
	Children,
	cloneElement,
	isValidElement,
	useId
} from '@wordpress/element';

export default function SettingControl({
	label,
	description,
	children
}: {
	label: string;
	description: React.ReactNode;
	children: React.ReactElement & { props: { id?: string } };
}) {
	const fallbackId = useId();
	const childId = Children.toArray(children)
		.filter((child): child is React.ReactElement => isValidElement(child))
		.find((child) => 'id' in child.props)?.props.id;

	const id = childId || fallbackId;
	return (
		<div className="flex items-start justify-between gap-6 py-4">
			<div className="flex flex-col gap-1">
				<Label
					className="cursor-pointer text-sm font-medium"
					htmlFor={id}
				>
					{label}
				</Label>
				<p className="text-muted-foreground text-[13px]">
					{description}
				</p>
			</div>
			<div className="flex shrink-0 items-center">
				{Children.map(children, (child) =>
					isValidElement(child)
						? cloneElement(child, {
								id: child.props.id || id
							})
						: child
				)}
			</div>
		</div>
	);
}
