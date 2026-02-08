
const tracks = [
    { title: "Track One", src: "/src/static/music/Mulholland_Drive_OST_(mp3.pm).mp3" },
    { title: "Track Two", src: "/static/music/track2.mp3" },
    { title: "Track Three", src: "/static/music/track3.mp3" },
    { title: "Track Four", src: "/static/music/track4.mp3" },
    { title: "Track Five", src: "/static/music/track5.mp3" },
    { title: "Track Six", src: "/static/music/track6.mp3" },
    { title: "Track Seven", src: "/static/music/track7.mp3" },
    { title: "Track Eight", src: "/static/music/track8.mp3" },
    { title: "Track Nine", src: "/static/music/track9.mp3" },
    { title: "Track Ten", src: "/static/music/track10.mp3" }
];

let currentTrack = 0;
let isPlaying = false;
let isLooping = false;

const audio = document.getElementById("audio");
const trackLabel = document.getElementById("radio-track");
const playBtn = document.getElementById("playBtn");
const loopBtn = document.getElementById("loopBtn");

function loadTrack(index) {
    audio.src = tracks[index].src;
    trackLabel.textContent = tracks[index].title;
}

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        playBtn.textContent = "▶";
    } else {
        audio.play();
        playBtn.textContent = "⏸";
    }
    isPlaying = !isPlaying;
}

function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    if (isPlaying) audio.play();
}

function prevTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    loadTrack(currentTrack);
    if (isPlaying) audio.play();
}

function toggleLoop() {
    isLooping = !isLooping;
    audio.loop = isLooping;
    loopBtn.style.opacity = isLooping ? "1" : "0.5";
}

audio.addEventListener("ended", () => {
    if (!isLooping) nextTrack();
});

// init
loadTrack(currentTrack);