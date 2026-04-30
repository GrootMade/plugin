import * as React from 'react';

import { cn } from '@/lib/utils';

type ButtonGroupProps = React.ComponentProps<'div'>;

const ButtonGroup = ({ className, ...props }: ButtonGroupProps) => {
	return (
		<div
			role="group"
			className={cn(
				'flex items-center [&>*]:rounded-none [&>*]:focus-within:z-10 [&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md [&>*:not(:first-child)]:-ml-px',
				className
			)}
			{...props}
		/>
	);
};

export { ButtonGroup };
