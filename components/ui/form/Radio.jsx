"use client";
import { forwardRef } from "react";

export const Radio = forwardRef(
	({ label, size = "md", id, className = "", ...props }, ref) => {
		const sizeClass = { sm: "radio-sm", md: "radio-md", lg: "radio-lg" }[size];

		return (
			<label className={["radio-label", sizeClass].join(" ")}>
				<input
					ref={ref}
					type="radio"
					id={id}
					className={["radio-input", className].filter(Boolean).join(" ")}
					{...props}
				/>
				<span className="radio-dot" />
				{label && <span className="radio-text">{label}</span>}
			</label>
		);
	},
);
Radio.displayName = "Radio";

export const RadioGroup = ({
	label,
	hint,
	error,
	required,
	options = [], // [{ value, label, disabled }]
	value,
	onChange,
	name,
	direction = "vertical",
}) => (
	<div className="form-group">
		{label && (
			<div className="form-label">
				{label}
				{required && <span className="req"> *</span>}
			</div>
		)}
		<div className={`checkbox-group checkbox-group-${direction}`}>
			{options.map((opt) => (
				<Radio
					key={opt.value}
					name={name}
					label={opt.label}
					value={opt.value}
					checked={value === opt.value}
					disabled={opt.disabled}
					onChange={() => onChange?.(opt.value)}
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

export default Radio;
