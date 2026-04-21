"use client";

const FormError = ({ children, icon = true, className = "" }) => {
	if (!children) return null;
	return (
		<div className={["form-error", className].filter(Boolean).join(" ")}>
			{icon && <i className="fa-solid fa-circle-exclamation" />}
			{children}
		</div>
	);
};

export default FormError;
