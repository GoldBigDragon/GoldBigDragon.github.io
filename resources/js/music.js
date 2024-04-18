function searchMusicEnter(){
    if (window.event.keyCode == 13) {
		searchMusic();
    }
}

function searchMusic(){
	const category = document.getElementById("search-music-category").value;
	const value = document.getElementById("search-music-input").value.toLowerCase();
	const musicArea = document.getElementById("musicArea");
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
}

function showPlaylist(){
	const activeTab = document.getElementById("playlist-tab");
	activeTab.removeAttribute("hidden");
	activeTab.className = "col tab-selected lang";
	const inactiveTab = document.getElementById("music-tab");
	inactiveTab.setAttribute("hidden", "true");
	inactiveTab.className = "col tab lang";
	const musicArea = document.getElementById("musicArea");
	musicArea.innerHTML = "";
}

function showMusic(){
}