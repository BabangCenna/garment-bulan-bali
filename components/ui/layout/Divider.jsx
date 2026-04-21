"use client";

const Divider = ({
	label,
	orientation = "horizontal", // 'horizontal' | 'vertical'
	variant = "solid", // 'solid' | 'dashed' | 'dotted'
	align = "center", // 'left' | 'center' | 'right'
	spacing = "md", // 'sm' | 'md' | 'lg'
	className = "",
	...props
}) => (
	<div
		className={[
			"divider",
			`divider-${orientation}`,
			`divider-${variant}`,
			`divider-spacing-${spacing}`,
			label ? `divider-label-${align}` : "",
			className,
		]
			.filter(Boolean)
			.join(" ")}
		{...props}
	>
		{label && orientation === "horizontal" && (
			<span className="divider-text">{label}</span>
		)}
	</div>
);

export default Divider;
