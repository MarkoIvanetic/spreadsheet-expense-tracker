import { SVGAttributes } from 'react';

export const MenuIcon = (props: SVGAttributes<SVGElement>) => {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 32 32" width="32px" height="32px" {...props}>
			<rect width="24" height="2" x="4" y="9" fill="currentColor" rx="1" />
			<rect width="24" height="2" x="4" y="15" fill="currentColor" rx="1" />
			<rect width="24" height="2" x="4" y="21" fill="currentColor" rx="1" />
		</svg>
	);
};
