let NOW_PLAY_LIST_SIZE = 0;
let NOW_PLAY_PLAYLIST_TITLE = null;
let NOW_PLAY_MUSIC_TITLE = null;
let NOW_PLAY_INDEX = -1;
let MUSIC_SEARCH_RESULT = [];

let audio = null;

function stopMusic(){
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
	musicTitle.innerHTML = " ";
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
		} else {
			playButton.innerHTML = "<i class='fa-solid fa-play'></i>";
			playButton2.className = "fa-solid fa-play control-button";
		}
		const musicTitle = document.getElementById("player-music-title");
		musicTitle.innerHTML = MUSIC_LIST[musicIndex]["title"][NOW_LANG];
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
	const playButton = document.createElement("div");
	playButton.className = "play-button";
	playButton.setAttribute("onClick", "setPlayList('" + musicData["title"]["en"] + "')");
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
	title.innerHTML = musicData["title"][NOW_LANG];
	title.setAttribute("onClick", "showDetails('" + musicData["title"]['en'] + "')");
	
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
		tag.innerHTML = musicData["tag"][index2];
		tag.setAttribute("onClick", "setSearchMusicTagValue('"+musicData["tag"][index2]+"')");
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
	musicArea.innerHTML = "";
	
	if(value == null || value.length < 1){
		let index = 0;
		for(index = 0; index < MUSIC_LIST.length; index ++) {
			addMusic(musicArea, MUSIC_LIST[index], index);
		}
	} else {
		let index = 0;
		if(category == "title") {
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["title"][NOW_LANG].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "tag"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["tag"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "playlist"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["playlist-title-en"].toLowerCase().includes(value) ||
				MUSIC_LIST[index]["playlist-title-kr"].toLowerCase().includes(value) ||
				MUSIC_LIST[index]["playlist-title-jp"].toLowerCase().includes(value) ||
				MUSIC_LIST[index]["playlist-title-cn"].toLowerCase().includes(value) ||
				MUSIC_LIST[index]["playlist-title-ru"].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "instrumentation"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["instrumentation"].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "key"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["key"].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "tempo"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["tempo"].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "meter"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["meter"].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "duration"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["duration"]/60 == value/60){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		} else if(category == "created-with"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["created-with"].toLowerCase().includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
					MUSIC_SEARCH_RESULT.push(index);
				}
			}
		}
	}
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
	const playButton = document.createElement("div");
	playButton.className = "play-button";
	playButton.setAttribute("onClick", "setPlayListAll('" + playlistData["title"]["en"] + "')");
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
	title.innerHTML = playlistData["title"][NOW_LANG];
	title.setAttribute("onClick", "setSearchMusicPlaylistValue('" + playlistData["title"][NOW_LANG] + "')");
	
	LANGUAGE_OBJECT["MUSIC_LANG"][playlistData["title"]["en"]+"-title"] = playlistData["title"];
	title.setAttribute("data-lang-var", "MUSIC_LANG");
	title.setAttribute("data-lang", playlistData["title"]["en"]+"-title");
	const description = document.createElement("div");
	description.className = "row music-description lang";
	description.innerHTML = playlistData["description"][NOW_LANG];
	LANGUAGE_OBJECT["MUSIC_LANG"][playlistData["description"]["en"]+"-description"] = playlistData["description"];
	description.setAttribute("data-lang-var", "MUSIC_LANG");
	description.setAttribute("data-lang", playlistData["description"]["en"]+"-description");
	
	const tags = document.createElement("div");
	tags.className = "row align-left";
	for(index2 = 0; index2 < playlistData["tag"].length; index2 ++) {
		const tag = document.createElement("div");
		tag.className = "tag";
		tag.innerHTML = playlistData["tag"][index2];
		tag.setAttribute("onClick", "setSearchPlaylistTagValue('"+playlistData["tag"][index2]+"')");
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
	musicArea.innerHTML = "";
	
	if(value == null || value.length < 1){
		let index = 0;
		for(index = 0; index < PLAY_LIST.length; index ++) {
			addPlaylist(musicArea, PLAY_LIST[index], index);
		}
	} else {
		let index = 0;
		if(category == "title") {
			for(index = 0; index < PLAY_LIST.length; index ++) {
				if(PLAY_LIST[index]["title"][NOW_LANG].toLowerCase().includes(value)){
					addPlaylist(musicArea, PLAY_LIST[index], index);
				}
			}
		} else if(category == "tag"){
			for(index = 0; index < PLAY_LIST.length; index ++) {
				if(PLAY_LIST[index]["tag"].includes(value)){
					addPlaylist(musicArea, PLAY_LIST[index], index);
				}
			}
		}
	}
}

function showPlaylist(){
	MUSIC_SEARCH_RESULT.length = 0;
	const activeTab = document.getElementById("playlist-tab");
	activeTab.className = "col tab-selected lang";
	const inactiveTab = document.getElementById("music-tab");
	inactiveTab.className = "col tab lang";
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
	const inactiveTab = document.getElementById("playlist-tab");
	inactiveTab.className = "col tab lang";
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

setInterval(() => {
	if(audio != null){
		const progressBar = document.getElementById("progress");
		progressBar.style.width = audio.currentTime / audio.duration * 100 + "%";
		const currentTime = document.getElementById("current-time");
		currentTime.innerText = getTimeCodeFromNum(audio.currentTime);
	}
}, 500);

function togglePlayButton(){
	if(audio != null){
		const playButton = document.getElementById("player-music-play-button");
		const playButton2 = document.getElementById("player-music-play-button2");
		if (audio.paused) {
			playButton.innerHTML = "<i class='fa-solid fa-pause'></i>";
			playButton2.className = "fa-solid fa-pause control-button";
			audio.play();
		} else {
			playButton.innerHTML = "<i class='fa-solid fa-play'></i>";
			playButton2.className = "fa-solid fa-play control-button";
			audio.pause();
		}
	}
}

function toggleMute(){
	if(audio != null){
		const muteButton = document.getElementById("mute-button");
		audio.muted = !audio.muted;
		if (audio.muted) {
			muteButton.innerHTML = "<i class='fa-solid fa-volume-xmark control-button'></i>";
		} else {
			muteButton.innerHTML = "<i class='fa-solid fa-volume-high control-button'></i>";
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

function showDetails(musicName){
	alert("Show '" + musicName + "' detail page (Download, Lyrics, Created-at, Created-with, Duration)");
}