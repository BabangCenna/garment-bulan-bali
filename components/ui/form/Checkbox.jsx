"use client";
import { forwardRef } from "react";

// Single
export const Checkbox = forwardRef(
	(
		{
			label,
			hint,
			error,
			size = "md", // 'sm' | 'md' | 'lg'
			indeterminate = false,
			id,
			className = "",
			...props
		},
		ref,
	) => {
		const sizeClass = {
			sm: "checkbox-sm",
			md: "checkbox-md",
			lg: "checkbox-lg",
		}[size];

		return (
			<div className="form-group">
				<label className={["checkbox-label", sizeClass].join(" ")}>
					<input
						ref={ref}
						type="checkbox"
						id={id}
						className={["checkbox-input", error ? "is-error" : "", className]
							.filter(Boolean)
							.join(" ")}
						{...props}
					/>
					<span className="checkbox-box">
						{indeterminate ? (
							<i className="fa-solid fa-minus" />
						) : (
							<i className="fa-solid fa-check" />
						)}
					</span>
					{label && <span className="checkbox-text">{label}</span>}
				</label>
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
Checkbox.displayName = "Checkbox";

// Group
export const CheckboxGroup = ({
	label,
	hint,
	error,
	required,
	options = [], // [{ value, label, disabled }]
	value = [],
	onChange,
	direction = "vertical", // 'vertical' | 'horizontal'
}) => {
	const toggle = (val) => {
		onChange?.(
			value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
		);
	};

	return (
		<div className="form-group">
			{label && (
				<div className="form-label">
					{label}
					{required && <span className="req"> *</span>}
				</div>
			)}
			<div className={`checkbox-group checkbox-group-${direction}`}>
				{options.map((opt) => (
					<Checkbox
						key={opt.value}
						label={opt.label}
						checked={value.includes(opt.value)}
						disabled={opt.disabled}
						onChange={() => toggle(opt.value)}
					/>
				))}
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
};

export default Checkbox;
