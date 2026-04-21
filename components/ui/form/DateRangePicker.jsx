"use client";
import { forwardRef } from "react";

const DateRangePicker = ({
	label,
	hint,
	error,
	required,
	size = "md",
	valueFrom,
	valueTo,
	onFromChange,
	onToChange,
	id,
}) => {
	const sizeClass = { sm: "input-sm", md: "input-md", lg: "input-lg" }[size];

	return (
		<div className="form-group">
			{label && (
				<div className="form-label">
					{label}
					{required && <span className="req"> *</span>}
				</div>
			)}
			<div className="daterange-wrap">
				<div className="input-wrap" style={{ flex: 1 }}>
					<span className="slot-icon left">
						<i className="fa-solid fa-calendar" />
					</span>
					<input
						type="date"
						value={valueFrom ?? ""}
						onChange={(e) => onFromChange?.(e.target.value)}
						max={valueTo || undefined}
						className={[
							"input-base input-default input-icon-left",
							sizeClass,
							error ? "is-error" : "",
						]
							.filter(Boolean)
							.join(" ")}
					/>
				</div>
				<span className="daterange-sep">
					<i className="fa-solid fa-arrow-right" />
				</span>
				<div className="input-wrap" style={{ flex: 1 }}>
					<span className="slot-icon left">
						<i className="fa-solid fa-calendar" />
					</span>
					<input
						type="date"
						value={valueTo ?? ""}
						onChange={(e) => onToChange?.(e.target.value)}
						min={valueFrom || undefined}
						className={[
							"input-base input-default input-icon-left",
							sizeClass,
							error ? "is-error" : "",
						]
							.filter(Boolean)
							.join(" ")}
					/>
				</div>
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

export default DateRangePicker;
