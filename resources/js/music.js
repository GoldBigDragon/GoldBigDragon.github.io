function searchMusicEnter(){
    if (window.event.keyCode == 13) {
		searchMusic();
    }
}

function searchMusic(){
	const category = document.getElementById("search-music-category").value;
	const value = document.getElementById("search-music-input").value.toLowerCase();
	const musicArea = document.getElementById("music-area");
}

function searchPlaylistEnter(){
    if (window.event.keyCode == 13) {
		searchPlaylist();
    }
}

function searchPlaylist(){
	const category = document.getElementById("search-playlist-category").value;
	const value = document.getElementById("search-playlist-input").value.toLowerCase();
	const musicArea = document.getElementById("playlist-area");
}
