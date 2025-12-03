/*
	Toast 유틸리티는 /resources/js/utils/toast.js에서 로드됨
*/

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

/*
	File handler
*/
let ALL_DATAS = [];
let HISTORY_COUNT = 0;

// Main function to handle files
async function handleFiles(files) {
	const fileArray = Array.from(files);
	let completedCount = 0;
	try {
		const downloadLinks = document.getElementById("downloadLinks");

		// Process each file
		const convertPromises = fileArray.map(async (file) => {
			try {
				const fileType = file.type;
				if (! file.type.startsWith('image/')) {
					showToast(`${file.name} is an unsupported type.`);
				} else {
					const reader = new FileReader();
					reader.onload = function(e) {
						const createdAt = new Date(file.lastModified);
						EXIF.getData(file, function() {
							addDownloadLink(downloadLinks, URL.createObjectURL(file), this);
						});
					};
					reader.readAsArrayBuffer(file);
				}
			} catch (error) {
				console.log(error);
				showToast(`An error occurred while processing ${file.name}.`);
			}
			completedCount++;
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

function toggleInfo(target, index){
	const title = document.getElementById(target + "Title" + index);
	const value = document.getElementById(target + "Value" + index);
	if (title && title.innerHTML.includes('▼')) {
		title.innerHTML = title.innerHTML.replace(/▼/g, '▲');
		value.style.display = "block";
	} else {
		title.innerHTML = title.innerHTML.replace(/▲/g, '▼');
		value.style.display = "none";
	}
}

// Helper function to create download link
function addDownloadLink(container, blob, fileInfo) {
	const exif = fileInfo['exifdata'];
	let exif_data = {"name": fileInfo.name, "size": fileInfo.size, "type": fileInfo.type, "exif": exif, "iptcdata": fileInfo.iptcdata,"lastModifiedDate": fileInfo.lastModifiedDate, "lastModified": fileInfo.lastModified};

	const row = document.createElement("tr");
	// Generate preview image
	const previewImage = document.createElement("img");
	previewImage.className = "preview";
	previewImage.src = blob;
	const previewCell = document.createElement("td");
	previewCell.appendChild(previewImage);
	row.appendChild(previewCell);

	const nameCell = document.createElement("td");
	nameCell.className = "file-name";
	nameCell.innerHTML = fileInfo.name;
	row.appendChild(nameCell);

	const exifCell = document.createElement("td");
	
	const cameraInfoTitle = document.createElement("div");
	const cameraInfoValue = document.createElement("div");
	
	cameraInfoTitle.innerText = LANGUAGE_OBJECT["EXIF_VIEWER_LANG"]["camera-info"][NOW_LANG]+" ▲ ";
	cameraInfoTitle.className = "info-bar";
	cameraInfoTitle.id = "cameraInfoTitle" + HISTORY_COUNT;
	cameraInfoTitle.setAttribute("onClick", "toggleInfo('cameraInfo', " + HISTORY_COUNT + ")");
	cameraInfoValue.className = "value-bar";
	cameraInfoValue.id = "cameraInfoValue" + HISTORY_COUNT;
	const cameraInfoValueText = [
		exif.Make || '',
		exif.Model || ''
	].join(' ').trim();
	if(cameraInfoValueText) {
		exif_data["camera"] = cameraInfoValueText;
		cameraInfoValue.innerText = cameraInfoValueText;
	} else {
		cameraInfoValue.innerText = "-";
	}
	exifCell.appendChild(cameraInfoTitle);
	exifCell.appendChild(cameraInfoValue);
	
	const gpsInfoTitle = document.createElement("div");
	const gpsInfoValue = document.createElement("div");
	gpsInfoTitle.innerText = LANGUAGE_OBJECT["EXIF_VIEWER_LANG"]["gps-info"][NOW_LANG]+" ▲ ";
	gpsInfoTitle.className = "info-bar border-top-gray";
	gpsInfoTitle.id = "gpsInfoTitle" + HISTORY_COUNT;
	gpsInfoTitle.setAttribute("onClick", "toggleInfo('gpsInfo', " + HISTORY_COUNT + ")");
	gpsInfoValue.className = "value-bar";
	gpsInfoValue.id = "gpsInfoValue" + HISTORY_COUNT;
	if ('GPSLatitude' in exif && 'GPSLatitudeRef' in exif && 'GPSLongitude' in exif && 'GPSLongitudeRef' in exif) {
		const gpsText = document.createElement("div");

		// 위도와 경도를 DMS 형식으로 가져오기
		const latitude = `${exif.GPSLatitude[0]}°${exif.GPSLatitude[1]}'${exif.GPSLatitude[2].toFixed(1)}"${exif.GPSLatitudeRef}`;
		const longitude = `${exif.GPSLongitude[0]}°${exif.GPSLongitude[1].toString().padStart(2, '0')}'${exif.GPSLongitude[2].toFixed(1)}"${exif.GPSLongitudeRef}`;
		gpsText.innerText = `${latitude} ${longitude}`;

		exif_data["gps"] = `${latitude} ${longitude}`;
		gpsInfoValue.appendChild(gpsText);
		
		/*
			// 위도와 경도를 10진수 형태로 변환
			const latDecimal = exif.GPSLatitude[0] + exif.GPSLatitude[1] / 60 + exif.GPSLatitude[2] / 3600;
			const lonDecimal = exif.GPSLongitude[0] + exif.GPSLongitude[1] / 60 + exif.GPSLongitude[2] / 3600;

			// 북위, 동경인지 확인하여 부호 설정
			const lat = exif.GPSLatitudeRef === "S" ? -latDecimal : latDecimal;
			const lon = exif.GPSLongitudeRef === "W" ? -lonDecimal : lonDecimal;

			// Google 지도 iframe 생성
			const googleMap = document.createElement("iframe");
			googleMap.src = `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${lat},${lon}&zoom=15`;
			googleMap.width = "600";
			googleMap.height = "450";
			googleMap.style.border = "0";
			googleMap.allowFullscreen = "";
			googleMap.loading = "lazy";
			gpsInfoValue.appendChild(googleMap);
		*/

		const googleMap = document.createElement("a");
		googleMap.href=`https://www.google.com/maps/place/${latitude}+${longitude}`;
		googleMap.target = "_blank";
		googleMap.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> Google Map';
		gpsInfoValue.appendChild(googleMap);
	} else {
		gpsInfoValue.innerHTML = "-";
	}

	exifCell.appendChild(gpsInfoTitle);
	exifCell.appendChild(gpsInfoValue);

	const allInfoTitle = document.createElement("div");
	const allInfoValue = document.createElement("div");
	allInfoTitle.innerText = LANGUAGE_OBJECT["EXIF_VIEWER_LANG"]["all-info"][NOW_LANG]+" ▼ ";
	allInfoTitle.className = "info-bar border-top-gray";
	allInfoTitle.id = "allInfoTitle" + HISTORY_COUNT;
	allInfoTitle.setAttribute("onClick", "toggleInfo('allInfo', " + HISTORY_COUNT + ")");
	allInfoValue.className = "value-bar-no-bottom-margin";
	allInfoValue.id = "allInfoValue" + HISTORY_COUNT;
	allInfoValue.style.display = "none";
	let flagAmount = 0;
	for (const [key, value] of Object.entries(exif)) {
		if(key != "MakerNote" && key !== undefined) {
			const valueString = Array.isArray(value) ? value.join(', ') : value;
			const exifInfo = document.createElement('div');
			if("exif-"+key in LANGUAGE_OBJECT["EXIF_VIEWER_LANG"]){
				exifInfo.innerText = `${LANGUAGE_OBJECT["EXIF_VIEWER_LANG"]["exif-"+key][NOW_LANG]}: ${valueString}`;
				allInfoValue.appendChild(exifInfo);
				flagAmount += 1;
			}
		}
	}
	if(flagAmount < 1){
		allInfoValue.innerText = "-";
	} else {
		allInfoValue.style.textAlign = "left";
	}
	exifCell.appendChild(allInfoTitle);
	exifCell.appendChild(allInfoValue);
	row.appendChild(exifCell);
	container.appendChild(row);
	
	ALL_DATAS.push(exif_data);
	HISTORY_COUNT += 1;
}

function downloadJSON() {
	let jsonStr = JSON.stringify(ALL_DATAS, null, 2);
	let blob = new Blob([jsonStr], { type: 'application/json' });
	let link = document.createElement('a');
	link.href = URL.createObjectURL(blob);
	link.download = 'EXIFs.json';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

function clearHistory() {
	ALL_DATAS = [];
	HISTORY_COUNT = 0;
	const downloadAllButton = document.getElementById("downloadAllButton");
	const downloadAllButton2 = document.getElementById("downloadAllButton2");
	const downloadLinks = document.getElementById("downloadLinks");
	downloadLinks.innerHTML = '';
	downloadAllButton.disabled = true;
	downloadAllButton2.disabled = true;
	fileInput.value = '';
}

/*
	EXIF parser
	https://cdnjs.cloudflare.com/ajax/libs/exif-js/2.3.0/exif.min.js
*/
function imageHasData(img) {
	return !!img.exifdata
}

function base64ToArrayBuffer(base64, contentType) {
	contentType = contentType || base64.match(/^data\:([^\;]+)\;base64,/im)[1] || "", base64 = base64.replace(/^data\:([^\;]+)\;base64,/gim, "");
	for (var binary = atob(base64), len = binary.length, i = new ArrayBuffer(len), view = new Uint8Array(i), i = 0; i < len; i++) view[i] = binary.charCodeAt(i);
	return i
}

function objectURLToBlob(url, callback) {
	var http = new XMLHttpRequest;
	http.open("GET", url, !0), http.responseType = "blob", http.onload = function(url) {
		200 != this.status && 0 !== this.status || base64ToArrayBuffer(this.response)
	}, http.send()
}

function getImageData(img, callback) {
	function handleBinaryFile(binFile) {
		var data = findEXIFinJPEG(binFile);
		img.exifdata = data || {};
		var iptcdata = findIPTCinJPEG(binFile);
		if (img.iptcdata = iptcdata || {}, EXIF.isXmpEnabled) {
			var xmpdata = findXMPinJPEG(binFile);
			img.xmpdata = xmpdata || {}
		}
		callback && callback.call(img)
	}
	if (img.src)
		if (/^data\:/i.test(img.src)) handleBinaryFile(base64ToArrayBuffer(img.src));
		else if (/^blob\:/i.test(img.src))(fileReader = new FileReader).onload = function(img) {
		handleBinaryFile(img.target.result)
	}, objectURLToBlob(img.src, function(img) {
		fileReader.readAsArrayBuffer(img)
	});
	else {
		var http = new XMLHttpRequest;
		http.onload = function() {
			if (200 != this.status && 0 !== this.status) throw "Could not load image";
			handleBinaryFile(http.response), http = null
		}, http.open("GET", img.src, !0), http.responseType = "arraybuffer", http.send(null)
	} else if (self.FileReader && (img instanceof self.Blob || img instanceof self.File)) {
		var fileReader = new FileReader;
		fileReader.onload = function(e) {
			debug && console.log("Got file of length " + img.target.result.byteLength), handleBinaryFile(e.target.result)
		}, fileReader.readAsArrayBuffer(img)
	}
}

function findEXIFinJPEG(file) {
	var dataView = new DataView(file);
	if (debug && console.log("Got file of length " + file.byteLength), 255 != dataView.getUint8(0) || 216 != dataView.getUint8(1)) return debug && console.log("Not a valid JPEG"), !1;
	for (var marker, offset = 2, length = file.byteLength; offset < length;) {
		if (255 != dataView.getUint8(offset)) return debug && console.log("Not a valid marker at offset " + offset + ", found: " + dataView.getUint8(offset)), !1;
		if (marker = dataView.getUint8(offset + 1), debug && console.log(marker), 225 == marker) return debug && console.log("Found 0xFFE1 marker"), g(dataView, offset + 4, dataView.getUint16(offset + 2));
		offset += 2 + dataView.getUint16(offset + 2)
	}
}

function findIPTCinJPEG(e) {
	var t = new DataView(e);
	if (debug && console.log("Got file of length " + e.byteLength), 255 != t.getUint8(0) || 216 != t.getUint8(1)) return debug && console.log("Not a valid JPEG"), !1;
	for (var n = 2, r = e.byteLength; n < r;) {
		if (function(e, t) {
				return 56 === e.getUint8(t) && 66 === e.getUint8(t + 1) && 73 === e.getUint8(t + 2) && 77 === e.getUint8(t + 3) && 4 === e.getUint8(t + 4) && 4 === e.getUint8(t + 5)
			}(t, n)) {
			var i = t.getUint8(n + 7);
			return i % 2 != 0 && (i += 1), 0 === i && (i = 4), s(e, n + 8 + i, t.getUint16(n + 6 + i))
		}
		n++
	}
}

function s(e, t, n) {
	for (var r, i, o, a, s = new DataView(e), l = {}, u = t; u < t + n;) 28 === s.getUint8(u) && 2 === s.getUint8(u + 1) && (a = s.getUint8(u + 2)) in v && ((o = s.getInt16(u + 3)) + 5, i = v[a], r = f(s, u + 5, o), l.hasOwnProperty(i) ? l[i] instanceof Array ? l[i].push(r) : l[i] = [l[i], r] : l[i] = r), u++;
	return l
}

function l(e, t, n, r, i) {
	var o, a, s, l = e.getUint16(n, !i),
		c = {};
	for (s = 0; s < l; s++) o = n + 12 * s + 2, !(a = r[e.getUint16(o, !i)]) && debug && console.log("Unknown tag: " + e.getUint16(o, !i)), c[a] = u(e, o, t, n, i);
	return c
}

function u(e, t, n, r, i) {
	var o, a, s, l, u, c, d = e.getUint16(t + 2, !i),
		g = e.getUint32(t + 4, !i),
		m = e.getUint32(t + 8, !i) + n;
	switch (d) {
		case 1:
		case 7:
			if (1 == g) return e.getUint8(t + 8, !i);
			for (o = g > 4 ? m : t + 8, a = [], l = 0; l < g; l++) a[l] = e.getUint8(o + l);
			return a;
		case 2:
			return o = g > 4 ? m : t + 8, f(e, o, g - 1);
		case 3:
			if (1 == g) return e.getUint16(t + 8, !i);
			for (o = g > 2 ? m : t + 8, a = [], l = 0; l < g; l++) a[l] = e.getUint16(o + 2 * l, !i);
			return a;
		case 4:
			if (1 == g) return e.getUint32(t + 8, !i);
			for (a = [], l = 0; l < g; l++) a[l] = e.getUint32(m + 4 * l, !i);
			return a;
		case 5:
			if (1 == g) return u = e.getUint32(m, !i), c = e.getUint32(m + 4, !i), s = new Number(u / c), s.numerator = u, s.denominator = c, s;
			for (a = [], l = 0; l < g; l++) u = e.getUint32(m + 8 * l, !i), c = e.getUint32(m + 4 + 8 * l, !i), a[l] = new Number(u / c), a[l].numerator = u, a[l].denominator = c;
			return a;
		case 9:
			if (1 == g) return e.getInt32(t + 8, !i);
			for (a = [], l = 0; l < g; l++) a[l] = e.getInt32(m + 4 * l, !i);
			return a;
		case 10:
			if (1 == g) return e.getInt32(m, !i) / e.getInt32(m + 4, !i);
			for (a = [], l = 0; l < g; l++) a[l] = e.getInt32(m + 8 * l, !i) / e.getInt32(m + 4 + 8 * l, !i);
			return a
	}
}

function c(e, t, n) {
	var r = e.getUint16(t, !n);
	return e.getUint32(t + 2 + 12 * r, !n)
}

function d(e, t, n, r) {
	var i = c(e, t + n, r);
	if (!i) return {};
	if (i > e.byteLength) return {};
	var o = l(e, t, t + i, C, r);
	if (o.Compression) switch (o.Compression) {
		case 6:
			if (o.JpegIFOffset && o.JpegIFByteCount) {
				var a = t + o.JpegIFOffset,
					s = o.JpegIFByteCount;
				o.blob = new Blob([new Uint8Array(e.buffer, a, s)], {
					type: "image/jpeg"
				})
			}
			break;
		case 1:
			console.log("Thumbnail image format is TIFF, which is not implemented.");
			break;
		default:
			console.log("Unknown thumbnail image format '%s'", o.Compression)
	} else 2 == o.PhotometricInterpretation && console.log("Thumbnail image format is RGB, which is not implemented.");
	return o
}

function f(e, t, r) {
	var i = "";
	for (n = t; n < t + r; n++) i += String.fromCharCode(e.getUint8(n));
	return i
}

function g(e, t) {
	if ("Exif" != f(e, t, 4)) return debug && console.log("Not valid EXIF data! " + f(e, t, 4)), !1;
	var n, r, i, o, a, s = t + 6;
	if (18761 == e.getUint16(s)) n = !1;
	else {
		if (19789 != e.getUint16(s)) return debug && console.log("Not valid TIFF data! (no 0x4949 or 0x4D4D)"), !1;
		n = !0
	}
	if (42 != e.getUint16(s + 2, !n)) return debug && console.log("Not valid TIFF data! (no 0x002A)"), !1;
	var u = e.getUint32(s + 4, !n);
	if (u < 8) return S && console.log("Not valid TIFF data! (First offset less than 8)", e.getUint32(s + 4, !n)), !1;
	if ((r = l(e, s, s + u, b, n)).ExifIFDPointer) {
		o = l(e, s, s + r.ExifIFDPointer, y, n);
		for (i in o) {
			switch (i) {
				case "LightSource":
				case "Flash":
				case "MeteringMode":
				case "ExposureProgram":
				case "SensingMethod":
				case "SceneCaptureType":
				case "SceneType":
				case "CustomRendered":
				case "WhiteBalance":
				case "GainControl":
				case "Contrast":
				case "Saturation":
				case "Sharpness":
				case "SubjectDistanceRange":
				case "FileSource":
					o[i] = I[i][o[i]];
					break;
				case "ExifVersion":
				case "FlashpixVersion":
					o[i] = String.fromCharCode(o[i][0], o[i][1], o[i][2], o[i][3]);
					break;
				case "ComponentsConfiguration":
					o[i] = I.Components[o[i][0]] + I.Components[o[i][1]] + I.Components[o[i][2]] + I.Components[o[i][3]]
			}
			r[i] = o[i]
		}
	}
	if (r.GPSInfoIFDPointer) {
		a = l(e, s, s + r.GPSInfoIFDPointer, x, n);
		for (i in a) {
			switch (i) {
				case "GPSVersionID":
					a[i] = a[i][0] + "." + a[i][1] + "." + a[i][2] + "." + a[i][3]
			}
			r[i] = a[i]
		}
	}
	return r.thumbnail = d(e, s, u, n), r
}

function findXMPinJPEG(e) {
	if ("DOMParser" in self) {
		var t = new DataView(e);
		if (debug && console.log("Got file of length " + e.byteLength), 255 != t.getUint8(0) || 216 != t.getUint8(1)) return debug && console.log("Not a valid JPEG"), !1;
		for (var n = 2, r = e.byteLength, i = new DOMParser; n < r - 4;) {
			if ("http" == f(t, n, 4)) {
				var o = f(t, n - 1, t.getUint16(n - 2) - 1),
					a = o.indexOf("xmpmeta>") + 8,
					s = (o = o.substring(o.indexOf("<x:xmpmeta"), a)).indexOf("x:xmpmeta") + 10;
				return o = o.slice(0, s) + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:tiff="http://ns.adobe.com/tiff/1.0/" xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" ' + o.slice(s), h(i.parseFromString(o, "text/xml"))
			}
			n++
		}
	}
}

function p(e) {
	var t = {};
	if (1 == e.nodeType) {
		if (e.attributes.length > 0) {
			t["@attributes"] = {};
			for (var n = 0; n < e.attributes.length; n++) {
				var r = e.attributes.item(n);
				t["@attributes"][r.nodeName] = r.nodeValue
			}
		}
	} else if (3 == e.nodeType) return e.nodeValue;
	if (e.hasChildNodes())
		for (var i = 0; i < e.childNodes.length; i++) {
			var o = e.childNodes.item(i),
				a = o.nodeName;
			if (null == t[a]) t[a] = p(o);
			else {
				if (null == t[a].push) {
					var s = t[a];
					t[a] = [], t[a].push(s)
				}
				t[a].push(p(o))
			}
		}
	return t
}

function h(e) {
	try {
		var t = {};
		if (e.children.length > 0)
			for (var n = 0; n < e.children.length; n++) {
				var r = e.children.item(n),
					i = r.attributes;
				for (var o in i) {
					var a = i[o],
						s = a.nodeName,
						l = a.nodeValue;
					void 0 !== s && (t[s] = l)
				}
				var u = r.nodeName;
				if (void 0 === t[u]) t[u] = p(r);
				else {
					if (void 0 === t[u].push) {
						var c = t[u];
						t[u] = [], t[u].push(c)
					}
					t[u].push(p(r))
				}
			} else t = e.innerHTML;
		return t
	} catch (e) {
		console.log(e.message)
	}
}
var debug = !1,
	P = this,
	EXIF = function(e) {
		return e instanceof EXIF ? e : this instanceof EXIF ? void(this.EXIFwrapped = e) : new EXIF(e)
	};
"undefined" != typeof exports ? ("undefined" != typeof module && module.exports && (exports = module.exports = EXIF), exports.EXIF = EXIF) : P.EXIF = EXIF;
var y = EXIF.Tags = {
		36864: "ExifVersion",
		40960: "FlashpixVersion",
		40961: "ColorSpace",
		40962: "PixelXDimension",
		40963: "PixelYDimension",
		37121: "ComponentsConfiguration",
		37122: "CompressedBitsPerPixel",
		37500: "MakerNote",
		37510: "UserComment",
		40964: "RelatedSoundFile",
		36867: "DateTimeOriginal",
		36868: "DateTimeDigitized",
		37520: "SubsecTime",
		37521: "SubsecTimeOriginal",
		37522: "SubsecTimeDigitized",
		33434: "ExposureTime",
		33437: "FNumber",
		34850: "ExposureProgram",
		34852: "SpectralSensitivity",
		34855: "ISOSpeedRatings",
		34856: "OECF",
		37377: "ShutterSpeedValue",
		37378: "ApertureValue",
		37379: "BrightnessValue",
		37380: "ExposureBias",
		37381: "MaxApertureValue",
		37382: "SubjectDistance",
		37383: "MeteringMode",
		37384: "LightSource",
		37385: "Flash",
		37396: "SubjectArea",
		37386: "FocalLength",
		41483: "FlashEnergy",
		41484: "SpatialFrequencyResponse",
		41486: "FocalPlaneXResolution",
		41487: "FocalPlaneYResolution",
		41488: "FocalPlaneResolutionUnit",
		41492: "SubjectLocation",
		41493: "ExposureIndex",
		41495: "SensingMethod",
		41728: "FileSource",
		41729: "SceneType",
		41730: "CFAPattern",
		41985: "CustomRendered",
		41986: "ExposureMode",
		41987: "WhiteBalance",
		41988: "DigitalZoomRation",
		41989: "FocalLengthIn35mmFilm",
		41990: "SceneCaptureType",
		41991: "GainControl",
		41992: "Contrast",
		41993: "Saturation",
		41994: "Sharpness",
		41995: "DeviceSettingDescription",
		41996: "SubjectDistanceRange",
		40965: "InteroperabilityIFDPointer",
		42016: "ImageUniqueID"
	},
	b = EXIF.TiffTags = {
		256: "ImageWidth",
		257: "ImageHeight",
		34665: "ExifIFDPointer",
		34853: "GPSInfoIFDPointer",
		40965: "InteroperabilityIFDPointer",
		258: "BitsPerSample",
		259: "Compression",
		262: "PhotometricInterpretation",
		274: "Orientation",
		277: "SamplesPerPixel",
		284: "PlanarConfiguration",
		530: "YCbCrSubSampling",
		531: "YCbCrPositioning",
		282: "XResolution",
		283: "YResolution",
		296: "ResolutionUnit",
		273: "StripOffsets",
		278: "RowsPerStrip",
		279: "StripByteCounts",
		513: "JPEGInterchangeFormat",
		514: "JPEGInterchangeFormatLength",
		301: "TransferFunction",
		318: "WhitePoint",
		319: "PrimaryChromaticities",
		529: "YCbCrCoefficients",
		532: "ReferenceBlackWhite",
		306: "DateTime",
		270: "ImageDescription",
		271: "Make",
		272: "Model",
		305: "Software",
		315: "Artist",
		33432: "Copyright"
	},
	x = EXIF.GPSTags = {
		0: "GPSVersionID",
		1: "GPSLatitudeRef",
		2: "GPSLatitude",
		3: "GPSLongitudeRef",
		4: "GPSLongitude",
		5: "GPSAltitudeRef",
		6: "GPSAltitude",
		7: "GPSTimeStamp",
		8: "GPSSatellites",
		9: "GPSStatus",
		10: "GPSMeasureMode",
		11: "GPSDOP",
		12: "GPSSpeedRef",
		13: "GPSSpeed",
		14: "GPSTrackRef",
		15: "GPSTrack",
		16: "GPSImgDirectionRef",
		17: "GPSImgDirection",
		18: "GPSMapDatum",
		19: "GPSDestLatitudeRef",
		20: "GPSDestLatitude",
		21: "GPSDestLongitudeRef",
		22: "GPSDestLongitude",
		23: "GPSDestBearingRef",
		24: "GPSDestBearing",
		25: "GPSDestDistanceRef",
		26: "GPSDestDistance",
		27: "GPSProcessingMethod",
		28: "GPSAreaInformation",
		29: "GPSDateStamp",
		30: "GPSDifferential"
	},
	C = EXIF.IFD1Tags = {
		256: "ImageWidth",
		257: "ImageHeight",
		258: "BitsPerSample",
		259: "Compression",
		262: "PhotometricInterpretation",
		273: "StripOffsets",
		274: "Orientation",
		277: "SamplesPerPixel",
		278: "RowsPerStrip",
		279: "StripByteCounts",
		282: "XResolution",
		283: "YResolution",
		284: "PlanarConfiguration",
		296: "ResolutionUnit",
		513: "JpegIFOffset",
		514: "JpegIFByteCount",
		529: "YCbCrCoefficients",
		530: "YCbCrSubSampling",
		531: "YCbCrPositioning",
		532: "ReferenceBlackWhite"
	},
	I = EXIF.StringValues = {
		ExposureProgram: {
			0: "Not defined",
			1: "Manual",
			2: "Normal program",
			3: "Aperture priority",
			4: "Shutter priority",
			5: "Creative program",
			6: "Action program",
			7: "Portrait mode",
			8: "Landscape mode"
		},
		MeteringMode: {
			0: "Unknown",
			1: "Average",
			2: "CenterWeightedAverage",
			3: "Spot",
			4: "MultiSpot",
			5: "Pattern",
			6: "Partial",
			255: "Other"
		},
		LightSource: {
			0: "Unknown",
			1: "Daylight",
			2: "Fluorescent",
			3: "Tungsten (incandescent light)",
			4: "Flash",
			9: "Fine weather",
			10: "Cloudy weather",
			11: "Shade",
			12: "Daylight fluorescent (D 5700 - 7100K)",
			13: "Day white fluorescent (N 4600 - 5400K)",
			14: "Cool white fluorescent (W 3900 - 4500K)",
			15: "White fluorescent (WW 3200 - 3700K)",
			17: "Standard light A",
			18: "Standard light B",
			19: "Standard light C",
			20: "D55",
			21: "D65",
			22: "D75",
			23: "D50",
			24: "ISO studio tungsten",
			255: "Other"
		},
		Flash: {
			0: "Flash did not fire",
			1: "Flash fired",
			5: "Strobe return light not detected",
			7: "Strobe return light detected",
			9: "Flash fired, compulsory flash mode",
			13: "Flash fired, compulsory flash mode, return light not detected",
			15: "Flash fired, compulsory flash mode, return light detected",
			16: "Flash did not fire, compulsory flash mode",
			24: "Flash did not fire, auto mode",
			25: "Flash fired, auto mode",
			29: "Flash fired, auto mode, return light not detected",
			31: "Flash fired, auto mode, return light detected",
			32: "No flash function",
			65: "Flash fired, red-eye reduction mode",
			69: "Flash fired, red-eye reduction mode, return light not detected",
			71: "Flash fired, red-eye reduction mode, return light detected",
			73: "Flash fired, compulsory flash mode, red-eye reduction mode",
			77: "Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected",
			79: "Flash fired, compulsory flash mode, red-eye reduction mode, return light detected",
			89: "Flash fired, auto mode, red-eye reduction mode",
			93: "Flash fired, auto mode, return light not detected, red-eye reduction mode",
			95: "Flash fired, auto mode, return light detected, red-eye reduction mode"
		},
		SensingMethod: {
			1: "Not defined",
			2: "One-chip color area sensor",
			3: "Two-chip color area sensor",
			4: "Three-chip color area sensor",
			5: "Color sequential area sensor",
			7: "Trilinear sensor",
			8: "Color sequential linear sensor"
		},
		SceneCaptureType: {
			0: "Standard",
			1: "Landscape",
			2: "Portrait",
			3: "Night scene"
		},
		SceneType: {
			1: "Directly photographed"
		},
		CustomRendered: {
			0: "Normal process",
			1: "Custom process"
		},
		WhiteBalance: {
			0: "Auto white balance",
			1: "Manual white balance"
		},
		GainControl: {
			0: "None",
			1: "Low gain up",
			2: "High gain up",
			3: "Low gain down",
			4: "High gain down"
		},
		Contrast: {
			0: "Normal",
			1: "Soft",
			2: "Hard"
		},
		Saturation: {
			0: "Normal",
			1: "Low saturation",
			2: "High saturation"
		},
		Sharpness: {
			0: "Normal",
			1: "Soft",
			2: "Hard"
		},
		SubjectDistanceRange: {
			0: "Unknown",
			1: "Macro",
			2: "Close view",
			3: "Distant view"
		},
		FileSource: {
			3: "DSC"
		},
		Components: {
			0: "",
			1: "Y",
			2: "Cb",
			3: "Cr",
			4: "R",
			5: "G",
			6: "B"
		}
	},
	v = {
		120: "caption",
		110: "credit",
		25: "keywords",
		55: "dateCreated",
		80: "byline",
		85: "bylineTitle",
		122: "captionWriter",
		105: "headline",
		116: "copyright",
		15: "category"
	};
EXIF.enableXmp = function() {
	EXIF.isXmpEnabled = !0
}, EXIF.disableXmp = function() {
	EXIF.isXmpEnabled = !1
}, EXIF.getData = function(t, n) {
	return !((self.Image && t instanceof self.Image || self.HTMLImageElement && t instanceof self.HTMLImageElement) && !t.complete) && (imageHasData(t) ? n && n.call(t) : getImageData(t, n), !0)
}, EXIF.getTag = function(t, n) {
	if (imageHasData(t)) return t.exifdata[n]
}, EXIF.getIptcTag = function(t, n) {
	if (imageHasData(t)) return t.iptcdata[n]
}, EXIF.getAllTags = function(t) {
	if (!imageHasData(t)) return {};
	var n, r = t.exifdata,
		i = {};
	for (n in r) r.hasOwnProperty(n) && (i[n] = r[n]);
	return i
}, EXIF.getAllIptcTags = function(t) {
	if (!imageHasData(t)) return {};
	var n, r = t.iptcdata,
		i = {};
	for (n in r) r.hasOwnProperty(n) && (i[n] = r[n]);
	return i
}, EXIF.pretty = function(t) {
	if (!imageHasData(t)) return "";
	var n, r = t.exifdata,
		i = "";
	for (n in r) r.hasOwnProperty(n) && ("object" == typeof r[n] ? r[n] instanceof Number ? i += n + " : " + r[n] + " [" + r[n].numerator + "/" + r[n].denominator + "]\r\n" : i += n + " : [" + r[n].length + " values]\r\n" : i += n + " : " + r[n] + "\r\n");
	return i
}, EXIF.readFromBinaryFile = function(e) {
	return findEXIFinJPEG(e)
}, "function" == typeof define && define.amd && define("exif-js", [], function() {
	return EXIF
});