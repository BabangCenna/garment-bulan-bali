"use client";
import { useState } from "react";

const CopyButton = ({
	text,
	label = "Salin",
	labelCopied = "Tersalin!",
	variant = "secondary",
	size = "md",
	iconOnly = false,
	duration = 2000,
	className = "",
	...props
}) => {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), duration);
		} catch {
			// fallback
			const el = document.createElement("textarea");
			el.value = text;
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
			setCopied(true);
			setTimeout(() => setCopied(false), duration);
		}
	};

	return (
		<button
			type="button"
			onClick={copy}
			className={[
				"btn",
				`btn-${copied ? "success" : variant}`,
				`btn-${size}`,
				className,
			]
				.filter(Boolean)
				.join(" ")}
			{...props}
		>
			<i className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`} />
			{!iconOnly && <span>{copied ? labelCopied : label}</span>}
		</button>
	);
};

export default CopyButton;
