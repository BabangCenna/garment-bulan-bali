"use client";
import { forwardRef } from "react";

const TimePicker = forwardRef(
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
						<i className="fa-solid fa-clock" />
					</span>
					<input
						ref={ref}
						id={id}
						type="time"
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

TimePicker.displayName = "TimePicker";
export default TimePicker;
