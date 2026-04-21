"use client";
import { useRef, useState } from "react";

const PinInput = ({
	label,
	hint,
	error,
	required,
	length = 6,
	mask = false,
	onChange,
	id,
}) => {
	const [values, setValues] = useState(Array(length).fill(""));
	const refs = useRef([]);

	const update = (idx, val) => {
		const digit = val.replace(/\D/g, "").slice(-1);
		const next = [...values];
		next[idx] = digit;
		setValues(next);
		onChange?.(next.join(""));
		if (digit && idx < length - 1) refs.current[idx + 1]?.focus();
	};

	const onKeyDown = (idx, e) => {
		if (e.key === "Backspace" && !values[idx] && idx > 0) {
			refs.current[idx - 1]?.focus();
		}
		if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
		if (e.key === "ArrowRight" && idx < length - 1)
			refs.current[idx + 1]?.focus();
	};

	const onPaste = (e) => {
		e.preventDefault();
		const paste = e.clipboardData
			.getData("text")
			.replace(/\D/g, "")
			.slice(0, length);
		const next = Array(length).fill("");
		paste.split("").forEach((c, i) => {
			next[i] = c;
		});
		setValues(next);
		onChange?.(next.join(""));
		refs.current[Math.min(paste.length, length - 1)]?.focus();
	};

	return (
		<div className="form-group">
			{label && (
				<div className="form-label">
					{label}
					{required && <span className="req"> *</span>}
				</div>
			)}
			<div className="pin-wrap" onPaste={onPaste}>
				{values.map((v, i) => (
					<input
						key={i}
						ref={(el) => (refs.current[i] = el)}
						type={mask ? "password" : "text"}
						inputMode="numeric"
						maxLength={1}
						value={v}
						onChange={(e) => update(i, e.target.value)}
						onKeyDown={(e) => onKeyDown(i, e)}
						className={["pin-box", error ? "is-error" : ""]
							.filter(Boolean)
							.join(" ")}
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

export default PinInput;
