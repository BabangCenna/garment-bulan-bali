"use client";

const FormLabel = ({
	children,
	htmlFor,
	required,
	optional,
	hint,
	className = "",
}) => (
	<div className={["form-label-wrap", className].filter(Boolean).join(" ")}>
		<label htmlFor={htmlFor} className="form-label">
			{children}
			{required && <span className="req"> *</span>}
			{optional && <span className="form-optional">(opsional)</span>}
		</label>
		{hint && <span className="form-label-hint">{hint}</span>}
	</div>
);

export default FormLabel;
