import { useState, useEffect } from "react";
import "./App.css";
import "./db.js";
import { addFile } from "./db.js";
import { getAllFiles } from "./db.js";

const App = () => {
	const [files, setFiles] = useState([]);
	const [pickMode, setPickMode] = useState(false);

	const handleFileChange = (event) => {
		const FileList = event.target.files;
		const SelectedFiles = Array.from(FileList);
		const newEntires = SelectedFiles.map((file) => {
			return {
				id: crypto.randomUUID(),
				name: file.name,
				type: file.type,
				size: file.size,
				data: file
			};
		});
		newEntires.forEach((file) => {
			addFile(file);
		});
		console.log(newEntires);
		setFiles((prevFiles) => [...prevFiles, ...newEntires]);
	};

  const handleFileSelectForVault = async (file) => {
  console.log("File clicked in pick mode:", file);
  console.log("file.data is:", file.data);

  if (!file.data || typeof file.data.arrayBuffer !== "function") {
    console.log("This file has no valid data — likely an old/stale record.");
    return;
  }

  const arrayBuffer = await file.data.arrayBuffer();
  chrome.runtime.sendMessage({
    action: "selectedFileForVault",
    fileName: file.name,
    fileType: file.type,
    fileData: arrayBuffer
  });
};

	useEffect(() => {
		const fetchFiles = async () => {
			const files = await getAllFiles();
			setFiles(files);
		};
		fetchFiles();
	}, []);

	useEffect(() => {
		chrome.storage.local.get(["pickMode"], (result) => {
			console.log("Pick mode:", result.pickMode);
			setPickMode(!!result.pickMode);
		});
	}, []);

	return (
		<main className="vault">
			<header className="vault-header">
				<div className="brand-mark">LV</div>
				<div>
					<p className="eyebrow">Private storage</p>
					<h1>Local Vault</h1>
				</div>
				<span className="status-dot" />
			</header>

			{pickMode && (
				<div className="pick-mode-banner">
					Select a file to insert into the page
				</div>
			)}

			<section className="vault-content">
				{files.length === 0 ? (
					<div className="empty-state">
						<label className="empty-icon" htmlFor="file-input">
							+
							<input id="file-input" type="file" multiple onChange={handleFileChange} />
						</label>
						<h2>Your vault is empty</h2>
						<p>Your saved files will appear here.</p>
					</div>
				) : (
					<div className="file-view">
						<div className="section-heading">
							<div>
								<p className="eyebrow">Your collection</p>
								<h2>Saved files</h2>
							</div>
							<span className="file-count">{files.length}</span>
						</div>

						<div className="file-list">
							{files.map((file) => (
								<article
									className="file-row"
									key={file.id}
									onClick={pickMode ? () => handleFileSelectForVault(file) : undefined}
									style={{ cursor: pickMode ? "pointer" : "default" }}
								>
									<div className="file-icon">{file.type || "FILE"}</div>
									<div className="file-details">
										<strong>{file.name}</strong>
										<span>{file.size || "Local file"}</span>
									</div>
								</article>
							))}
						</div>

						<label className="add-file-button" htmlFor="add-file-input">
							<span aria-hidden="true">+</span>
							Add more files
							<input id="add-file-input" type="file" multiple onChange={handleFileChange} />
						</label>
					</div>
				)}
			</section>

			<footer className="vault-footer">Stored on this device only</footer>
		</main>
	);
};

export default App;