"use client";
import { forwardRef } from "react";

const RangeSlider = forwardRef(
	(
		{
			label,
			hint,
			error,
			required,
			min = 0,
			max = 100,
			step = 1,
			showValue = true,
			formatValue = (v) => v,
			size = "md",
			id,
			value,
			onChange,
			...props
		},
		ref,
	) => {
		const percent = ((value - min) / (max - min)) * 100;

		return (
			<div className="form-group">
				{label && (
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<label htmlFor={id} className="form-label">
							{label}
							{required && <span className="req"> *</span>}
						</label>
						{showValue && (
							<span className="range-value">{formatValue(value)}</span>
						)}
					</div>
				)}
				<div className={`range-wrap range-${size}`}>
					<input
						ref={ref}
						id={id}
						type="range"
						min={min}
						max={max}
						step={step}
						value={value}
						onChange={(e) => onChange?.(Number(e.target.value))}
						className={["range-input", error ? "is-error" : ""]
							.filter(Boolean)
							.join(" ")}
						style={{ "--pct": `${percent}%` }}
						{...props}
					/>
				</div>
				<div className="range-minmax">
					<span>{formatValue(min)}</span>
					<span>{formatValue(max)}</span>
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

RangeSlider.displayName = "RangeSlider";
export default RangeSlider;
