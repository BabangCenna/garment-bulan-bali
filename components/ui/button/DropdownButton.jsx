"use client";
import { useState, useRef, useEffect } from "react";

const DropdownButton = ({
	label,
	variant = "secondary",
	size = "md",
	items = [], // [{ label, icon, onClick, divider, disabled }]
	align = "left", // 'left' | 'right'
	disabled = false,
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
		<div className="dropdown-wrap" ref={ref}>
			<button
				type="button"
				disabled={disabled}
				className={["btn", `btn-${variant}`, `btn-${size}`, className]
					.filter(Boolean)
					.join(" ")}
				onClick={() => setOpen((v) => !v)}
			>
				{label}
				<i
					className={`fa-solid fa-chevron-${open ? "up" : "down"}`}
					style={{ fontSize: 11 }}
				/>
			</button>

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

export default DropdownButton;
