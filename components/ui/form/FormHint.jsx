"use client";

const FormHint = ({ children, icon, className = "" }) => {
	if (!children) return null;
	return (
		<div className={["form-hint", className].filter(Boolean).join(" ")}>
			{icon && <i className={`fa-solid ${icon}`} style={{ marginRight: 4 }} />}
			{children}
		</div>
	);
};

export default FormHint;
