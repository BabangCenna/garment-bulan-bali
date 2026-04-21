"use client";
import { forwardRef } from "react";

const Textarea = forwardRef(
	(
		{
			label,
			hint,
			error,
			required,
			variant = "default", // 'default' | 'filled' | 'flushed'
			size = "md", // 'sm' | 'md' | 'lg'
			resize = "vertical", // 'none' | 'vertical' | 'horizontal' | 'both'
			rows = 4,
			id,
			className = "",
			...props
		},
		ref,
	) => {
		const variantClass =
			{
				default: "input-default",
				filled: "input-filled",
				flushed: "input-flushed",
			}[variant] ?? "input-default";

		const sizeClass =
			{
				sm: "textarea-sm",
				md: "textarea-md",
				lg: "textarea-lg",
			}[size] ?? "textarea-md";

		return (
			<div className="form-group">
				{label && (
					<label htmlFor={id} className="form-label">
						{label}
						{required && <span className="req"> *</span>}
					</label>
				)}
				<textarea
					ref={ref}
					id={id}
					rows={rows}
					className={[
						"input-base textarea-base",
						variantClass,
						sizeClass,
						error ? "is-error" : "",
						className,
					]
						.filter(Boolean)
						.join(" ")}
					style={{ resize }}
					{...props}
				/>
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

Textarea.displayName = "Textarea";
export default Textarea;
