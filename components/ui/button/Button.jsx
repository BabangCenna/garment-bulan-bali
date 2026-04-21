"use client";
import { forwardRef } from "react";

const Button = forwardRef(
	(
		{
			children,
			variant = "primary", // 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'ghost' | 'outline'
			size = "md", // 'sm' | 'md' | 'lg'
			loading = false,
			disabled = false,
			leftIcon,
			rightIcon,
			block = false,
			type = "button",
			className = "",
			...props
		},
		ref,
	) => {
		const isDisabled = disabled || loading;

		return (
			<button
				ref={ref}
				type={type}
				disabled={isDisabled}
				className={[
					"btn",
					`btn-${variant}`,
					`btn-${size}`,
					block ? "btn-block" : "",
					loading ? "btn-loading" : "",
					className,
				]
					.filter(Boolean)
					.join(" ")}
				{...props}
			>
				{loading && (
					<i className="fa-solid fa-circle-notch fa-spin btn-spinner" />
				)}
				{!loading && leftIcon && <span className="btn-icon">{leftIcon}</span>}
				{children && <span>{children}</span>}
				{!loading && rightIcon && <span className="btn-icon">{rightIcon}</span>}
			</button>
		);
	},
);

Button.displayName = "Button";
export default Button;
