/*
	Convert size setting
*/
function setAbsoluteSize() {
	const absoluteSizeButton = document.getElementById("absoluteSizeButton");
	const relativeSizeButton = document.getElementById("relativeSizeButton");
	const absoluteSizeInputs = document.getElementById("absoluteSizeInputs");
	const relativeSizeInputs = document.getElementById("relativeSizeInputs");
	absoluteSizeButton.classList.add("selected");
	relativeSizeButton.classList.remove("selected");
	absoluteSizeInputs.style.display = "block";
	relativeSizeInputs.style.display = "none";
}

function setRelativeSize() {
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
	if (toastContainer.contains(toast)) {
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
			if (toastContainer.contains(toast)) {
				toastContainer.removeChild(toast);
			}
		}, 3000); // Wait until fade-out animation end
	}, 3000); // Start fade-out after 3 seconds
}

/*
	Draw image to canvas
*/
function drawAtCanvas(file, width, height) {
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

// Event listeners for drag-and-drop and file selection
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (event) => {
	event.preventDefault();
	dropZone.classList.add("hover");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("hover"));
dropZone.addEventListener("drop", (event) => {
	event.preventDefault();
	dropZone.classList.remove("hover");
	fileInput.files = event.dataTransfer.files;
	handleFiles(fileInput.files);
});
fileInput.addEventListener("change", () => handleFiles(fileInput.files));

let zip = new JSZip();
let format = "png";

function setFormat(formatString) {
	const formats = document.getElementsByClassName("format-button");
	Array.prototype.forEach.call(formats, function(formatButton) {
		formatButton.className = "radio-button format-button";
	});
	format = formatString;
	document.getElementById(formatString).className = "radio-button format-button selected";
}

// Main function to handle files
async function handleFiles(files) {
	const fileArray = Array.from(files);
	const isAbsoluteSize = document.getElementById("absoluteSizeButton").classList.contains("selected");
	let width, height;

	let completedCount = 0;

	try {
		const downloadLinks = document.getElementById("downloadLinks");

		// Process each file
		const convertPromises = fileArray.map(async (file) => {
			try {
				const fileType = file.type;
				if (!['image/png', 'image/jpeg', 'image/jpg', 'image/gif'].includes(fileType)) {
					showToast(`${file.name} is an unsupported type.`);
					return;
				}

				const img = document.createElement('img');
				img.src = URL.createObjectURL(file);
				await new Promise((resolve) => img.onload = resolve);

				// Set size based on user's choice (absolute or percentage)
				if (isAbsoluteSize) {
					width = parseInt(document.getElementById("widthInput").value);
					height = parseInt(document.getElementById("heightInput").value);
				} else {
					const percentage = parseFloat(document.getElementById("percentageInput").value) / 100;
					width = Math.round(img.width * percentage);
					height = Math.round(img.height * percentage);
				}

				// Compress image based on selected format
				const compressedBlob = await compressImage(img, width, height, format);

				// Create download link
				const compressedFileName = file.name.replace(/\.[^/.]+$/, `.${format}`);
				const compressedSizeInKB = (compressedBlob.size / 1024).toFixed(2);
				addDownloadLink(downloadLinks, compressedBlob, compressedFileName, compressedSizeInKB);

				// Add files to ZIP
				zip.file(compressedFileName, compressedBlob);

				completedCount++;
			} catch (error) {
				console.log(error);
				showToast(`An error occurred while processing ${file.name}.`);
			}
		});

		await Promise.all(convertPromises);

		// Enable ZIP download button if all files processed successfully
		if (completedCount === fileArray.length) {
			document.getElementById("downloadAllButton").disabled = false;
			document.getElementById("downloadAllButton2").disabled = false;
		}

		fileInput.value = ''; // Clear file input
	} catch (error) {
		console.log(error);
		showToast(`An error occurred: ${error.message}`);
	}
}

// Compress image based on selected format (JPG, PNG, WEBP)
async function compressImage(img, width, height, format) {
	let quality = document.getElementById("compressStrength").value;
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');

	canvas.width = width;
	canvas.height = height;
	ctx.drawImage(img, 0, 0, width, height);

	let compressedDataUrl;
	let extension = format;
	if (format == "jpg") {
		extension = "jpeg";
	}

	if (quality == 0) {
		compressedDataUrl = canvas.toDataURL('image/' + extension);
	} else {
		if (format === 'png' || format === 'ico') {
			compressedDataUrl = compressRGB(canvas, ctx, width, height, quality, extension);
		} else {
			quality = 1 - (quality * 0.15)
			compressedDataUrl = canvas.toDataURL('image/' + extension, quality);
		}
	}

	return dataURLToFile(compressedDataUrl, img.name);
}

// Helper function for PNG compression
function compressRGB(canvas, ctx, width, height, quality, extension) {
	const imageData = ctx.getImageData(0, 0, width, height);
	const data = imageData.data;
	const difference = 5 * quality;

	const processed = new Array(width * height).fill(false);

	function rgbDifference(r1, g1, b1, r2, g2, b2) {
		return Math.abs(r1 - r2) <= difference && Math.abs(g1 - g2) <= difference && Math.abs(b1 - b2) <= difference;
	}

	function processPixelGroup(x, y, r, g, b) {
		const stack = [
			[x, y]
		];
		const directions = [
			[1, 0],
			[-1, 0],
			[0, 1],
			[0, -1]
		];

		while (stack.length > 0) {
			const [px, py] = stack.pop();
			const index = (py * width + px) * 4;

			if (processed[py * width + px]) continue;

			data[index] = r;
			data[index + 1] = g;
			data[index + 2] = b;

			processed[py * width + px] = true;

			for (let [dx, dy] of directions) {
				const nx = px + dx;
				const ny = py + dy;

				if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
					const neighborIndex = (ny * width + nx) * 4;
					const nr = data[neighborIndex];
					const ng = data[neighborIndex + 1];
					const nb = data[neighborIndex + 2];

					if (!processed[ny * width + nx] && rgbDifference(r, g, b, nr, ng, nb)) {
						stack.push([nx, ny]);
					}
				}
			}
		}
	}

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4;
			if (!processed[y * width + x]) {
				const r = data[index];
				const g = data[index + 1];
				const b = data[index + 2];
				processPixelGroup(x, y, r, g, b);
			}
		}
	}

	ctx.putImageData(imageData, 0, 0);
	return canvas.toDataURL('image/' + extension);
}

// Helper function to create download link
function addDownloadLink(container, blob, fileName, sizeInKB) {
	// Create download link
	const link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = fileName;

	const row = document.createElement("tr");

	// Generate preview image
	const previewImage = document.createElement("img");
	previewImage.className = "preview";
	previewImage.src = URL.createObjectURL(blob);

	const previewCell = document.createElement("td");
	previewCell.appendChild(previewImage);
	row.appendChild(previewCell);

	const nameCell = document.createElement("td");
	nameCell.className = "file-name";
	nameCell.textContent = fileName;
	row.appendChild(nameCell);

	const sizeCell = document.createElement("td");
	sizeCell.className = "file-size";
	sizeCell.textContent = `${sizeInKB} KB`;
	row.appendChild(sizeCell);

	const downloadCell = document.createElement("td");
	downloadCell.style.textAlign = "-webkit-center";

	const downloadButton = document.createElement("button");
	downloadButton.innerHTML = "<i class='fa-solid fa-cloud-arrow-down'></i>";
	downloadButton.addEventListener("click", () => link.click());
	downloadCell.appendChild(downloadButton);
	row.appendChild(downloadCell);

	container.appendChild(row);
}

// Function to convert Data URL to File object
function dataURLToFile(dataUrl, filename) {
	const arr = dataUrl.split(',');
	const mime = arr[0].match(/:(.*?);/)[1];
	const bstr = atob(arr[1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, {
		type: mime
	});
}

async function downloadAll() {
	const currentUTC = new Date().toISOString().replace(/[:.-]/g, "_");
	const zipFileName = `${currentUTC}_converted_ico.zip`;
	const zipBlob = await zip.generateAsync({
		type: 'blob'
	});
	const link = document.createElement("a");
	link.href = URL.createObjectURL(zipBlob);
	link.download = zipFileName;
	link.click();
}

function clearHistory() {
	zip = new JSZip();
	const downloadAllButton = document.getElementById("downloadAllButton");
	const downloadAllButton2 = document.getElementById("downloadAllButton2");
	const downloadLinks = document.getElementById("downloadLinks");
	downloadLinks.innerHTML = '';
	downloadAllButton.disabled = true;
	downloadAllButton2.disabled = true;
	fileInput.value = '';
}