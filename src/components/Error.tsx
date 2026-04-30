export default function Errors(props: { errors?: string[] }) {
	if (!props.errors?.length) return null;
	return (
		<div className="text-destructive text-xs">
			{props.errors.map((err, index) => (
				<p key={index}>{err}</p>
			))}
		</div>
	);
}
