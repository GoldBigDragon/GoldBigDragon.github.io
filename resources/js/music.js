const NOW_PLAY_LIST = [];
let NOW_PLAY_PLAYLIST_TITLE = null;
let NOW_PLAY_INDEX = -1;

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
	const musicTitle = document.getElementById("player-music-title");
	musicTitle.innerHTML = " ";
	const progressBar = document.getElementById("progress");
	progressBar.style.width = "0%";
	const currentTime = document.getElementById("current-time");
	currentTime.innerText = "0:00";
	const duration = document.getElementById("duration");
	duration.innerText = "0:00";
	NOW_PLAY_PLAYLIST_TITLE = null;
	NOW_PLAY_INDEX = -1;
	NOW_PLAY_LIST.length = 0;
}

function runNextMusic(playlistTitle){
	NOW_PLAY_INDEX = NOW_PLAY_INDEX + 1;
	if(NOW_PLAY_LIST.length <= NOW_PLAY_INDEX) {
		stopMusic();
		NOW_PLAY_INDEX = -1;
		const targetPane = document.getElementById(playlistTitle);
		if(targetPane != null){
			targetPane.className = "row music-element";
		}
		return;
	} else {
		audio = new Audio(NOW_PLAY_LIST[NOW_PLAY_INDEX]["mp3"]);
		// audio.volume = 1;
		audio.setAttribute("onLoadeddata", "setDuration()");
		audio.setAttribute("onended", "runNextMusic('" + playlistTitle + "')");
		const playerImage = document.getElementById("player-music-image");
		playerImage.src = NOW_PLAY_LIST[NOW_PLAY_INDEX]["image"];
		const playButton = document.getElementById("player-music-play-button");
		if (audio.paused) {
			playButton.innerHTML = "<i class='fa-solid fa-pause'></i>";
			audio.play();
		} else {
			playButton.innerHTML = "<i class='fa-solid fa-play'></i>";
		}
		const musicTitle = document.getElementById("player-music-title");
		musicTitle.innerHTML = NOW_PLAY_LIST[NOW_PLAY_INDEX]["title"][NOW_LANG];
		LANGUAGE_OBJECT["MUSIC_LANG"]["NOW-PLAYING-MUSIC"] = NOW_PLAY_LIST[NOW_PLAY_INDEX]["title"];
	}
}

function setDuration(){
	const duration = document.getElementById("duration");
	duration.innerText = getTimeCodeFromNum(audio.duration);
}

function setPlayListAll(playlistTitle){
	stopMusic();
	NOW_PLAY_PLAYLIST_TITLE = playlistTitle;
	NOW_PLAY_LIST.length = 0;
	for(index = 0; index < MUSIC_LIST.length; index ++) {
		if(MUSIC_LIST[index]["playlist-title-en"] == playlistTitle){
			NOW_PLAY_LIST.push(MUSIC_LIST[index]);
		}
	}
	const targetPane = document.getElementById(playlistTitle);
	if(targetPane != null){
		targetPane.className = "row music-element-playing";
	}
	runNextMusic(playlistTitle);
}


function addMusic(musicArea, playlistData, index){
}

function searchMusicEnter(){
    if (window.event.keyCode == 13) {
		searchMusic();
    }
}

function searchMusic(){
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
				}
			}
		} else if(category == "tag"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["tag"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "playlist"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["playlist-title-en"].includes(value) ||
				MUSIC_LIST[index]["playlist-title-kr"].includes(value) ||
				MUSIC_LIST[index]["playlist-title-jp"].includes(value) ||
				MUSIC_LIST[index]["playlist-title-cn"].includes(value) ||
				MUSIC_LIST[index]["playlist-title-ru"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "instrumentation"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["instrumentation"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "key"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["key"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "tempo"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["tempo"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "meter"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["meter"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "duration"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["duration"]/60 == value/60){
					addMusic(musicArea, MUSIC_LIST[index], index);
				}
			}
		} else if(category == "created-with"){
			for(index = 0; index < MUSIC_LIST.length; index ++) {
				if(MUSIC_LIST[index]["created-with"].includes(value)){
					addMusic(musicArea, MUSIC_LIST[index], index);
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
	category.children[1].selected = true;
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
		if (audio.paused) {
			playButton.innerHTML = "<i class='fa-solid fa-pause'></i>";
			audio.play();
		} else {
			playButton.innerHTML = "<i class='fa-solid fa-play'></i>";
			audio.pause();
		}
	}
}

function toggleMute(){
	if(audio != null){
		const muteButton = document.getElementById("mute-button");
		audio.muted = !audio.muted;
		if (audio.muted) {
			muteButton.innerHTML = "<i class='fa-solid fa-volume-xmark'></i>";
		} else {
			muteButton.innerHTML = "<i class='fa-solid fa-volume-high'></i>";
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