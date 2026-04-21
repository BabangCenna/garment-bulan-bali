"use client";

const FormGroup = ({
	children,
	label,
	hint,
	error,
	required,
	htmlFor,
	className = "",
}) => (
	<div className={["form-group", className].filter(Boolean).join(" ")}>
		{label && (
			<label htmlFor={htmlFor} className="form-label">
				{label}
				{required && <span className="req"> *</span>}
			</label>
		)}
		{children}
		{error && (
			<div className="form-error">
				<i className="fa-solid fa-circle-exclamation" />
				{error}
			</div>
		)}
		{hint && !error && <div className="form-hint">{hint}</div>}
	</div>
);

export default FormGroup;
