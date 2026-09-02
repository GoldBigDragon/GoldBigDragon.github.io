(function (global) {
  "use strict";

  var LEVEL = {
    0: { merge: 0, colors: 0, jpeg: 0.95, webp: 0.92, maxSide: 0, bgTol: 18 },
    1: { merge: 4, colors: 256, jpeg: 0.88, webp: 0.86, maxSide: 0, bgTol: 22 },
    2: { merge: 8, colors: 256, jpeg: 0.82, webp: 0.80, maxSide: 0, bgTol: 30 },
    3: { merge: 12, colors: 128, jpeg: 0.74, webp: 0.72, maxSide: 2560, bgTol: 36 },
    4: { merge: 16, colors: 64, jpeg: 0.64, webp: 0.62, maxSide: 1800, bgTol: 42 },
    5: { merge: 32, colors: 32, jpeg: 0.50, webp: 0.48, maxSide: 1280, bgTol: 50 }
  };

  function clampByte(n) {
    return n < 0 ? 0 : n > 255 ? 255 : n;
  }

  function mergeAdjacent(data, threshold) {
    if (!threshold || threshold <= 1) return;
    var t = threshold;
    for (var i = 0; i < data.length; i += 4) {
      data[i] = clampByte(Math.round(data[i] / t) * t);
      data[i + 1] = clampByte(Math.round(data[i + 1] / t) * t);
      data[i + 2] = clampByte(Math.round(data[i + 2] / t) * t);
    }
  }

  function channelRange(pixels, start, end) {
    var r0 = 255, g0 = 255, b0 = 255, r1 = 0, g1 = 0, b1 = 0;
    for (var i = start; i < end; i++) {
      var p = pixels[i];
      var r = p & 255, g = (p >>> 8) & 255, b = (p >>> 16) & 255;
      if (r < r0) r0 = r;
      if (g < g0) g0 = g;
      if (b < b0) b0 = b;
      if (r > r1) r1 = r;
      if (g > g1) g1 = g;
      if (b > b1) b1 = b;
    }
    var rr = r1 - r0, rg = g1 - g0, rb = b1 - b0;
    var ch = 0;
    if (rg >= rr && rg >= rb) ch = 1;
    else if (rb >= rr && rb >= rg) ch = 2;
    return { ch: ch, range: Math.max(rr, rg, rb) };
  }

  function averageColor(pixels, start, end) {
    var r = 0, g = 0, b = 0, n = end - start || 1;
    for (var i = start; i < end; i++) {
      var p = pixels[i];
      r += p & 255;
      g += (p >>> 8) & 255;
      b += (p >>> 16) & 255;
    }
    return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
  }

  function sortRange(pixels, start, end, ch) {
    var shift = ch * 8;
    var slice = pixels.slice(start, end);
    slice.sort(function (a, c) { return ((a >>> shift) & 255) - ((c >>> shift) & 255); });
    for (var i = 0; i < slice.length; i++) pixels[start + i] = slice[i];
  }

  function buildPalette(data, maxColors) {
    var n = data.length / 4;
    var step = n > 80000 ? Math.ceil(n / 80000) : 1;
    var samples = [];
    for (var i = 0; i < data.length; i += 4 * step) {
      if (data[i + 3] < 8) continue;
      samples.push(data[i] | (data[i + 1] << 8) | (data[i + 2] << 16));
    }
    if (!samples.length) return [[0, 0, 0]];
    var boxes = [{ s: 0, e: samples.length }];
    while (boxes.length < maxColors) {
      var bi = 0, br = -1, ch = 0;
      for (var b = 0; b < boxes.length; b++) {
        var box = boxes[b];
        if (box.e - box.s <= 1) continue;
        var info = channelRange(samples, box.s, box.e);
        if (info.range > br) {
          br = info.range;
          bi = b;
          ch = info.ch;
        }
      }
      if (br <= 0) break;
      var cur = boxes[bi];
      sortRange(samples, cur.s, cur.e, ch);
      var mid = cur.s + ((cur.e - cur.s) >> 1);
      if (mid <= cur.s || mid >= cur.e) break;
      boxes.splice(bi, 1, { s: cur.s, e: mid }, { s: mid, e: cur.e });
    }
    return boxes.map(function (box) { return averageColor(samples, box.s, box.e); });
  }

  function applyPalette(data, palette) {
    var cache = new Int32Array(32768);
    for (var c = 0; c < cache.length; c++) cache[c] = -1;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 8) continue;
      var r = data[i], g = data[i + 1], b = data[i + 2];
      var key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
      var idx = cache[key];
      if (idx < 0) {
        var best = 0, bd = 1e9;
        for (var p = 0; p < palette.length; p++) {
          var pr = palette[p][0] - r;
          var pg = palette[p][1] - g;
          var pb = palette[p][2] - b;
          var d = pr * pr + pg * pg + pb * pb;
          if (d < bd) { bd = d; best = p; }
        }
        idx = best;
        cache[key] = idx;
      }
      data[i] = palette[idx][0];
      data[i + 1] = palette[idx][1];
      data[i + 2] = palette[idx][2];
    }
  }

  function estimateBg(data, w, h) {
    var p = Math.max(1, Math.min(5, (w >> 1), (h >> 1)));
    var counts = Object.create(null);
    function sample(x0, y0) {
      for (var y = y0; y < y0 + p; y++) {
        for (var x = x0; x < x0 + p; x++) {
          var i = (y * w + x) * 4;
          var key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    sample(0, 0);
    sample(w - p, 0);
    sample(0, h - p);
    sample(w - p, h - p);
    var best = 0, color = 0xffffff;
    for (var k in counts) {
      if (counts[k] > best) {
        best = counts[k];
        color = Number(k);
      }
    }
    return [(color >> 16) & 255, (color >> 8) & 255, color & 255];
  }

  function removeBackground(data, w, h, isJpeg, tol) {
    var bg = estimateBg(data, w, h);
    var br = bg[0], bgc = bg[1], bb = bg[2];
    function similar(i) {
      return Math.abs(data[i] - br) <= tol &&
        Math.abs(data[i + 1] - bgc) <= tol &&
        Math.abs(data[i + 2] - bb) <= tol;
    }
    var visited = new Uint8Array(w * h);
    var q = new Int32Array(w * h);
    var qh = 0, qt = 0;
    function seed(x, y) {
      var idx = y * w + x;
      if (similar(idx * 4)) q[qt++] = idx;
    }
    for (var x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); }
    for (var y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }
    while (qh < qt) {
      var idx = q[qh++];
      if (visited[idx] || !similar(idx * 4)) continue;
      visited[idx] = 1;
      var xx = idx % w;
      var yy = (idx / w) | 0;
      if (xx > 0) q[qt++] = idx - 1;
      if (xx < w - 1) q[qt++] = idx + 1;
      if (yy > 0) q[qt++] = idx - w;
      if (yy < h - 1) q[qt++] = idx + w;
    }
    for (var i = 0; i < visited.length; i++) {
      if (!visited[i]) continue;
      var pi = i * 4;
      if (isJpeg) {
        data[pi] = 255;
        data[pi + 1] = 255;
        data[pi + 2] = 255;
        data[pi + 3] = 255;
      } else {
        data[pi + 3] = 0;
      }
    }
  }

  function fitSize(w, h, maxW, maxH) {
    if (!maxW && !maxH) return [w, h];
    maxW = maxW || w;
    maxH = maxH || h;
    if (w <= maxW && h <= maxH) return [w, h];
    var r = Math.min(maxW / w, maxH / h);
    return [Math.max(1, Math.round(w * r)), Math.max(1, Math.round(h * r))];
  }

  function canvasToBlob(canvas, mime, quality) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, mime, quality);
    });
  }

  function pngToIco(pngBuf, w, h) {
    var header = 22;
    var out = new Uint8Array(header + pngBuf.length);
    var view = new DataView(out.buffer);
    view.setUint16(0, 0, true);
    view.setUint16(2, 1, true);
    view.setUint16(4, 1, true);
    out[6] = w >= 256 ? 0 : w;
    out[7] = h >= 256 ? 0 : h;
    out[8] = 0;
    out[9] = 0;
    view.setUint16(10, 1, true);
    view.setUint16(12, 32, true);
    view.setUint32(14, pngBuf.length, true);
    view.setUint32(18, 22, true);
    out.set(pngBuf, 22);
    return new Blob([out], { type: "image/x-icon" });
  }

  async function loadBitmap(file) {
    if (typeof createImageBitmap === "function") {
      try {
        return await createImageBitmap(file, { imageOrientation: "from-image" });
      } catch (_) {
        try { return await createImageBitmap(file); } catch (__) {}
      }
    }
    return new Promise(function (resolve, reject) {
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };
      img.src = url;
    });
  }

  async function compressFile(file, opts) {
    opts = opts || {};
    var format = (opts.format || "png").toLowerCase();
    if (format === "jpg") format = "jpeg";
    var level = LEVEL[opts.level] || LEVEL[0];
    var bitmap = await loadBitmap(file);
    var srcW = bitmap.width;
    var srcH = bitmap.height;
    var w, h;
    if (opts.sizeMode === "absolute") {
      w = Math.max(1, parseInt(opts.width, 10) || srcW);
      h = Math.max(1, parseInt(opts.height, 10) || srcH);
    } else {
      var pct = Math.max(1, Math.min(100, Number(opts.percent) || 100)) / 100;
      w = Math.max(1, Math.round(srcW * pct));
      h = Math.max(1, Math.round(srcH * pct));
    }
    if (format === "ico") {
      var fitted = fitSize(w, h, 256, 256);
      w = fitted[0];
      h = fitted[1];
    } else if (level.maxSide) {
      var capped = fitSize(w, h, level.maxSide, level.maxSide);
      w = capped[0];
      h = capped[1];
    }

    var canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext("2d", { alpha: true, willReadFrequently: true });
    var isJpeg = format === "jpeg";
    if (isJpeg) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    if (bitmap.close) try { bitmap.close(); } catch (_) {}

    var imageData = ctx.getImageData(0, 0, w, h);
    var data = imageData.data;

    if (opts.removeBg) removeBackground(data, w, h, isJpeg, level.bgTol);
    if (opts.level > 0 && level.merge) mergeAdjacent(data, level.merge);
    if (opts.level > 0 && level.colors) {
      var palette = buildPalette(data, level.colors);
      applyPalette(data, palette);
    }
    ctx.putImageData(imageData, 0, 0);

    var blob;
    if (format === "ico") {
      var png = await canvasToBlob(canvas, "image/png");
      blob = pngToIco(new Uint8Array(await png.arrayBuffer()), w, h);
    } else if (format === "jpeg") {
      blob = await canvasToBlob(canvas, "image/jpeg", level.jpeg);
    } else if (format === "webp") {
      blob = await canvasToBlob(canvas, "image/webp", level.webp);
    } else {
      blob = await canvasToBlob(canvas, "image/png");
    }

    var ext = format === "jpeg" ? "jpg" : format;
    var base = file.name.replace(/\.[^/.]+$/, "");
    var name = base + "." + ext;
    var skipped = false;
    var sameFamily = (file.type === "image/" + format) ||
      (format === "jpeg" && (file.type === "image/jpeg" || file.type === "image/jpg")) ||
      (format === "ico" && (file.type === "image/x-icon" || file.type === "image/vnd.microsoft.icon"));
    if (opts.skipIfLarger !== false && sameFamily && blob && blob.size >= file.size) {
      blob = file;
      name = file.name;
      skipped = true;
    }
    return {
      blob: blob,
      name: name,
      original: file.size,
      result: blob.size,
      skipped: skipped,
      width: w,
      height: h
    };
  }

  var CRC_TABLE = (function () {
    var t = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(buf) {
    var crc = 0xffffffff;
    for (var i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 255] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function zipStore(files) {
    var encoder = new TextEncoder();
    var locals = [];
    var centrals = [];
    var offset = 0;
    files.forEach(function (f) {
      var name = encoder.encode(f.name);
      var data = f.data;
      var crc = crc32(data);
      var local = new Uint8Array(30 + name.length + data.length);
      var lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true);
      lv.setUint16(4, 20, true);
      lv.setUint16(8, 0, true);
      lv.setUint16(10, 0, true);
      lv.setUint32(14, crc, true);
      lv.setUint32(18, data.length, true);
      lv.setUint32(22, data.length, true);
      lv.setUint16(26, name.length, true);
      local.set(name, 30);
      local.set(data, 30 + name.length);
      var central = new Uint8Array(46 + name.length);
      var cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true);
      cv.setUint16(4, 20, true);
      cv.setUint16(6, 20, true);
      cv.setUint32(16, crc, true);
      cv.setUint32(20, data.length, true);
      cv.setUint32(24, data.length, true);
      cv.setUint16(28, name.length, true);
      cv.setUint32(42, offset, true);
      central.set(name, 46);
      locals.push(local);
      centrals.push(central);
      offset += local.length;
    });
    var centralSize = centrals.reduce(function (s, a) { return s + a.length; }, 0);
    var end = new Uint8Array(22);
    var ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true);
    ev.setUint16(8, files.length, true);
    ev.setUint16(10, files.length, true);
    ev.setUint32(12, centralSize, true);
    ev.setUint32(16, offset, true);
    var total = offset + centralSize + 22;
    var out = new Uint8Array(total);
    var p = 0;
    locals.forEach(function (b) { out.set(b, p); p += b.length; });
    centrals.forEach(function (b) { out.set(b, p); p += b.length; });
    out.set(end, p);
    return new Blob([out], { type: "application/zip" });
  }

  global.GBDCompress = {
    LEVEL: LEVEL,
    compressFile: compressFile,
    zipStore: zipStore
  };
})(window);
