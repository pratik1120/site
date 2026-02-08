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
            src: "/static/music/Lorn's_Lure_Lost_Light.mp3"
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

function startDrag(x, y) {
    isDragging = true;
    radio.style.animation = "none";

    const rect = radio.getBoundingClientRect();
    offsetX = x - rect.left;
    offsetY = y - rect.top;
}

function dragMove(x, y) {
    if (!isDragging) return;

    radio.style.left = `${x - offsetX}px`;
    radio.style.top = `${y - offsetY}px`;
    radio.style.transform = "none";
}

function endDrag() {
    isDragging = false;

    localStorage.setItem("radioPos", JSON.stringify({
        x: radio.style.left,
        y: radio.style.top
    }));
}

/* ===== MOUSE ===== */
radio.addEventListener("mousedown", (e) => {
    startDrag(e.clientX, e.clientY);
});

document.addEventListener("mousemove", (e) => {
    dragMove(e.clientX, e.clientY);
});

document.addEventListener("mouseup", endDrag);

/* ===== TOUCH ===== */
radio.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
}, { passive: false });

document.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    dragMove(t.clientX, t.clientY);
}, { passive: false });

document.addEventListener("touchend", endDrag);

/* ===== RESTORE POSITION ===== */
const savedPos = localStorage.getItem("radioPos");
if (savedPos) {
    const { x, y } = JSON.parse(savedPos);
    radio.style.left = x;
    radio.style.top = y;
    radio.style.transform = "none";
}
