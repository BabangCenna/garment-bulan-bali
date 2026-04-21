"use client";
import { forwardRef } from "react";

const ColorPicker = forwardRef(
	(
		{
			label,
			hint,
			error,
			required,
			presets = [], // ['#ff0000', '#00ff00', ...]
			size = "md",
			id,
			value,
			onChange,
			...props
		},
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
				<div className="colorpicker-wrap">
					<div
						className="colorpicker-trigger"
						style={{ background: value || "#fff" }}
					>
						<input
							ref={ref}
							id={id}
							type="color"
							value={value || "#000000"}
							onChange={(e) => onChange?.(e.target.value)}
							className="colorpicker-input"
							{...props}
						/>
					</div>
					<input
						type="text"
						value={value || ""}
						onChange={(e) => onChange?.(e.target.value)}
						placeholder="#000000"
						className={[
							"input-base input-default",
							sizeClass,
							error ? "is-error" : "",
						]
							.filter(Boolean)
							.join(" ")}
						style={{ flex: 1 }}
					/>
				</div>
				{presets.length > 0 && (
					<div className="colorpicker-presets">
						{presets.map((c) => (
							<button
								key={c}
								type="button"
								className={`colorpicker-preset ${value === c ? "is-active" : ""}`}
								style={{ background: c }}
								onClick={() => onChange?.(c)}
								title={c}
							/>
						))}
					</div>
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

ColorPicker.displayName = "ColorPicker";
export default ColorPicker;
