let NOW_PLAY_LIST_SIZE = 0;
let NOW_PLAY_PLAYLIST_TITLE = null;
let NOW_PLAY_MUSIC_TITLE = null;
let NOW_PLAY_INDEX = -1;
let MUSIC_SEARCH_RESULT = [];

let audio = null;

function stopMusic(){
	// 프로그레스 업데이트 중지
	stopProgressUpdate();

	if(audio != null){
		audio.pause();
		audio = null;
	}
	const playerImage = document.getElementById("player-music-image");
	playerImage.src = "/resources/img/music/none.png";
	const playButton = document.getElementById("player-music-play-button");
	playButton.innerHTML = "<i class='fa-solid fa-play'></i>";
	const playButton2 = document.getElementById("player-music-play-button2");
	playButton2.className = "fa-solid fa-play control-button";
	const musicTitle = document.getElementById("player-music-title");
	musicTitle.textContent = " ";
	const progressBar = document.getElementById("progress");
	progressBar.style.width = "0%";
	const currentTime = document.getElementById("current-time");
	currentTime.innerText = "0:00";
	const duration = document.getElementById("duration");
	duration.innerText = "0:00";

	const elementPlayingArray = document.getElementsByClassName("music-element-playing");
	let playingArrayIndex = 0;
	for(playingArrayIndex = 0; playingArrayIndex < elementPlayingArray.length; playingArrayIndex ++) {
		elementPlayingArray[playingArrayIndex].className = "row music-element";
	}
}

function initPlaylist() {
	stopMusic();
	NOW_PLAY_PLAYLIST_TITLE = null;
	NOW_PLAY_MUSIC_TITLE = null;
	NOW_PLAY_INDEX = -1;
	NOW_PLAY_LIST_SIZE = 0;
	MUSIC_SEARCH_RESULT.length = 0;
}

function playMusic(){
	if(NOW_PLAY_INDEX > -1) {
		stopMusic();
		let musicIndex = 0;
		if(NOW_PLAY_PLAYLIST_TITLE != null) {
			let searchIndex = 0;
			for(musicIndex = 0; musicIndex < MUSIC_LIST.length; musicIndex ++) {
				if(MUSIC_LIST[musicIndex]["playlist-title-en"] == NOW_PLAY_PLAYLIST_TITLE){
					if(NOW_PLAY_INDEX == searchIndex) {
						 break;
					}
					searchIndex = searchIndex + 1;
				}
			}
		} else {
			if(MUSIC_SEARCH_RESULT.length > 0) {
				if(MUSIC_SEARCH_RESULT.length <= NOW_PLAY_INDEX) {
					initPlaylist();
					return;
				} else {
					musicIndex = MUSIC_SEARCH_RESULT[NOW_PLAY_INDEX];
				}
			} else {
				musicIndex = NOW_PLAY_INDEX;
			}
		}
		audio = new Audio(MUSIC_LIST[musicIndex]["mp3"]);
		// audio.volume = 1;
		audio.setAttribute("onLoadeddata", "setDuration()");
		audio.setAttribute("onended", "jumpMusic(true)");
		const playerImage = document.getElementById("player-music-image");
		playerImage.src = MUSIC_LIST[musicIndex]["image"];
		const playButton = document.getElementById("player-music-play-button");
		const playButton2 = document.getElementById("player-music-play-button2");
		if (audio.paused) {
			playButton.innerHTML = "<i class='fa-solid fa-pause'></i>";
			playButton2.className = "fa-solid fa-pause control-button";
			audio.play();
			// 프로그레스 업데이트 시작
			startProgressUpdate();
		} else {
			playButton.innerHTML = "<i class='fa-solid fa-play'></i>";
			playButton2.className = "fa-solid fa-play control-button";
		}
		const musicTitle = document.getElementById("player-music-title");
		// XSS 방지: textContent 사용
		musicTitle.textContent = MUSIC_LIST[musicIndex]["title"][NOW_LANG];
		LANGUAGE_OBJECT["MUSIC_LANG"]["NOW-PLAYING-MUSIC"] = MUSIC_LIST[musicIndex]["title"];
		NOW_PLAY_MUSIC_TITLE = MUSIC_LIST[musicIndex]['title']['en'];
		if(NOW_PLAY_PLAYLIST_TITLE != null){
			const targetPane = document.getElementById(NOW_PLAY_PLAYLIST_TITLE);
			if(targetPane != null){
				targetPane.className = "row music-element-playing";
			}
		}
		if(NOW_PLAY_MUSIC_TITLE != null){
			const targetPane = document.getElementById(NOW_PLAY_MUSIC_TITLE);
			if(targetPane != null){
				targetPane.className = "row music-element-playing";
			}
		}
	} else {
		initPlaylist();
	}
}

function prevMusic(){
	jumpMusic(false);
}

function nextMusic(){
	jumpMusic(true);
}

function jumpMusic(isNext){
	if(isNext){
		NOW_PLAY_INDEX = NOW_PLAY_INDEX + 1;
	} else {
		NOW_PLAY_INDEX = NOW_PLAY_INDEX - 1;
	}
	if(NOW_PLAY_INDEX < 0 || NOW_PLAY_INDEX >= MUSIC_LIST.length || NOW_PLAY_INDEX >= NOW_PLAY_LIST_SIZE) {
		initPlaylist();
		return;
	} else {
		playMusic();
	}
}

function setDuration(){
	const duration = document.getElementById("duration");
	duration.innerText = getTimeCodeFromNum(audio.duration);
}

function setPlayListAll(playlistTitle){
	initPlaylist();
	NOW_PLAY_PLAYLIST_TITLE = playlistTitle;
	for(index = 0; index < MUSIC_LIST.length; index ++) {
		if(MUSIC_LIST[index]["playlist-title-en"] == playlistTitle){
			NOW_PLAY_LIST_SIZE = NOW_PLAY_LIST_SIZE + 1;
		}
	}
	NOW_PLAY_INDEX = 0;
	playMusic();
}

function setPlayList(musicTitle){
	initPlaylist();
	NOW_PLAY_PLAYLIST_TITLE = null;
	NOW_PLAY_MUSIC_TITLE = musicTitle;
	if(MUSIC_SEARCH_RESULT.length > 0) {
		NOW_PLAY_LIST_SIZE = MUSIC_SEARCH_RESULT.length;
		NOW_PLAY_INDEX = 0;
		for(let musicIndex = 0; musicIndex < MUSIC_SEARCH_RESULT.length; musicIndex ++) {
			if(MUSIC_LIST[MUSIC_SEARCH_RESULT[musicIndex]]["title"]["en"] == musicTitle) {
				NOW_PLAY_INDEX = MUSIC_SEARCH_RESULT[musicIndex];
				break;
			}
		}
	} else{
		for(let musicIndex = 0; musicIndex < MUSIC_LIST.length; musicIndex ++) {
			if(MUSIC_LIST[musicIndex]["title"]["en"] == musicTitle){
				NOW_PLAY_INDEX = musicIndex;
				break;
			}
		}
		NOW_PLAY_LIST_SIZE = MUSIC_LIST.length;
	}
	playMusic();
}

function addMusic(musicArea, musicData, index){
	const playlistElement = document.createElement("div");
	playlistElement.id = musicData["title"]["en"];
	
	const imagePane = document.createElement("div");
	imagePane.className = "col-3 music-image-pane";
	const musicImage = document.createElement("img");
	musicImage.className = "music-image";
	musicImage.src = musicData["image"];
	// 성능 최적화: 이미지 lazy loading 적용
	musicImage.loading = "lazy";
	const playButton = document.createElement("div");
	playButton.className = "play-button";
	// XSS 방지: onClick 속성 대신 addEventListener 사용
	playButton.addEventListener('click', function() {
		setPlayList(musicData["title"]["en"]);
	});
	const buttonIcon = document.createElement("i");
	buttonIcon.className = "fa-solid fa-eject";
	playButton.appendChild(buttonIcon);
	imagePane.appendChild(musicImage);
	imagePane.appendChild(playButton);
	if(NOW_PLAY_MUSIC_TITLE == musicData["title"]["en"]) {
		playlistElement.className = "row music-element-playing";
	} else {
		playlistElement.className = "row music-element";
	}
	playlistElement.appendChild(imagePane);
	
	const titlePane = document.createElement("div");
	titlePane.className = "col music-title-pane";
	const title = document.createElement("div");
	title.className = "row music-title lang";
	// XSS 방지: textContent 사용
	title.textContent = musicData["title"][NOW_LANG];
	// XSS 방지: addEventListener 사용
	title.addEventListener('click', function() {
		showDetails(musicData["title"]['en']);
	});

	LANGUAGE_OBJECT["MUSIC_LANG"][musicData["title"]["en"]+"-title"] = musicData["title"];
	title.setAttribute("data-lang-var", "MUSIC_LANG");
	title.setAttribute("data-lang", musicData["title"]["en"]+"-title");
	
	
	/* Add download button here
		"created-at": "2024-04-17",
		"created-with": "udio",
		"instrumentation": "rock",
		"key": "unknown",
		"tempo": "unknown",
		"meter": "unknown",
		"duration": 196,
		"mp3": "/resources/files/music/Forging more than just swords, but a legacy wide.mp3",
	*/
	
	const tags = document.createElement("div");
	tags.className = "row align-left";
	for(index2 = 0; index2 < musicData["tag"].length; index2 ++) {
		const tag = document.createElement("div");
		tag.className = "tag";
		tag.textContent = musicData["tag"][index2];
		// XSS 방지: addEventListener 사용
		(function(tagValue) {
			tag.addEventListener('click', function() {
				setSearchMusicTagValue(tagValue);
			});
		})(musicData["tag"][index2]);
		tags.appendChild(tag);
	}
	
	titlePane.appendChild(title);
	titlePane.appendChild(tags);
	
	playlistElement.appendChild(titlePane);
	
	musicArea.appendChild(playlistElement);
}

function setSearchMusicTagValue(tag){
	const category = document.getElementById("search-music-category");
	category.children[1].selected = true;
	document.getElementById("search-music-input").value = tag;
	searchMusic();
}

function searchMusicEnter(){
	if (window.event.keyCode == 13) {
		searchMusic();
	}
}

function searchMusic(){
	MUSIC_SEARCH_RESULT.length = 0;
	const category = document.getElementById("search-music-category").value;
	const value = document.getElementById("search-music-input").value.toLowerCase();
	const musicArea = document.getElementById("musicArea");
	const loadingIndicator = document.getElementById("loading-indicator");
	const resultsStatus = document.getElementById("search-results-status");

	musicArea.innerHTML = "";

	// 접근성: 로딩 상태 표시
	if (loadingIndicator) {
		loadingIndicator.removeAttribute("hidden");
	}

	// 성능 최적화: DocumentFragment 사용하여 DOM 조작 최소화
	const fragment = document.createDocumentFragment();

	// 비동기로 처리하여 UI가 멈추지 않도록 함
	setTimeout(() => {
		let resultCount = 0;

		if(value == null || value.length < 1){
			let index = 0;
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				addMusic(fragment, MUSIC_LIST[index], index);
				resultCount++;
			}
		} else {
			let index = 0;
			if(category == "title") {
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["title"][NOW_LANG].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "tag"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["tag"].includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "playlist"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["playlist-title-en"].toLowerCase().includes(value) ||
					MUSIC_LIST[index]["playlist-title-kr"].toLowerCase().includes(value) ||
					MUSIC_LIST[index]["playlist-title-jp"].toLowerCase().includes(value) ||
					MUSIC_LIST[index]["playlist-title-cn"].toLowerCase().includes(value) ||
					MUSIC_LIST[index]["playlist-title-ru"].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "instrumentation"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["instrumentation"].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "key"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["key"].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "tempo"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["tempo"].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "meter"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["meter"].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "duration"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["duration"]/60 == value/60){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			} else if(category == "created-with"){
				for(index = 0; index < MUSIC_LIST.length; index ++) {
					if(MUSIC_LIST[index]["created-with"].toLowerCase().includes(value)){
						addMusic(fragment, MUSIC_LIST[index], index);
						MUSIC_SEARCH_RESULT.push(index);
						resultCount++;
					}
				}
			}
		}

		// 한 번에 DOM에 추가하여 reflow 최소화
		musicArea.appendChild(fragment);

		// 접근성: 로딩 상태 숨기기
		if (loadingIndicator) {
			loadingIndicator.setAttribute("hidden", "true");
		}

		// 접근성: 검색 결과 개수 알림
		if (resultsStatus) {
			resultsStatus.textContent = `Found ${resultCount} music ${resultCount === 1 ? 'track' : 'tracks'}`;
		}
	}, 100); // 100ms 지연으로 UI 블로킹 방지
}

function setSearchMusicPlaylistValue(playlistName){
	const activeTab = document.getElementById("music-tab");
	activeTab.className = "col tab-selected lang";
	const inactiveTab = document.getElementById("playlist-tab");
	inactiveTab.className = "col tab lang";
	const activePane = document.getElementById("music-pane");
	activePane.removeAttribute("hidden");
	const inactivePane = document.getElementById("playlist-pane");
	inactivePane.setAttribute("hidden", "true");
	searchMusic();
	
	const category = document.getElementById("search-music-category");
	category.children[2].selected = true;
	document.getElementById("search-music-input").value = playlistName;
	searchMusic();
}

function setSearchPlaylistTagValue(tag){
	const category = document.getElementById("search-playlist-category");
	category.children[1].selected = true;
	document.getElementById("search-playlist-input").value = tag;
	searchPlaylist();
}

function addPlaylist(musicArea, playlistData, index){
	const playlistElement = document.createElement("div");
	playlistElement.id = playlistData["title"]["en"];
	
	const imagePane = document.createElement("div");
	imagePane.className = "col-3 music-image-pane";
	const musicImage = document.createElement("img");
	musicImage.className = "music-image";
	musicImage.src = playlistData["image"];
	// 성능 최적화: 이미지 lazy loading 적용
	musicImage.loading = "lazy";
	const playButton = document.createElement("div");
	playButton.className = "play-button";
	// XSS 방지: addEventListener 사용
	playButton.addEventListener('click', function() {
		setPlayListAll(playlistData["title"]["en"]);
	});
	const buttonIcon = document.createElement("i");
	buttonIcon.className = "fa-solid fa-eject";
	playButton.appendChild(buttonIcon);
	imagePane.appendChild(musicImage);
	imagePane.appendChild(playButton);
	if(NOW_PLAY_PLAYLIST_TITLE == playlistData["title"]["en"]) {
		playlistElement.className = "row music-element-playing";
	} else {
		playlistElement.className = "row music-element";
	}
	playlistElement.appendChild(imagePane);
	
	const titlePane = document.createElement("div");
	titlePane.className = "col music-title-pane";
	const title = document.createElement("div");
	title.className = "row music-title lang";
	// XSS 방지: textContent 사용
	title.textContent = playlistData["title"][NOW_LANG];
	// XSS 방지: addEventListener 사용
	title.addEventListener('click', function() {
		setSearchMusicPlaylistValue(playlistData["title"][NOW_LANG]);
	});

	LANGUAGE_OBJECT["MUSIC_LANG"][playlistData["title"]["en"]+"-title"] = playlistData["title"];
	title.setAttribute("data-lang-var", "MUSIC_LANG");
	title.setAttribute("data-lang", playlistData["title"]["en"]+"-title");
	const description = document.createElement("div");
	description.className = "row music-description lang";
	// XSS 방지: textContent 사용
	description.textContent = playlistData["description"][NOW_LANG];
	LANGUAGE_OBJECT["MUSIC_LANG"][playlistData["description"]["en"]+"-description"] = playlistData["description"];
	description.setAttribute("data-lang-var", "MUSIC_LANG");
	description.setAttribute("data-lang", playlistData["description"]["en"]+"-description");

	const tags = document.createElement("div");
	tags.className = "row align-left";
	for(index2 = 0; index2 < playlistData["tag"].length; index2 ++) {
		const tag = document.createElement("div");
		tag.className = "tag";
		tag.textContent = playlistData["tag"][index2];
		// XSS 방지: addEventListener 사용
		(function(tagValue) {
			tag.addEventListener('click', function() {
				setSearchPlaylistTagValue(tagValue);
			});
		})(playlistData["tag"][index2]);
		tags.appendChild(tag);
	}
	
	titlePane.appendChild(title);
	titlePane.appendChild(description);
	titlePane.appendChild(tags);
	
	playlistElement.appendChild(titlePane);
	
	musicArea.appendChild(playlistElement);
}

function searchPlaylistEnter(){
	if (window.event.keyCode == 13) {
		searchPlaylist();
	}
}

function searchPlaylist(){
	const category = document.getElementById("search-playlist-category").value;
	const value = document.getElementById("search-playlist-input").value.toLowerCase();
	const musicArea = document.getElementById("musicArea");
	const loadingIndicator = document.getElementById("loading-indicator");
	const resultsStatus = document.getElementById("search-results-status");

	musicArea.innerHTML = "";

	// 접근성: 로딩 상태 표시
	if (loadingIndicator) {
		loadingIndicator.removeAttribute("hidden");
	}

	// 성능 최적화: DocumentFragment 사용하여 DOM 조작 최소화
	const fragment = document.createDocumentFragment();

	// 비동기로 처리하여 UI가 멈추지 않도록 함
	setTimeout(() => {
		let resultCount = 0;

		if(value == null || value.length < 1){
			let index = 0;
			for(index = 0; index < PLAY_LIST.length; index ++) {
				addPlaylist(fragment, PLAY_LIST[index], index);
				resultCount++;
			}
		} else {
			let index = 0;
			if(category == "title") {
				for(index = 0; index < PLAY_LIST.length; index ++) {
					if(PLAY_LIST[index]["title"][NOW_LANG].toLowerCase().includes(value)){
						addPlaylist(fragment, PLAY_LIST[index], index);
						resultCount++;
					}
				}
			} else if(category == "tag"){
				for(index = 0; index < PLAY_LIST.length; index ++) {
					if(PLAY_LIST[index]["tag"].includes(value)){
						addPlaylist(fragment, PLAY_LIST[index], index);
						resultCount++;
					}
				}
			}
		}

		// 한 번에 DOM에 추가하여 reflow 최소화
		musicArea.appendChild(fragment);

		// 접근성: 로딩 상태 숨기기
		if (loadingIndicator) {
			loadingIndicator.setAttribute("hidden", "true");
		}

		// 접근성: 검색 결과 개수 알림
		if (resultsStatus) {
			resultsStatus.textContent = `Found ${resultCount} ${resultCount === 1 ? 'playlist' : 'playlists'}`;
		}
	}, 100); // 100ms 지연으로 UI 블로킹 방지
}

function showPlaylist(){
	MUSIC_SEARCH_RESULT.length = 0;
	const activeTab = document.getElementById("playlist-tab");
	activeTab.className = "col tab-selected lang";
	// 접근성: ARIA 속성 업데이트
	activeTab.setAttribute("aria-selected", "true");
	activeTab.setAttribute("tabindex", "0");

	const inactiveTab = document.getElementById("music-tab");
	inactiveTab.className = "col tab lang";
	inactiveTab.setAttribute("aria-selected", "false");
	inactiveTab.setAttribute("tabindex", "-1");

	const activePane = document.getElementById("playlist-pane");
	activePane.removeAttribute("hidden");
	const inactivePane = document.getElementById("music-pane");
	inactivePane.setAttribute("hidden", "true");
	searchPlaylist();
}

function showMusic(){
	MUSIC_SEARCH_RESULT.length = 0;
	const activeTab = document.getElementById("music-tab");
	activeTab.className = "col tab-selected lang";
	// 접근성: ARIA 속성 업데이트
	activeTab.setAttribute("aria-selected", "true");
	activeTab.setAttribute("tabindex", "0");

	const inactiveTab = document.getElementById("playlist-tab");
	inactiveTab.className = "col tab lang";
	inactiveTab.setAttribute("aria-selected", "false");
	inactiveTab.setAttribute("tabindex", "-1");

	const activePane = document.getElementById("music-pane");
	activePane.removeAttribute("hidden");
	const inactivePane = document.getElementById("playlist-pane");
	inactivePane.setAttribute("hidden", "true");
	searchMusic();
}

const MUSIC_LIST = [];

for(index = 0; index < PLAY_LIST.length; index ++) {
	for(index2 = 0; index2 < PLAY_LIST[index]["music"].length; index2 ++) {
		const targetMusic = PLAY_LIST[index]["music"][index2];
		targetMusic["playlist-index"] = index;
		targetMusic["playlist-title-en"] = PLAY_LIST[index]["title"]["en"];
		targetMusic["playlist-title-kr"] = PLAY_LIST[index]["title"]["kr"];
		targetMusic["playlist-title-jp"] = PLAY_LIST[index]["title"]["jp"];
		targetMusic["playlist-title-cn"] = PLAY_LIST[index]["title"]["cn"];
		targetMusic["playlist-title-ru"] = PLAY_LIST[index]["title"]["ru"];
		MUSIC_LIST.push(targetMusic);
	}
}

showPlaylist();

function jumpTimeline(event){
	const timeline = document.getElementById("timeline");
	const timelineWidth = window.getComputedStyle(timeline).width;
	if(audio != null){
		const timeToSeek = event.offsetX / parseInt(timelineWidth) * audio.duration;
		audio.currentTime = timeToSeek;
	}
}

function setVolume(event){
	const volumeSlider = document.getElementById("volume-slider");
	const volumePercentage = document.getElementById("volume-percentage");
	const sliderWidth = window.getComputedStyle(volumeSlider).width;
	const newVolume = event.offsetX / parseInt(sliderWidth);
	if(audio != null){
		audio.volume = newVolume;
	}
	volumePercentage.style.width = newVolume * 100 + '%';
}

/**
 * 음악 플레이어 프로그레스 바 업데이트
 * requestAnimationFrame을 사용하여 성능 최적화
 */
let animationFrameId = null;

function updateProgress() {
	if (audio && !audio.paused && !audio.ended) {
		const progressBar = document.getElementById("progress");
		const currentTime = document.getElementById("current-time");

		if (progressBar && currentTime && audio.duration) {
			progressBar.style.width = (audio.currentTime / audio.duration * 100) + "%";
			currentTime.textContent = getTimeCodeFromNum(audio.currentTime);
		}

		// 다음 프레임에서 다시 호출
		animationFrameId = requestAnimationFrame(updateProgress);
	}
}

/**
 * 프로그레스 업데이트 시작
 */
function startProgressUpdate() {
	if (animationFrameId === null) {
		animationFrameId = requestAnimationFrame(updateProgress);
	}
}

/**
 * 프로그레스 업데이트 중지
 */
function stopProgressUpdate() {
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
}

function togglePlayButton(){
	if(audio != null){
		const playButton = document.getElementById("player-music-play-button");
		const playButton2 = document.getElementById("player-music-play-button2");
		if (audio.paused) {
			playButton.innerHTML = "<i class='fa-solid fa-pause' aria-hidden='true'></i>";
			playButton.setAttribute("aria-label", "Pause music");
			playButton2.className = "fa-solid fa-pause control-button";
			playButton2.setAttribute("aria-label", "Pause");
			audio.play();
			// 프로그레스 업데이트 시작
			startProgressUpdate();
		} else {
			playButton.innerHTML = "<i class='fa-solid fa-play' aria-hidden='true'></i>";
			playButton.setAttribute("aria-label", "Play music");
			playButton2.className = "fa-solid fa-play control-button";
			playButton2.setAttribute("aria-label", "Play");
			audio.pause();
			// 프로그레스 업데이트 중지
			stopProgressUpdate();
		}
	}
}

function toggleMute(){
	if(audio != null){
		const muteButton = document.getElementById("mute-button");
		audio.muted = !audio.muted;
		if (audio.muted) {
			muteButton.innerHTML = "<i class='fa-solid fa-volume-xmark control-button' aria-hidden='true'></i>";
			muteButton.setAttribute("aria-label", "Unmute");
		} else {
			muteButton.innerHTML = "<i class='fa-solid fa-volume-high control-button' aria-hidden='true'></i>";
			muteButton.setAttribute("aria-label", "Mute");
		}
	}
}

function getTimeCodeFromNum(num) {
  let seconds = parseInt(num);
  let minutes = parseInt(seconds / 60);
  seconds -= minutes * 60;
  const hours = parseInt(minutes / 60);
  minutes -= hours * 60;
  if (hours === 0) return `${minutes}:${String(seconds % 60).padStart(2, 0)}`;
  return `${String(hours).padStart(2, 0)}:${minutes}:${String(
	seconds % 60
  ).padStart(2, 0)}`;
}

function showThisMusicDetails(){
	showDetails(NOW_PLAY_MUSIC_TITLE);
}

// 접근성: 모달 포커스 관리
let lastFocusedElement = null;

function showDetails(musicName){
	// 접근성: 모달 열기 전 현재 포커스 요소 저장
	lastFocusedElement = document.activeElement;

	for(let musicIndex = 0; musicIndex < MUSIC_LIST.length; musicIndex ++) {
		if(MUSIC_LIST[musicIndex]["title"]["en"] == musicName){
			document.getElementById("music-details-image").src = MUSIC_LIST[musicIndex]["image"];
			// XSS 방지: textContent 사용
			document.getElementById("music-details-title").textContent = MUSIC_LIST[musicIndex]["title"][NOW_LANG];
			if(MUSIC_LIST[musicIndex].hasOwnProperty("lyrics")){
				document.getElementById("music-details-lyrics-pane").removeAttribute("hidden");
				// 가사는 줄바꿈이 필요하므로 textContent 사용 (innerHTML은 XSS 위험)
				document.getElementById("music-details-lyrics").textContent = MUSIC_LIST[musicIndex]["lyrics"][NOW_LANG];
			} else {
				document.getElementById("music-details-lyrics-pane").setAttribute("hidden", "true");
			}
			document.getElementById("music-details-composed-at").textContent = MUSIC_LIST[musicIndex]["composed-at"];
			document.getElementById("music-details-composed-with").textContent = MUSIC_LIST[musicIndex]["composed-with"];

			if(CREATED_WITH[MUSIC_LIST[musicIndex]["composed-with"]].hasOwnProperty("profile")) {
				document.getElementById("music-details-composed-with").href = CREATED_WITH[MUSIC_LIST[musicIndex]["composed-with"]]["profile"];
			} else {
				document.getElementById("music-details-composed-with").href = CREATED_WITH[MUSIC_LIST[musicIndex]["composed-with"]]["url"];
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("instrumentation")){
				document.getElementById("music-details-instrumentation-pane").removeAttribute("hidden");
				document.getElementById("music-details-instrumentation").textContent = MUSIC_LIST[musicIndex]["instrumentation"];
			} else {
				document.getElementById("music-details-instrumentation-pane").setAttribute("hidden", "true");
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("key")){
				document.getElementById("music-details-key-pane").removeAttribute("hidden");
				document.getElementById("music-details-key").textContent = MUSIC_LIST[musicIndex]["key"];
			} else {
				document.getElementById("music-details-key-pane").setAttribute("hidden", "true");
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("tempo")){
				document.getElementById("music-details-tempo-pane").removeAttribute("hidden");
				document.getElementById("music-details-tempo").textContent = MUSIC_LIST[musicIndex]["tempo"];
			} else {
				document.getElementById("music-details-tempo-pane").setAttribute("hidden", "true");
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("meter")){
				document.getElementById("music-details-meter-pane").removeAttribute("hidden");
				document.getElementById("music-details-meter").textContent = MUSIC_LIST[musicIndex]["meter"];
			} else {
				document.getElementById("music-details-meter-pane").setAttribute("hidden", "true");
			}
			document.getElementById("music-details-duration").textContent = MUSIC_LIST[musicIndex]["duration"] + "/s";

			const tagPane = document.getElementById("music-details-tag");
			// XSS 방지: textContent 사용
			tagPane.textContent = MUSIC_LIST[musicIndex]["tag"].join(', ');
			const mp3Download = document.getElementById("download-mp3");
			const midiDownload = document.getElementById("download-midi");
			const wavDownload = document.getElementById("download-wav");
			const stemDownload = document.getElementById("download-stem");
			if(MUSIC_LIST[musicIndex].hasOwnProperty("mp3")){
				mp3Download.removeAttribute("hidden");
				mp3Download.href = MUSIC_LIST[musicIndex]["mp3"];
			} else {
				mp3Download.setAttribute("hidden", "true");
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("midi")){
				midiDownload.removeAttribute("hidden");
				midiDownload.href = MUSIC_LIST[musicIndex]["midi"];
			} else {
				midiDownload.setAttribute("hidden", "true");
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("wav")){
				wavDownload.removeAttribute("hidden");
				wavDownload.href = MUSIC_LIST[musicIndex]["wav"];
			} else {
				wavDownload.setAttribute("hidden", "true");
			}
			if(MUSIC_LIST[musicIndex].hasOwnProperty("stem")){
				stemDownload.removeAttribute("hidden");
				stemDownload.href = MUSIC_LIST[musicIndex]["stem"];
			} else {
				stemDownload.setAttribute("hidden", "true");
			}
			$('#musicDetailModal').modal('show');

			// 접근성: 모달 열렸을 때 첫 번째 포커스 가능한 요소로 포커스 이동
			setTimeout(() => {
				const modal = document.getElementById('musicDetailModal');
				const focusableElements = modal.querySelectorAll(
					'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				if (focusableElements.length > 0) {
					focusableElements[0].focus();
				}
			}, 300); // Bootstrap 모달 애니메이션 후 포커스

			break;
		}
	}

}

/**
 * 검색 입력 필드 초기화 및 디바운싱 적용
 * 성능 최적화: 300ms 디바운싱으로 불필요한 검색 호출 방지
 */
document.addEventListener('DOMContentLoaded', function() {
	// 검색 입력 필드 이벤트
	const musicInput = document.getElementById('search-music-input');
	const playlistInput = document.getElementById('search-playlist-input');

	if (musicInput) {
		// 디바운싱된 검색 함수 생성 (300ms 대기)
		const debouncedSearchMusic = DebounceManager.create(searchMusic, 300);

		// input 이벤트에 디바운싱 적용
		musicInput.addEventListener('input', debouncedSearchMusic);

		// Enter 키 이벤트 처리
		musicInput.addEventListener('keyup', searchMusicEnter);
	}

	if (playlistInput) {
		// 디바운싱된 검색 함수 생성 (300ms 대기)
		const debouncedSearchPlaylist = DebounceManager.create(searchPlaylist, 300);

		// input 이벤트에 디바운싱 적용
		playlistInput.addEventListener('input', debouncedSearchPlaylist);

		// Enter 키 이벤트 처리
		playlistInput.addEventListener('keyup', searchPlaylistEnter);
	}

	// 검색 버튼 이벤트
	const musicSearchButton = document.getElementById('search-music-button');
	const playlistSearchButton = document.getElementById('search-playlist-button');

	if (musicSearchButton) {
		musicSearchButton.addEventListener('click', searchMusic);
	}

	if (playlistSearchButton) {
		playlistSearchButton.addEventListener('click', searchPlaylist);
	}

	// 탭 전환 이벤트
	const playlistTab = document.getElementById('playlist-tab');
	const musicTab = document.getElementById('music-tab');

	if (playlistTab) {
		playlistTab.addEventListener('click', showPlaylist);
		// 접근성: 키보드 네비게이션 (Enter/Space)
		playlistTab.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				showPlaylist();
				playlistTab.focus();
			}
			// 화살표 키로 탭 전환
			if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
				e.preventDefault();
				musicTab.focus();
			}
		});
	}

	if (musicTab) {
		musicTab.addEventListener('click', showMusic);
		// 접근성: 키보드 네비게이션 (Enter/Space)
		musicTab.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				showMusic();
				musicTab.focus();
			}
			// 화살표 키로 탭 전환
			if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
				e.preventDefault();
				playlistTab.focus();
			}
		});
	}

	// 플레이어 컨트롤 이벤트
	const playButton1 = document.getElementById('player-music-play-button');
	const playButton2 = document.getElementById('player-music-play-button2');
	const prevButton = document.getElementById('prev-button');
	const nextButton = document.getElementById('next-button');
	const muteButton = document.getElementById('mute-button');

	if (playButton1) {
		playButton1.addEventListener('click', togglePlayButton);
	}

	if (playButton2) {
		playButton2.addEventListener('click', togglePlayButton);
	}

	if (prevButton) {
		prevButton.addEventListener('click', prevMusic);
	}

	if (nextButton) {
		nextButton.addEventListener('click', nextMusic);
	}

	if (muteButton) {
		muteButton.addEventListener('click', toggleMute);
	}

	// 타임라인 및 볼륨 이벤트
	const timeline = document.getElementById('timeline');
	const volumeSlider = document.getElementById('volume-slider');

	if (timeline) {
		timeline.addEventListener('click', jumpTimeline);
		// 접근성: 타임라인 키보드 제어
		timeline.addEventListener('keydown', function(e) {
			if (!audio) return;

			let newTime = audio.currentTime;
			const step = audio.duration * 0.05; // 5% 단위로 이동

			if (e.key === 'ArrowLeft') {
				e.preventDefault();
				newTime = Math.max(0, audio.currentTime - step);
				audio.currentTime = newTime;
				// ARIA 값 업데이트
				const progress = (newTime / audio.duration) * 100;
				timeline.setAttribute('aria-valuenow', Math.round(progress));
			} else if (e.key === 'ArrowRight') {
				e.preventDefault();
				newTime = Math.min(audio.duration, audio.currentTime + step);
				audio.currentTime = newTime;
				// ARIA 값 업데이트
				const progress = (newTime / audio.duration) * 100;
				timeline.setAttribute('aria-valuenow', Math.round(progress));
			} else if (e.key === 'Home') {
				e.preventDefault();
				audio.currentTime = 0;
				timeline.setAttribute('aria-valuenow', 0);
			} else if (e.key === 'End') {
				e.preventDefault();
				audio.currentTime = audio.duration;
				timeline.setAttribute('aria-valuenow', 100);
			}
		});
	}

	if (volumeSlider) {
		volumeSlider.addEventListener('click', setVolume);
		// 접근성: 볼륨 슬라이더 키보드 제어
		volumeSlider.addEventListener('keydown', function(e) {
			if (!audio) return;

			let newVolume = audio.volume;
			const step = 0.1; // 10% 단위로 조절

			if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
				e.preventDefault();
				newVolume = Math.max(0, audio.volume - step);
				audio.volume = newVolume;
				document.getElementById('volume-percentage').style.width = newVolume * 100 + '%';
				volumeSlider.setAttribute('aria-valuenow', Math.round(newVolume * 100));
			} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
				e.preventDefault();
				newVolume = Math.min(1, audio.volume + step);
				audio.volume = newVolume;
				document.getElementById('volume-percentage').style.width = newVolume * 100 + '%';
				volumeSlider.setAttribute('aria-valuenow', Math.round(newVolume * 100));
			} else if (e.key === 'Home') {
				e.preventDefault();
				audio.volume = 0;
				document.getElementById('volume-percentage').style.width = '0%';
				volumeSlider.setAttribute('aria-valuenow', 0);
			} else if (e.key === 'End') {
				e.preventDefault();
				audio.volume = 1;
				document.getElementById('volume-percentage').style.width = '100%';
				volumeSlider.setAttribute('aria-valuenow', 100);
			}
		});
	}

	// 플레이어 음악 제목 클릭 이벤트
	const playerMusicTitle = document.getElementById('player-music-title');

	if (playerMusicTitle) {
		playerMusicTitle.addEventListener('click', showThisMusicDetails);
		// 접근성: 키보드 네비게이션 (Enter/Space)
		playerMusicTitle.addEventListener('keydown', function(e) {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				showThisMusicDetails();
			}
		});
	}

	// 접근성: 전역 키보드 단축키
	document.addEventListener('keydown', function(e) {
		// 입력 필드에 포커스가 있을 때는 단축키 비활성화
		if (document.activeElement.tagName === 'INPUT' ||
		    document.activeElement.tagName === 'TEXTAREA' ||
		    document.activeElement.tagName === 'SELECT') {
			return;
		}

		// Space: 재생/일시정지
		if (e.code === 'Space') {
			e.preventDefault();
			togglePlayButton();
		}
		// M: 음소거 토글
		else if (e.key === 'm' || e.key === 'M') {
			e.preventDefault();
			toggleMute();
		}
		// N or ArrowRight (with Ctrl): 다음 곡
		else if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey) {
			e.preventDefault();
			nextMusic();
		}
		// P or ArrowLeft (with Ctrl): 이전 곡
		else if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey) {
			e.preventDefault();
			prevMusic();
		}
	});

	// 접근성: 모달 닫힐 때 포커스 복원
	$('#musicDetailModal').on('hidden.bs.modal', function () {
		if (lastFocusedElement) {
			lastFocusedElement.focus();
			lastFocusedElement = null;
		}
	});

	// 접근성: 모달 포커스 트랩
	$('#musicDetailModal').on('shown.bs.modal', function () {
		const modal = document.getElementById('musicDetailModal');
		const focusableElements = modal.querySelectorAll(
			'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		modal.addEventListener('keydown', function(e) {
			// Escape 키로 모달 닫기
			if (e.key === 'Escape') {
				$('#musicDetailModal').modal('hide');
				return;
			}

			// Tab 키 포커스 트랩
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					// Shift + Tab
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		});
	});
});