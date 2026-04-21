"use client";
import { useState, useRef } from "react";

const FileUpload = ({
	label,
	hint,
	error,
	required,
	accept,
	multiple = false,
	maxSize, // bytes
	onChange,
	id,
}) => {
	const [files, setFiles] = useState([]);
	const [dragOver, setDragOver] = useState(false);
	const inputRef = useRef(null);

	const processFiles = (incoming) => {
		const arr = Array.from(incoming);
		const valid = maxSize ? arr.filter((f) => f.size <= maxSize) : arr;
		const next = multiple ? [...files, ...valid] : valid.slice(0, 1);
		setFiles(next);
		onChange?.(next);
	};

	const remove = (idx) => {
		const next = files.filter((_, i) => i !== idx);
		setFiles(next);
		onChange?.(next);
	};

	const formatSize = (bytes) => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / 1048576).toFixed(1)} MB`;
	};

	return (
		<div className="form-group">
			{label && (
				<div className="form-label">
					{label}
					{required && <span className="req"> *</span>}
				</div>
			)}
			<div
				className={[
					"fileupload-zone",
					dragOver ? "is-dragging" : "",
					error ? "is-error" : "",
				]
					.filter(Boolean)
					.join(" ")}
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setDragOver(true);
				}}
				onDragLeave={() => setDragOver(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragOver(false);
					processFiles(e.dataTransfer.files);
				}}
			>
				<i className="fa-solid fa-cloud-arrow-up fileupload-icon" />
				<p className="fileupload-text">
					<span>Klik untuk upload</span> atau drag & drop
				</p>
				{accept && (
					<p className="fileupload-hint">
						{accept.toUpperCase()}{" "}
						{maxSize ? `· Maks ${formatSize(maxSize)}` : ""}
					</p>
				)}
				<input
					ref={inputRef}
					id={id}
					type="file"
					accept={accept}
					multiple={multiple}
					style={{ display: "none" }}
					onChange={(e) => processFiles(e.target.files)}
				/>
			</div>

			{files.length > 0 && (
				<ul className="fileupload-list">
					{files.map((f, i) => (
						<li key={i} className="fileupload-item">
							<i className="fa-solid fa-file fileupload-item-icon" />
							<span className="fileupload-item-name">{f.name}</span>
							<span className="fileupload-item-size">{formatSize(f.size)}</span>
							<button
								type="button"
								onClick={() => remove(i)}
								className="fileupload-item-remove"
							>
								<i className="fa-solid fa-xmark" />
							</button>
						</li>
					))}
				</ul>
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

export default FileUpload;
