(function () {
  "use strict";

  const MUSIC_LIST = [];
  let queue = [];
  let cursor = -1;
  let audio = null;
  let raf = null;
  let tab = "playlist";
  let playGen = 0;

  function flatten() {
    MUSIC_LIST.length = 0;
    PLAY_LIST.forEach((pl, pi) => {
      (pl.music || []).forEach((track) => {
        MUSIC_LIST.push({
          ...track,
          playlistIndex: pi,
          playlistTitle: pl.title
        });
      });
    });
  }

  function toolUrl(name) {
    const row = typeof CREATED_WITH !== "undefined" ? CREATED_WITH[name] : null;
    if (!row) return null;
    return row.profile || row.url || null;
  }

  function stop() {
    playGen += 1;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
    if (audio) {
      audio.pause();
      audio = null;
    }
    document.getElementById("progress").style.width = "0%";
    document.getElementById("curTime").textContent = "0:00";
    document.getElementById("durTime").textContent = "0:00";
    document.getElementById("playBtn").innerHTML = GBD.ICON.play;
    document.querySelectorAll(".item-card.is-playing").forEach((el) => el.classList.remove("is-playing"));
  }

  function fmt(sec) {
    if (!isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function currentTrack() {
    return cursor >= 0 && queue[cursor] ? queue[cursor] : null;
  }

  function trackKey(track) {
    return (track && (track.mp3 || track.title && track.title.en)) || "";
  }

  function paintPlaying() {
    const key = trackKey(currentTrack());
    document.querySelectorAll(".item-card[data-track]").forEach((el) => {
      el.classList.toggle("is-playing", Boolean(key) && el.dataset.track === key);
    });
  }

  function updateProgress() {
    if (!audio) return;
    const dur = audio.duration;
    if (dur && isFinite(dur) && dur > 0) {
      document.getElementById("progress").style.width = (audio.currentTime / dur) * 100 + "%";
      document.getElementById("curTime").textContent = fmt(audio.currentTime);
      document.getElementById("durTime").textContent = fmt(dur);
    } else {
      const track = currentTrack();
      if (track && track.duration) {
        document.getElementById("durTime").textContent = fmt(track.duration);
      }
    }
  }

  function tick() {
    raf = null;
    if (!audio) return;
    updateProgress();
    if (!audio.paused && !audio.ended) raf = requestAnimationFrame(tick);
  }

  function startTicker() {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(tick);
  }

  function playAt(index) {
    if (!queue.length) return;
    cursor = ((index % queue.length) + queue.length) % queue.length;
    const track = queue[cursor];
    stop();
    const gen = playGen;
    audio = new Audio(track.mp3);
    audio.addEventListener("loadedmetadata", () => {
      if (gen !== playGen) return;
      updateProgress();
    });
    audio.addEventListener("playing", () => {
      if (gen !== playGen) return;
      startTicker();
    });
    audio.addEventListener("ended", () => {
      if (gen !== playGen) return;
      playAt(cursor + 1);
    });
    document.getElementById("playerArt").src = track.image || "";
    document.getElementById("playerTitle").textContent = GBD.pick(track.title);
    document.getElementById("playBtn").innerHTML = GBD.ICON.pause;
    paintPlaying();
    const started = audio.play();
    if (started && typeof started.then === "function") {
      started.then(startTicker).catch(() => {
        document.getElementById("playBtn").innerHTML = GBD.ICON.play;
      });
    } else {
      startTicker();
    }
  }

  function toggle() {
    if (!audio) {
      if (queue.length) playAt(Math.max(0, cursor));
      return;
    }
    if (audio.paused) {
      const started = audio.play();
      document.getElementById("playBtn").innerHTML = GBD.ICON.pause;
      if (started && typeof started.then === "function") started.then(startTicker);
      else startTicker();
    } else {
      audio.pause();
      document.getElementById("playBtn").innerHTML = GBD.ICON.play;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      updateProgress();
    }
  }

  function seek(e) {
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
    updateProgress();
  }

  function renderPlaylists(filter) {
    const area = document.getElementById("catalog");
    area.replaceChildren();
    const q = (filter || "").toLowerCase();
    const list = PLAY_LIST.filter((pl) => {
      if (!q) return true;
      return GBD.pick(pl.title).toLowerCase().includes(q) || (pl.tag || []).some((t) => t.toLowerCase().includes(q));
    });
    if (!list.length) {
      area.innerHTML = `<p class="empty">${GBD.escapeHtml(GBD.t("empty"))}</p>`;
      return;
    }
    list.forEach((pl) => {
      const card = document.createElement("article");
      card.className = "item-card";
      const img = document.createElement("img");
      img.src = pl.image;
      img.alt = GBD.pick(pl.title);
      img.loading = "lazy";
      const body = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = GBD.pick(pl.title);
      const p = document.createElement("p");
      p.textContent = GBD.pick(pl.description);
      const actions = document.createElement("div");
      actions.className = "actions";
      const play = document.createElement("button");
      play.type = "button";
      play.className = "chip primary";
      play.textContent = GBD.t("play");
      play.addEventListener("click", () => {
        queue = MUSIC_LIST.filter((t) => t.playlistIndex === PLAY_LIST.indexOf(pl));
        playAt(0);
      });
      actions.appendChild(play);
      const tags = document.createElement("div");
      tags.className = "tags";
      (pl.tag || []).forEach((tag) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tag";
        b.textContent = tag;
        b.addEventListener("click", () => {
          document.getElementById("searchInput").value = tag;
          run();
        });
        tags.appendChild(b);
      });
      body.append(h, p, actions, tags);
      card.append(img, body);
      area.appendChild(card);
    });
  }

  function openDetails(track) {
    const modal = document.getElementById("modal");
    document.getElementById("modalTitle").textContent = GBD.pick(track.title);
    const body = document.getElementById("modalBody");
    const box = document.createElement("div");
    box.className = "detail";
    if (track.image) {
      const img = document.createElement("img");
      img.className = "detail-logo";
      img.src = track.image;
      img.alt = GBD.pick(track.title);
      box.appendChild(img);
    }
    const add = (k, v, link) => {
      if (!v) return;
      const row = document.createElement("div");
      row.className = "kv";
      row.innerHTML = `<div class="k">${GBD.escapeHtml(k)}</div>`;
      const val = document.createElement("div");
      val.className = "v";
      if (link) {
        const a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = v;
        val.appendChild(a);
      } else if (k === GBD.t("lyrics")) {
        val.innerHTML = GBD.safeHtml(v);
      } else val.textContent = v;
      row.appendChild(val);
      box.appendChild(row);
    };
    add(GBD.t("nameField"), GBD.pick(track.title));
    add(GBD.t("playlist"), GBD.pick(track.playlistTitle));
    add(GBD.t("composedAt"), track["composed-at"]);
    add(GBD.t("composedWith"), track["composed-with"], toolUrl(track["composed-with"]));
    add(GBD.t("instrumentation"), track.instrumentation);
    add(GBD.t("key"), track.key);
    add(GBD.t("tempo"), track.tempo);
    add(GBD.t("meter"), track.meter);
    add(GBD.t("duration"), (track.duration || 0) + "s");
    add(GBD.t("tag"), (track.tag || []).join(", "));
    if (track.lyrics) add(GBD.t("lyrics"), GBD.pick(track.lyrics));
    const dl = document.createElement("div");
    dl.className = "actions";
    [["mp3", "MP3"], ["wav", "WAV"], ["midi", "MIDI"], ["stem", "STEM"]].forEach(([key, label]) => {
      if (!track[key]) return;
      const a = document.createElement("a");
      a.className = "chip primary";
      a.href = track[key];
      a.textContent = label;
      a.setAttribute("download", "");
      dl.appendChild(a);
    });
    box.appendChild(dl);
    body.replaceChildren(box);
    modal.hidden = false;
  }

  function renderTracks(filter, field) {
    const area = document.getElementById("catalog");
    area.replaceChildren();
    const q = (filter || "").toLowerCase();
    const list = MUSIC_LIST.filter((track) => {
      if (!q) return true;
      if (field === "tag") return (track.tag || []).some((t) => t.toLowerCase().includes(q));
      if (field === "playlist") return GBD.pick(track.playlistTitle).toLowerCase().includes(q);
      if (field === "composed-with") return String(track["composed-with"] || "").toLowerCase().includes(q);
      return GBD.pick(track.title).toLowerCase().includes(q);
    });
    if (!list.length) {
      area.innerHTML = `<p class="empty">${GBD.escapeHtml(GBD.t("empty"))}</p>`;
      return;
    }
    list.forEach((track) => {
      const card = document.createElement("article");
      card.className = "item-card";
      card.dataset.track = trackKey(track);
      const img = document.createElement("img");
      img.src = track.image;
      img.alt = GBD.pick(track.title);
      img.loading = "lazy";
      const body = document.createElement("div");
      const h = document.createElement("h3");
      h.textContent = GBD.pick(track.title);
      const p = document.createElement("p");
      p.textContent = `${GBD.pick(track.playlistTitle)} · ${fmt(track.duration)}`;
      const actions = document.createElement("div");
      actions.className = "actions";
      const play = document.createElement("button");
      play.type = "button";
      play.className = "chip primary";
      play.textContent = GBD.t("play");
      play.addEventListener("click", () => {
        queue = list;
        playAt(list.indexOf(track));
      });
      const info = document.createElement("button");
      info.type = "button";
      info.className = "chip";
      info.textContent = GBD.t("details");
      info.addEventListener("click", () => openDetails(track));
      actions.append(play, info);
      const tags = document.createElement("div");
      tags.className = "tags";
      (track.tag || []).slice(0, 6).forEach((tag) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "tag";
        b.textContent = tag;
        b.addEventListener("click", () => {
          document.getElementById("searchField").value = "tag";
          document.getElementById("searchInput").value = tag;
          run();
        });
        tags.appendChild(b);
      });
      body.append(h, p, actions, tags);
      card.append(img, body);
      area.appendChild(card);
    });
  }

  function run(e) {
    if (e) e.preventDefault();
    const q = document.getElementById("searchInput").value.trim();
    const field = document.getElementById("searchField").value;
    if (tab === "playlist") renderPlaylists(q);
    else renderTracks(q, field);
    paintPlaying();
  }

  function setTab(next) {
    tab = next;
    document.getElementById("tabPlaylist").setAttribute("aria-selected", next === "playlist" ? "true" : "false");
    document.getElementById("tabTracks").setAttribute("aria-selected", next === "music" ? "true" : "false");
    const field = document.getElementById("searchField");
    field.hidden = next === "playlist";
    run();
  }

  document.addEventListener("DOMContentLoaded", () => {
    flatten();
    document.getElementById("tabPlaylist").addEventListener("click", () => setTab("playlist"));
    document.getElementById("tabTracks").addEventListener("click", () => setTab("music"));
    document.getElementById("searchForm").addEventListener("submit", run);
    document.getElementById("playBtn").addEventListener("click", toggle);
    document.getElementById("prevBtn").addEventListener("click", () => playAt(cursor - 1));
    document.getElementById("nextBtn").addEventListener("click", () => playAt(cursor + 1));
    document.getElementById("timeline").addEventListener("click", seek);
    document.getElementById("modalClose").addEventListener("click", () => {
      document.getElementById("modal").hidden = true;
    });
    document.getElementById("modalBackdrop").addEventListener("click", () => {
      document.getElementById("modal").hidden = true;
    });
    setTab("playlist");
    document.addEventListener("gbd:lang", () => {
      run();
      const track = currentTrack();
      if (track) document.getElementById("playerTitle").textContent = GBD.pick(track.title);
    });
  });
})();
