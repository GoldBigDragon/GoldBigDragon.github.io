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
	activeTab.className = "col tab-selected lang";
	const inactiveTab = document.getElementById("music-tab");
	inactiveTab.className = "col tab lang";
	const activePane = document.getElementById("playlist-pane");
	activePane.removeAttribute("hidden");
	const inactivePane = document.getElementById("music-pane");
	inactivePane.setAttribute("hidden", "true");
	const musicArea = document.getElementById("musicArea");
	musicArea.innerHTML = "";
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
	const musicArea = document.getElementById("musicArea");
	musicArea.innerHTML = "";
}