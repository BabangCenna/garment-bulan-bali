"use client";
import { forwardRef } from "react";

const Select = forwardRef(
	(
		{
			label,
			hint,
			error,
			required,
			variant = "default",
			size = "md",
			placeholder = "Pilih...",
			options = [], // [{ value, label, disabled }]
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
				sm: "input-sm",
				md: "input-md",
				lg: "input-lg",
			}[size] ?? "input-md";

		return (
			<div className="form-group">
				{label && (
					<label htmlFor={id} className="form-label">
						{label}
						{required && <span className="req"> *</span>}
					</label>
				)}
				<div className="select-wrap">
					<select
						ref={ref}
						id={id}
						className={[
							"input-base select-base",
							variantClass,
							sizeClass,
							error ? "is-error" : "",
							className,
						]
							.filter(Boolean)
							.join(" ")}
						{...props}
					>
						{placeholder && <option value="">{placeholder}</option>}
						{options.map((opt) => (
							<option key={opt.value} value={opt.value} disabled={opt.disabled}>
								{opt.label}
							</option>
						))}
					</select>
					<span className="select-chevron">
						<i className="fa-solid fa-chevron-down" />
					</span>
				</div>
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

Select.displayName = "Select";
export default Select;
