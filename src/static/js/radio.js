console.log("radio.js loaded");

document.addEventListener("DOMContentLoaded", () => {

    const tracks = [
        {
            title: "Mulholland Drive OST",
            src: "/static/music/Mulholland_Drive_OST_(mp3.pm).mp3"
        },
        {
            title: "Ballance Final Music",
            src: "/static/music/Ballance_music_final.mp3"
        },
        {
            title: "Lorn’s Lure – Lost Light",
            src: "/static/music/Lorn's _Lure_Lost_Light.mp3"
        }
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

    // expose globally for inline onclick
    window.togglePlay = togglePlay;
    window.nextTrack = nextTrack;
    window.prevTrack = prevTrack;
    window.toggleLoop = toggleLoop;

    loadTrack(currentTrack);
});

const radio = document.getElementById("radio-float");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

radio.addEventListener("mousedown", (e) => {
    isDragging = true;
    radio.style.animation = "none";

    const rect = radio.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
});

document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    radio.style.left = `${e.clientX - offsetX}px`;
    radio.style.top = `${e.clientY - offsetY}px`;
    radio.style.transform = "none";
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});
