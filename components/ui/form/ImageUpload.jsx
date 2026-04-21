"use client";
import { useState, useRef } from "react";

const ImageUpload = ({
	label,
	hint,
	error,
	required,
	value, // existing image URL
	onChange,
	maxSize,
	id,
	aspectRatio = "1/1", // css aspect-ratio string
}) => {
	const [preview, setPreview] = useState(value || null);
	const [dragging, setDragging] = useState(false);
	const inputRef = useRef(null);

	const process = (file) => {
		if (!file || !file.type.startsWith("image/")) return;
		if (maxSize && file.size > maxSize) return;
		const url = URL.createObjectURL(file);
		setPreview(url);
		onChange?.(file);
	};

	const clear = (e) => {
		e.stopPropagation();
		setPreview(null);
		onChange?.(null);
		if (inputRef.current) inputRef.current.value = "";
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
					"imgupload-zone",
					dragging ? "is-dragging" : "",
					error ? "is-error" : "",
				]
					.filter(Boolean)
					.join(" ")}
				style={{ aspectRatio }}
				onClick={() => inputRef.current?.click()}
				onDragOver={(e) => {
					e.preventDefault();
					setDragging(true);
				}}
				onDragLeave={() => setDragging(false)}
				onDrop={(e) => {
					e.preventDefault();
					setDragging(false);
					process(e.dataTransfer.files[0]);
				}}
			>
				{preview ? (
					<>
						<img src={preview} alt="preview" className="imgupload-preview" />
						<div className="imgupload-overlay">
							<button
								type="button"
								className="imgupload-btn"
								onClick={(e) => {
									e.stopPropagation();
									inputRef.current?.click();
								}}
							>
								<i className="fa-solid fa-pen" />
							</button>
							<button
								type="button"
								className="imgupload-btn imgupload-btn-danger"
								onClick={clear}
							>
								<i className="fa-solid fa-trash" />
							</button>
						</div>
					</>
				) : (
					<div className="imgupload-placeholder">
						<i className="fa-solid fa-image" />
						<span>Upload gambar</span>
					</div>
				)}
				<input
					ref={inputRef}
					id={id}
					type="file"
					accept="image/*"
					style={{ display: "none" }}
					onChange={(e) => process(e.target.files[0])}
				/>
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

export default ImageUpload;
