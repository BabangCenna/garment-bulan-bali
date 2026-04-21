"use client";
import { useState, useRef, useEffect } from "react";

const MultiSelect = ({
	label,
	hint,
	error,
	required,
	options = [], // [{ value, label }]
	value = [], // array of selected values
	onChange,
	placeholder = "Pilih...",
	id,
}) => {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const ref = useRef(null);

	const filtered = options.filter(
		(o) =>
			o.label.toLowerCase().includes(search.toLowerCase()) &&
			!value.includes(o.value),
	);

	const selected = options.filter((o) => value.includes(o.value));

	const toggle = (val) => {
		onChange?.(
			value.includes(val) ? value.filter((v) => v !== val) : [...value, val],
		);
	};

	const remove = (val, e) => {
		e.stopPropagation();
		onChange?.(value.filter((v) => v !== val));
	};

	useEffect(() => {
		const handler = (e) => {
			if (!ref.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	return (
		<div className="form-group" ref={ref}>
			{label && (
				<label htmlFor={id} className="form-label">
					{label}
					{required && <span className="req"> *</span>}
				</label>
			)}
			<div
				className={[
					"multiselect-control input-default",
					error ? "is-error" : "",
					open ? "is-open" : "",
				]
					.filter(Boolean)
					.join(" ")}
				onClick={() => setOpen((v) => !v)}
			>
				<div className="multiselect-tags">
					{selected.length === 0 && (
						<span className="multiselect-placeholder">{placeholder}</span>
					)}
					{selected.map((opt) => (
						<span key={opt.value} className="multiselect-tag">
							{opt.label}
							<button type="button" onClick={(e) => remove(opt.value, e)}>
								<i className="fa-solid fa-xmark" />
							</button>
						</span>
					))}
				</div>
				<span
					className="select-chevron"
					style={{ position: "static", transform: "none" }}
				>
					<i className={`fa-solid fa-chevron-${open ? "up" : "down"}`} />
				</span>
			</div>

			{open && (
				<div className="multiselect-dropdown">
					<div className="multiselect-search">
						<i className="fa-solid fa-magnifying-glass" />
						<input
							autoFocus
							type="text"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							onClick={(e) => e.stopPropagation()}
							placeholder="Cari..."
						/>
					</div>
					<ul className="multiselect-list">
						{filtered.length === 0 && (
							<li className="multiselect-empty">Tidak ada hasil</li>
						)}
						{filtered.map((opt) => (
							<li
								key={opt.value}
								className="multiselect-item"
								onClick={(e) => {
									e.stopPropagation();
									toggle(opt.value);
								}}
							>
								{opt.label}
							</li>
						))}
					</ul>
				</div>
			)}

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

export default MultiSelect;
