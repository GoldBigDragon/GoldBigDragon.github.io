/*
	Convert size setting
*/
function setAbsoluteSize(){
	const absoluteSizeButton = document.getElementById("absoluteSizeButton");
	const relativeSizeButton = document.getElementById("relativeSizeButton");
	const absoluteSizeInputs = document.getElementById("absoluteSizeInputs");
	const relativeSizeInputs = document.getElementById("relativeSizeInputs");
	absoluteSizeButton.classList.add("selected");
	relativeSizeButton.classList.remove("selected");
	absoluteSizeInputs.style.display = "block";
	relativeSizeInputs.style.display = "none";
}

function setRelativeSize(){
	const absoluteSizeButton = document.getElementById("absoluteSizeButton");
	const relativeSizeButton = document.getElementById("relativeSizeButton");
	const absoluteSizeInputs = document.getElementById("absoluteSizeInputs");
	const relativeSizeInputs = document.getElementById("relativeSizeInputs");
	relativeSizeButton.classList.add("selected");
	absoluteSizeButton.classList.remove("selected");
	absoluteSizeInputs.style.display = "none";
	relativeSizeInputs.style.display = "block";
}

/*
	Toast utility
*/
let toastId = 0;
function removeToast(toastId) {
	const toast = document.getElementById("toast-" + toastId);
	const toastContainer = document.getElementById("toastContainer");
	if(toastContainer.contains(toast)) {
		toastContainer.removeChild(toast);
	}
}

function showToast(message) {
	const toastContainer = document.getElementById("toastContainer");
	const toast = document.createElement("div");
	toast.id = "toast-" + toastId;
	toast.setAttribute("onClick", "removeToast(" + toastId + ")");
	toastId = toastId + 1;
	toast.className = "toast show";
	toast.textContent = message;

	toastContainer.appendChild(toast);
	setTimeout(() => {
		toast.classList.add("fade-out");
		setTimeout(() => {
			if(toastContainer.contains(toast)) {
				toastContainer.removeChild(toast);
			}
		}, 3000); // Wait until fade-out animation end
	}, 3000); // Start fade-out after 3 seconds
}

/*
	Image file convert to .ico format
*/
function convertToICO(file, width, height) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = function(event) {
			const img = new Image();
			img.src = event.target.result;
			img.onload = function() {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext("2d");

				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(function(blob) {
					resolve(blob);
				}, 'image/x-icon');
			};
			img.onerror = function() {
				reject("Error loading image");
			};
		};
		reader.onerror = function() {
			reject("Error reading file");
		};
		reader.readAsDataURL(file);
	});
}

/*
	File drag&drop upload handler
*/
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("imageInput");

dropZone.addEventListener("click", function() {
	fileInput.click();
});

dropZone.addEventListener("dragover", function(event) {
	event.preventDefault();
	dropZone.classList.add("hover");
});

dropZone.addEventListener("dragleave", function() {
	dropZone.classList.remove("hover");
});

dropZone.addEventListener("drop", function(event) {
	event.preventDefault();
	dropZone.classList.remove("hover");
	fileInput.files = event.dataTransfer.files;
	handleFiles(fileInput.files);
});

fileInput.addEventListener("change", function() {
	handleFiles(fileInput.files);
});

async function handleFiles(files) {
	const fileArray = Array.from(files);
	const isAbsoluteSize = absoluteSizeButton.classList.contains("selected");
	let width, height;

	const zip = new JSZip();
	let completedCount = 0;

	try {
		const downloadLinks = document.getElementById("downloadLinks");
		// Handle each files with async
		const convertPromises = fileArray.map(async (file) => {
			try {
				// Check file type
				const fileType = file.type;
				if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(fileType)) {
					showToast(`${file.name} is an unsupported type.`);
					return;
				}

				const img = document.createElement('img');
				img.src = URL.createObjectURL(file);
				await new Promise((resolve) => {
					img.onload = resolve;
				});

				if (isAbsoluteSize) {
					// Set absolute file size
					width = parseInt(document.getElementById("widthInput").value);
					height = parseInt(document.getElementById("heightInput").value);
				} else {
					// Set relative file size
					const percentage = parseFloat(document.getElementById("percentageInput").value) / 100;
					width = Math.round(img.width * percentage);
					height = Math.round(img.height * percentage);
				}

				// Convert image
				const icoBlob = await convertToICO(file, width, height);
				const icoFileName = file.name.replace(/\.[^/.]+$/, ".ico");
				const sizeInKB = (icoBlob.size / 1024).toFixed(2);

				// Create download link
				const link = document.createElement("a");
				link.href = URL.createObjectURL(icoBlob);
				link.download = icoFileName;

				// Generate preview image
				const previewImage = document.createElement("img");
				previewImage.className = "preview";
				previewImage.src = URL.createObjectURL(icoBlob);

				// Add new row in table
				const row = document.createElement("tr");

				const previewCell = document.createElement("td");
				previewCell.appendChild(previewImage);
				row.appendChild(previewCell);

				const nameCell = document.createElement("td");
				nameCell.className = "file-name";
				nameCell.textContent = icoFileName;
				row.appendChild(nameCell);

				const sizeCell = document.createElement("td");
				sizeCell.className = "file-size";
				sizeCell.textContent = `${sizeInKB} KB`;
				row.appendChild(sizeCell);

				const downloadCell = document.createElement("td");
				downloadCell.style.textAlign = "-webkit-center"
				const downloadButton = document.createElement("button");
				downloadButton.innerHTML = "<i class='fa-solid fa-cloud-arrow-down'></i> Download";
				downloadButton.addEventListener("click", () => {
					link.click();
				});
				downloadCell.appendChild(downloadButton);
				row.appendChild(downloadCell);

				downloadLinks.appendChild(row);

				// Add file to ZIP
				zip.file(icoFileName, icoBlob);

				completedCount++;
			} catch (error) {
				showToast(`An error occurred while converting the file ${file.name}.`);
			}
		});

		// Wait until all conversions are complete
		await Promise.all(convertPromises);

		// Remove event - No more input can be received after file selection
		fileInput.value = ''; // Initialize file input

		if (completedCount === fileArray.length) {
			const downloadAllButton = document.getElementById("downloadAllButton");
			const downloadAllButton2 = document.getElementById("downloadAllButton2");
			// Activate zip download button after conversion is complete
			downloadAllButton.disabled = false;
			downloadAllButton2.disabled = false;

			// Add all file download event
			downloadAllButton.addEventListener('click', async function() {
				const currentUTC = new Date().toISOString().replace(/[:.-]/g, "_");
				const zipFileName = `${currentUTC}_converted_ico.zip`;
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				const link = document.createElement("a");
				link.href = URL.createObjectURL(zipBlob);
				link.download = zipFileName;
				link.click();
			});
			// Add all file download event
			downloadAllButton2.addEventListener('click', async function() {
				const currentUTC = new Date().toISOString().replace(/[:.-]/g, "_");
				const zipFileName = `${currentUTC}_converted_ico.zip`;
				const zipBlob = await zip.generateAsync({ type: 'blob' });
				const link = document.createElement("a");
				link.href = URL.createObjectURL(zipBlob);
				link.download = zipFileName;
				link.click();
			});
		}
	} catch (error) {
		showToast(`An error occurred: ${error.message}`);
	}
}

function clearHistory(){
	const downloadAllButton = document.getElementById("downloadAllButton");
	const downloadAllButton2 = document.getElementById("downloadAllButton2");
	const downloadLinks = document.getElementById("downloadLinks");
	downloadLinks.innerHTML = '';
	downloadAllButton.disabled = true;
	downloadAllButton2.disabled = true;
	fileInput.value = ''; // Initialize file input
}