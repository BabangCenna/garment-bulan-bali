"use client";
import { useRef } from "react";

const SearchInput = ({
	label,
	hint,
	error,
	size = "md",
	loading = false,
	onClear,
	value,
	onChange,
	id,
	className = "",
	...props
}) => {
	const sizeClass = { sm: "input-sm", md: "input-md", lg: "input-lg" }[size];
	const ref = useRef(null);

	const clear = () => {
		onChange?.({ target: { value: "" } });
		onClear?.();
		ref.current?.focus();
	};

	return (
		<div className="form-group">
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
				</label>
			)}
			<div className="input-wrap">
				<span className="slot-icon left">
					{loading ? (
						<i className="fa-solid fa-circle-notch fa-spin" />
					) : (
						<i className="fa-solid fa-magnifying-glass" />
					)}
				</span>
				<input
					ref={ref}
					id={id}
					type="search"
					value={value}
					onChange={onChange}
					className={[
						"input-base input-default input-icon-left",
						value ? "input-icon-right" : "",
						sizeClass,
						className,
					]
						.filter(Boolean)
						.join(" ")}
					{...props}
				/>
				{value && !props.readOnly && (
					<span className="slot-icon right" onClick={clear}>
						<i className="fa-solid fa-xmark" />
					</span>
				)}
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

export default SearchInput;
