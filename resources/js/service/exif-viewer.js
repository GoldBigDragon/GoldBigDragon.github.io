(function () {
  "use strict";

  var rows = [];

  var TAGS = {
    0x010e: "ImageDescription", 0x010f: "Make", 0x0110: "Model", 0x0112: "Orientation",
    0x011a: "XResolution", 0x011b: "YResolution", 0x0128: "ResolutionUnit",
    0x0131: "Software", 0x0132: "DateTime", 0x013b: "Artist", 0x0213: "YCbCrPositioning",
    0x8298: "Copyright", 0x8769: "ExifIFDPointer", 0x8825: "GPSInfoIFDPointer",
    0x829a: "ExposureTime", 0x829d: "FNumber", 0x8822: "ExposureProgram",
    0x8827: "ISOSpeedRatings", 0x9000: "ExifVersion", 0x9003: "DateTimeOriginal",
    0x9004: "DateTimeDigitized", 0x9101: "ComponentsConfiguration",
    0x9102: "CompressedBitsPerPixel", 0x9201: "ShutterSpeedValue", 0x9202: "ApertureValue",
    0x9203: "BrightnessValue", 0x9204: "ExposureBias", 0x9205: "MaxApertureValue",
    0x9207: "MeteringMode", 0x9208: "LightSource", 0x9209: "Flash", 0x920a: "FocalLength",
    0xa001: "ColorSpace", 0xa002: "PixelXDimension", 0xa003: "PixelYDimension",
    0xa20e: "FocalPlaneXResolution", 0xa20f: "FocalPlaneYResolution",
    0xa210: "FocalPlaneResolutionUnit", 0xa217: "SensingMethod", 0xa300: "FileSource",
    0xa301: "SceneType", 0xa401: "CustomRendered", 0xa402: "ExposureMode",
    0xa403: "WhiteBalance", 0xa404: "DigitalZoomRation", 0xa405: "FocalLengthIn35mmFilm",
    0xa406: "SceneCaptureType", 0xa40c: "SubjectDistanceRange", 0xa420: "ImageUniqueID",
    0x0000: "GPSVersionID", 0x0001: "GPSLatitudeRef", 0x0002: "GPSLatitude",
    0x0003: "GPSLongitudeRef", 0x0004: "GPSLongitude", 0x0005: "GPSAltitudeRef",
    0x0006: "GPSAltitude", 0x0007: "GPSTimeStamp", 0x0011: "GPSImgDirection",
    0x001d: "GPSDateStamp"
  };

  var CAMERA = ["Make", "Model", "Software", "DateTime", "DateTimeOriginal", "ExposureTime",
    "FNumber", "ISOSpeedRatings", "FocalLength", "FocalLengthIn35mmFilm", "Flash",
    "WhiteBalance", "ExposureMode", "MeteringMode", "Orientation", "PixelXDimension",
    "PixelYDimension"];
  var GPS = ["GPSLatitude", "GPSLatitudeRef", "GPSLongitude", "GPSLongitudeRef",
    "GPSAltitude", "GPSAltitudeRef", "GPSDateStamp", "GPSTimeStamp", "GPSImgDirection"];

  function L(key) {
    var bag = (window.LANGUAGE_OBJECT || {}).EXIF_VIEWER_LANG;
    var lang = GBD.getLang();
    if (bag && bag[key] && (bag[key][lang] || bag[key].en)) return bag[key][lang] || bag[key].en;
    if (bag && bag["exif-" + key] && (bag["exif-" + key][lang] || bag["exif-" + key].en)) {
      return bag["exif-" + key][lang] || bag["exif-" + key].en;
    }
    return key;
  }

  function toast(msg) {
    if (typeof showToast === "function") showToast(msg);
  }

  function ascii(view, offset, len) {
    var out = "";
    for (var i = 0; i < len; i++) {
      var c = view.getUint8(offset + i);
      if (!c) break;
      out += String.fromCharCode(c);
    }
    return out.replace(/\0/g, "").trim();
  }

  function readIFD(view, tiff, ifd, le, into, gps) {
    if (ifd < tiff || ifd + 2 > view.byteLength) return;
    var count = le ? view.getUint16(ifd, true) : view.getUint16(ifd, false);
    if (count > 256) return;
    for (var i = 0; i < count; i++) {
      var e = ifd + 2 + i * 12;
      if (e + 12 > view.byteLength) break;
      var tag = le ? view.getUint16(e, true) : view.getUint16(e, false);
      var type = le ? view.getUint16(e + 2, true) : view.getUint16(e + 2, false);
      var n = le ? view.getUint32(e + 4, true) : view.getUint32(e + 4, false);
      var typeSize = [0, 1, 1, 2, 4, 8, 1, 1, 2, 4, 8, 4, 8][type] || 1;
      var valueOff = e + 8;
      if (n * typeSize > 4) {
        var ptr = le ? view.getUint32(e + 8, true) : view.getUint32(e + 8, false);
        valueOff = tiff + ptr;
      }
      if (tag === 0x8769 || tag === 0x8825) {
        var next = tiff + (le ? view.getUint32(valueOff, true) : view.getUint32(valueOff, false));
        readIFD(view, tiff, next, le, into, tag === 0x8825);
        continue;
      }
      var name = TAGS[tag];
      if (!name) continue;
      if (gps && name.indexOf("GPS") !== 0 && tag < 32) {
        name = TAGS[tag] || name;
      }
      var value = "";
      try {
        if (type === 2) value = ascii(view, valueOff, n);
        else if (type === 3) value = String(le ? view.getUint16(valueOff, true) : view.getUint16(valueOff, false));
        else if (type === 4) value = String(le ? view.getUint32(valueOff, true) : view.getUint32(valueOff, false));
        else if (type === 5) {
          var parts = [];
          for (var r = 0; r < Math.min(n, 3); r++) {
            var num = le ? view.getUint32(valueOff + r * 8, true) : view.getUint32(valueOff + r * 8, false);
            var den = le ? view.getUint32(valueOff + r * 8 + 4, true) : view.getUint32(valueOff + r * 8 + 4, false);
            den = den || 1;
            parts.push(num / den);
          }
          if (name === "GPSLatitude" || name === "GPSLongitude") {
            value = (parts[0] + parts[1] / 60 + parts[2] / 3600).toFixed(6);
          } else if (parts.length === 1) {
            value = parts[0] < 1 && parts[0] > 0 ? ("1/" + Math.round(1 / parts[0])) : String(Math.round(parts[0] * 1000) / 1000);
          } else value = parts.join(", ");
        } else if (type === 1 || type === 7) {
          var bytes = [];
          for (var b = 0; b < Math.min(n, 8); b++) bytes.push(view.getUint8(valueOff + b));
          value = bytes.join(".");
        } else if (type === 10) {
          var sn = le ? view.getInt32(valueOff, true) : view.getInt32(valueOff, false);
          var sd = le ? view.getInt32(valueOff + 4, true) : view.getInt32(valueOff + 4, false);
          value = String(sn / (sd || 1));
        } else {
          value = String(le ? view.getUint32(valueOff, true) : view.getUint32(valueOff, false));
        }
      } catch (_) { continue; }
      if (value) into[name] = value;
    }
  }

  function parseJpegExif(buf) {
    var view = new DataView(buf);
    if (view.byteLength < 4 || view.getUint16(0) !== 0xffd8) return null;
    var offset = 2;
    while (offset < view.byteLength - 4) {
      if (view.getUint8(offset) !== 0xff) break;
      var marker = view.getUint8(offset + 1);
      var size = view.getUint16(offset + 2);
      if (marker === 0xe1) {
        var start = offset + 4;
        if (ascii(view, start, 4) === "Exif") {
          var tiff = start + 6;
          var le = view.getUint16(tiff) === 0x4949;
          var ifd = tiff + (le ? view.getUint32(tiff + 4, true) : view.getUint32(tiff + 4, false));
          var tags = {};
          readIFD(view, tiff, ifd, le, tags, false);
          return tags;
        }
      }
      if (marker === 0xda) break;
      offset += 2 + size;
    }
    return null;
  }

  function parsePng(buf) {
    var view = new DataView(buf);
    if (view.byteLength < 16 || view.getUint32(0) !== 0x89504e47) return null;
    var tags = {};
    var p = 8;
    while (p + 8 < view.byteLength) {
      var len = view.getUint32(p);
      var type = ascii(view, p + 4, 4);
      var d = p + 8;
      if (type === "IHDR") {
        tags.PixelXDimension = String(view.getUint32(d));
        tags.PixelYDimension = String(view.getUint32(d + 4));
      } else if (type === "pHYs") {
        tags.XResolution = String(view.getUint32(d));
        tags.YResolution = String(view.getUint32(d + 4));
      } else if (type === "tEXt") {
        var raw = ascii(view, d, len);
        var z = raw.indexOf("\0");
        if (z > 0) tags[raw.slice(0, z)] = raw.slice(z + 1);
      } else if (type === "IEND") break;
      p += 12 + len;
    }
    return tags;
  }

  function parseWebp(buf) {
    var view = new DataView(buf);
    if (ascii(view, 0, 4) !== "RIFF" || ascii(view, 8, 4) !== "WEBP") return null;
    var p = 12;
    while (p + 8 < view.byteLength) {
      var type = ascii(view, p, 4);
      var size = view.getUint32(p + 4, true);
      if (type === "EXIF") {
        var tiff = p + 8;
        var le = view.getUint16(tiff) === 0x4949;
        var ifd = tiff + (le ? view.getUint32(tiff + 4, true) : view.getUint32(tiff + 4, false));
        var tags = {};
        readIFD(view, tiff, ifd, le, tags, false);
        return tags;
      }
      p += 8 + size + (size % 2);
    }
    return {};
  }

  function parseImage(buf) {
    return parseJpegExif(buf) || parsePng(buf) || parseWebp(buf) || {};
  }

  function groupTags(tags) {
    var camera = {};
    var gps = {};
    var all = {};
    Object.keys(tags).forEach(function (k) {
      all[k] = tags[k];
      if (CAMERA.indexOf(k) !== -1) camera[k] = tags[k];
      if (GPS.indexOf(k) !== -1 || k.indexOf("GPS") === 0) gps[k] = tags[k];
    });
    return { camera: camera, gps: gps, all: all };
  }

  function kvList(obj) {
    var keys = Object.keys(obj);
    if (!keys.length) {
      var p = document.createElement("p");
      p.className = "note";
      p.textContent = "—";
      return p;
    }
    var wrap = document.createElement("div");
    keys.forEach(function (k) {
      var row = document.createElement("div");
      row.className = "kv";
      var kk = document.createElement("div");
      kk.className = "k";
      kk.textContent = L(k);
      var vv = document.createElement("div");
      vv.className = "v";
      vv.textContent = obj[k];
      row.append(kk, vv);
      wrap.appendChild(row);
    });
    return wrap;
  }

  function details(titleKey, obj, open) {
    var d = document.createElement("details");
    d.className = "exif-group";
    if (open) d.open = true;
    var s = document.createElement("summary");
    s.textContent = L(titleKey);
    d.append(s, kvList(obj));
    return d;
  }

  function render() {
    var list = document.getElementById("downloadLinks");
    list.replaceChildren();
    rows.forEach(function (row) {
      var card = document.createElement("article");
      card.className = "exif-card";
      var img = document.createElement("img");
      img.src = row.preview;
      img.alt = "";
      var body = document.createElement("div");
      body.className = "exif-groups";
      var h = document.createElement("h3");
      h.textContent = row.name;
      var groups = groupTags(row.tags);
      body.append(
        h,
        details("camera-info", groups.camera, true),
        details("gps-info", groups.gps, false),
        details("all-info", groups.all, false)
      );
      card.append(img, body);
      list.appendChild(card);
    });
    document.getElementById("downloadAllButton").disabled = !rows.length;
  }

  async function handleFiles(fileList) {
    var files = Array.from(fileList || []).filter(function (f) {
      return /^image\//.test(f.type);
    });
    if (!files.length) {
      toast(L("unsupported") || "Unsupported");
      return;
    }
    for (var i = 0; i < files.length; i++) {
      try {
        var buf = await files[i].arrayBuffer();
        rows.push({
          name: files[i].name,
          preview: URL.createObjectURL(files[i]),
          tags: parseImage(buf),
          size: files[i].size,
          type: files[i].type
        });
        render();
      } catch (err) {
        toast(files[i].name + ": " + (err.message || err));
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var drop = document.getElementById("dropZone");
    var input = document.getElementById("imageInput");
    drop.addEventListener("dragover", function (e) {
      e.preventDefault();
      drop.classList.add("is-over");
    });
    drop.addEventListener("dragleave", function () { drop.classList.remove("is-over"); });
    drop.addEventListener("drop", function (e) {
      e.preventDefault();
      drop.classList.remove("is-over");
      handleFiles(e.dataTransfer.files);
    });
    input.addEventListener("change", function () {
      handleFiles(input.files);
      input.value = "";
    });
    document.getElementById("clearHistoryButton").addEventListener("click", function () {
      rows.forEach(function (r) { URL.revokeObjectURL(r.preview); });
      rows = [];
      render();
    });
    document.getElementById("downloadAllButton").addEventListener("click", function () {
      var payload = rows.map(function (r) {
        return { name: r.name, size: r.size, type: r.type, tags: r.tags };
      });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
      a.download = "exif.json";
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    });
    document.addEventListener("gbd:lang", render);
  });
})();
