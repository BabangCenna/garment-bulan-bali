"use client";

export const Grid = ({
	children,
	cols = 12,
	gap = "md", // 'none' | 'sm' | 'md' | 'lg'
	className = "",
	...props
}) => (
	<div
		className={[
			"grid-layout",
			`grid-cols-${cols}`,
			`grid-gap-${gap}`,
			className,
		]
			.filter(Boolean)
			.join(" ")}
		{...props}
	>
		{children}
	</div>
);

export const Col = ({
	children,
	span = 12, // 1-12
	sm,
	md,
	lg,
	xl, // responsive spans
	className = "",
	...props
}) => (
	<div
		className={[
			`col-${span}`,
			sm ? `col-sm-${sm}` : "",
			md ? `col-md-${md}` : "",
			lg ? `col-lg-${lg}` : "",
			xl ? `col-xl-${xl}` : "",
			className,
		]
			.filter(Boolean)
			.join(" ")}
		{...props}
	>
		{children}
	</div>
);

export default Grid;
