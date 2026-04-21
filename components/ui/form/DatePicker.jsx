"use client";
import { forwardRef } from "react";

const DatePicker = forwardRef(
	(
		{ label, hint, error, required, size = "md", id, className = "", ...props },
		ref,
	) => {
		const sizeClass = { sm: "input-sm", md: "input-md", lg: "input-lg" }[size];

		return (
			<div className="form-group">
				{label && (
					<label htmlFor={id} className="form-label">
						{label}
						{required && <span className="req"> *</span>}
					</label>
				)}
				<div className="input-wrap">
					<span className="slot-icon left">
						<i className="fa-solid fa-calendar-days" />
					</span>
					<input
						ref={ref}
						id={id}
						type="date"
						className={[
							"input-base input-default input-icon-left",
							sizeClass,
							error ? "is-error" : "",
							className,
						]
							.filter(Boolean)
							.join(" ")}
						{...props}
					/>
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

DatePicker.displayName = "DatePicker";
export default DatePicker;
