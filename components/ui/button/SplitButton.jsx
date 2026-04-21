"use client";
import { useState, useRef, useEffect } from "react";

const SplitButton = ({
	label,
	onClick,
	variant = "primary",
	size = "md",
	items = [], // [{ label, icon, onClick, divider, disabled }]
	align = "left",
	disabled = false,
	loading = false,
	className = "",
}) => {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		const handler = (e) => {
			if (!ref.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="split-btn-wrap" ref={ref}>
			<div className="btn-group">
				<button
					type="button"
					disabled={disabled || loading}
					className={["btn", `btn-${variant}`, `btn-${size}`, className]
						.filter(Boolean)
						.join(" ")}
					onClick={onClick}
				>
					{loading && (
						<i className="fa-solid fa-circle-notch fa-spin btn-spinner" />
					)}
					{label}
				</button>
				<button
					type="button"
					disabled={disabled || loading}
					className={[
						"btn",
						`btn-${variant}`,
						`btn-${size}`,
						"split-btn-chevron",
					]
						.filter(Boolean)
						.join(" ")}
					onClick={() => setOpen((v) => !v)}
				>
					<i className="fa-solid fa-chevron-down" style={{ fontSize: 11 }} />
				</button>
			</div>

			{open && (
				<div className={`dropdown-menu dropdown-menu-${align}`}>
					{items.map((item, i) => {
						if (item.divider)
							return <div key={i} className="dropdown-divider" />;
						return (
							<button
								key={i}
								type="button"
								disabled={item.disabled}
								className="dropdown-item"
								onClick={() => {
									item.onClick?.();
									setOpen(false);
								}}
							>
								{item.icon && (
									<span className="dropdown-item-icon">{item.icon}</span>
								)}
								{item.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default SplitButton;
