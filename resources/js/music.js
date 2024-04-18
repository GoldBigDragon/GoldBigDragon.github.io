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

function addPlaylist(musicArea, playlistData, index){
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