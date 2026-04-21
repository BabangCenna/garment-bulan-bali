"use client";
import { forwardRef } from "react";

const Toggle = forwardRef(
	(
		{
			label,
			hint,
			labelOff,
			labelPosition = "right",
			size = "md", // 'sm' | 'md' | 'lg'
			color = "primary", // 'primary' | 'success' | 'danger' | 'warning'
			id,
			className = "",
			...props
		},
		ref,
	) => {
		const sizeClass = { sm: "toggle-sm", md: "toggle-md", lg: "toggle-lg" }[
			size
		];

		return (
			<div className="form-group">
				<label
					className={["toggle-label", sizeClass, `label-${labelPosition}`].join(
						" ",
					)}
				>
					{labelPosition === "left" && label && (
						<span className="toggle-text">{label}</span>
					)}
					<input
						ref={ref}
						id={id}
						type="checkbox"
						className={["toggle-input", className].filter(Boolean).join(" ")}
						{...props}
					/>
					<span className={`toggle-track toggle-color-${color}`}>
						<span className="toggle-thumb" />
					</span>
					{labelPosition === "right" && label && (
						<span className="toggle-text">{label}</span>
					)}
				</label>
				{hint && <div className="form-hint">{hint}</div>}
			</div>
		);
	},
);

Toggle.displayName = "Toggle";
export default Toggle;
