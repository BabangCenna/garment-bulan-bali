"use client";

const FloatingActionButton = ({
	icon,
	label,
	onClick,
	variant = "primary",
	size = "md", // 'sm' | 'md' | 'lg'
	position = "bottom-right", // 'bottom-right' | 'bottom-left' | 'bottom-center'
	extended = false, // true = tampil dengan label
	className = "",
}) => {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className={[
				"fab",
				`btn-${variant}`,
				`fab-${size}`,
				`fab-${position}`,
				extended ? "fab-extended" : "",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{icon}
			{extended && label && <span className="fab-label">{label}</span>}
		</button>
	);
};

export default FloatingActionButton;
