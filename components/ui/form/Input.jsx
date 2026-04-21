// components/ui/form/Input.jsx
"use client";

import { useState, forwardRef } from "react";

const Input = forwardRef(
	(
		{
			// layout
			label,
			hint,
			error,
			required,
			// variant & size
			variant = "default", // 'default' | 'filled' | 'flushed'
			size = "md", // 'sm' | 'md' | 'lg'
			// icon slots
			leftIcon,
			rightIcon,
			onRightIconClick,
			// addon
			prefix,
			suffix,
			// special
			type = "text",
			className = "",
			id,
			...props
		},
		ref,
	) => {
		const [showPassword, setShowPassword] = useState(false);
		const isPassword = type === "password";
		const inputType = isPassword ? (showPassword ? "text" : "password") : type;

		const variantClass =
			{
				default: "input-default",
				filled: "input-filled",
				flushed: "input-flushed",
			}[variant] ?? "input-default";

		const sizeClass =
			{
				sm: "input-sm",
				md: "input-md",
				lg: "input-lg",
			}[size] ?? "input-md";

		const stateClass = error ? "is-error" : props.success ? "is-success" : "";

		const hasLeftPad = !!leftIcon;
		const hasRightPad = !!rightIcon || isPassword;

		const inputEl = (
			<div className="input-wrap">
				{leftIcon && <span className="slot-icon left">{leftIcon}</span>}
				<input
					ref={ref}
					id={id}
					type={inputType}
					className={[
						"input-base",
						variantClass,
						sizeClass,
						stateClass,
						hasLeftPad ? "input-icon-left" : "",
						hasRightPad ? "input-icon-right" : "",
						prefix ? "input-addon-left" : "",
						suffix ? "input-addon-right" : "",
						prefix && suffix ? "input-addon-both" : "",
						className,
					]
						.filter(Boolean)
						.join(" ")}
					{...props}
				/>
				{isPassword && (
					<button
						type="button"
						className="btn-eye"
						onClick={() => setShowPassword((v) => !v)}
						tabIndex={-1}
					>
						<i
							className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
						/>
					</button>
				)}
				{rightIcon && !isPassword && (
					<span className="slot-icon right" onClick={onRightIconClick}>
						{rightIcon}
					</span>
				)}
			</div>
		);

		return (
			<div className="form-group">
				{label && (
					<label htmlFor={id} className="form-label">
						{label}
						{required && <span className="req"> *</span>}
					</label>
				)}

				{prefix || suffix ? (
					<div className="input-wrap input-addon-wrap">
						{prefix && <span className="addon addon-left">{prefix}</span>}
						{inputEl}
						{suffix && <span className="addon addon-right">{suffix}</span>}
					</div>
				) : (
					inputEl
				)}

				{error && (
					<div className="form-error">
						<i className="fa-solid fa-circle-exclamation" />
						{error}
					</div>
				)}
				{hint && !error && <div className="form-hint">{hint}</div>}
			</div>
		);
	},
);

Input.displayName = "Input";
export default Input;
