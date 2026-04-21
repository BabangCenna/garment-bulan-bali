"use client";
import { forwardRef } from "react";

const IconButton = forwardRef(
	(
		{
			icon,
			variant = "secondary",
			size = "md",
			shape = "rounded", // 'rounded' | 'circle' | 'square'
			loading = false,
			disabled = false,
			label, // aria-label
			className = "",
			...props
		},
		ref,
	) => {
		return (
			<button
				ref={ref}
				type="button"
				aria-label={label}
				disabled={disabled || loading}
				className={[
					"icon-btn",
					`btn-${variant}`,
					`icon-btn-${size}`,
					`icon-btn-${shape}`,
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{loading ? <i className="fa-solid fa-circle-notch fa-spin" /> : icon}
			</button>
		);
	},
);

IconButton.displayName = "IconButton";
export default IconButton;
