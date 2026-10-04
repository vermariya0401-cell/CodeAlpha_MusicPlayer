/**
 * ==============================================================================
 * NovaBeat - Local 3D Music Player
 * Vanilla JavaScript Engine
 * ==============================================================================
 * Features:
 *  - Native Local File Selection via <input type="file" accept="audio/*" multiple>
 *  - Instant In-Memory Playback via URL.createObjectURL(file)
 *  - Dynamic Playlist Generation with "MY MUSIC" Hub & Custom Playlists
 *  - Instant Search & Sorting (Recently Added, A-Z, Z-A)
 *  - Add to Favorites & Remove Song with Safe URL.revokeObjectURL()
 *  - Seamless 3D Visualizer & Vinyl Record Sync with Play/Pause
 *  - Smooth Mouse-Follow 3D Tilt with Specular Glare & Ambient Glow
 *  - Progress Bar Scrubbing with Hover Timestamp Tooltip
 *  - Full Keyboard Shortcuts & Mobile Touch Support
 * ==============================================================================
 */

// ------------------------------------------------------------------------------
// 1. Theme Color Palettes for Local & Demo Songs
// ------------------------------------------------------------------------------
const themePalettes = [
  {
    accent: "#8b5cf6",
    secondary: "#ec4899",
    glow: "rgba(139, 92, 246, 0.45)",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    orb: "rgba(139, 92, 246, 0.25)"
  },
  {
    accent: "#06b6d4",
    secondary: "#3b82f6",
    glow: "rgba(6, 182, 212, 0.45)",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
    orb: "rgba(6, 182, 212, 0.25)"
  },
  {
    accent: "#10b981",
    secondary: "#0d9488",
    glow: "rgba(16, 185, 129, 0.45)",
    gradient: "linear-gradient(135deg, #10b981 0%, #0d9488 100%)",
    orb: "rgba(16, 185, 129, 0.25)"
  },
  {
    accent: "#f43f5e",
    secondary: "#9333ea",
    glow: "rgba(244, 63, 94, 0.45)",
    gradient: "linear-gradient(135deg, #f43f5e 0%, #9333ea 100%)",
    orb: "rgba(244, 63, 94, 0.25)"
  },
  {
    accent: "#f59e0b",
    secondary: "#ef4444",
    glow: "rgba(245, 158, 11, 0.45)",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
    orb: "rgba(245, 158, 11, 0.25)"
  }
];

// Initial Demo Songs
const demoSongs = [
  {
    id: "demo_1",
    title: "Midnight Drive",
    artist: "Nova Waves",
    src: "audio/song1.mp3",
    isLocal: false,
    addedAt: 1,
    isFavorite: false,
    playlists: ["all", "demos"],
    theme: themePalettes[0]
  },
  {
    id: "demo_2",
    title: "Neon Dreams",
    artist: "Echo City",
    src: "audio/song2.mp3",
    isLocal: false,
    addedAt: 2,
    isFavorite: false,
    playlists: ["all", "demos"],
    theme: themePalettes[1]
  },
  {
    id: "demo_3",
    title: "After Hours",
    artist: "Lunar Sky",
    src: "audio/song3.mp3",
    isLocal: false,
    addedAt: 3,
    isFavorite: false,
    playlists: ["all", "demos"],
    theme: themePalettes[2]
  },
  {
    id: "demo_4",
    title: "Lost Memories",
    artist: "Aurora",
    src: "audio/song4.mp3",
    isLocal: false,
    addedAt: 4,
    isFavorite: false,
    playlists: ["all", "demos"],
    theme: themePalettes[3]
  },
  {
    id: "demo_5",
    title: "City Lights",
    artist: "Nightfall",
    src: "audio/song5.mp3",
    isLocal: false,
    addedAt: 5,
    isFavorite: false,
    playlists: ["all", "demos"],
    theme: themePalettes[4]
  }
];

// ------------------------------------------------------------------------------
// 2. Global State Variables
// ------------------------------------------------------------------------------
let userSongs = [];             // Stores user's local selected File objects & blob URLs
let customPlaylists = ["Favorites", "Workout", "Chill"]; // User-created playlists
let activeTab = "all";          // Current filter tab ("all", "favorites", "demos", or custom name)
let searchQuery = "";           // Live search input
let sortMode = "recent";        // Current sort order ("recent", "az", "za")

let currentTrack = demoSongs[0]; // Active playing track object
let isPlaying = false;          // Playback state
let isDraggingProgress = false; // Scrubbing flag
let lastVolume = 0.8;           // Stores volume prior to muting

// ------------------------------------------------------------------------------
// 3. Audio Object Initialization (HTML5 Audio API)
// ------------------------------------------------------------------------------
const audio = new Audio();
audio.volume = 0.8;

// ------------------------------------------------------------------------------
// 4. DOM Elements Selection
// ------------------------------------------------------------------------------
// Player & Display Elements
const playerCard = document.getElementById("playerCard");
const mouseLightOverlay = document.getElementById("mouseLightOverlay");
const cardGlare = document.getElementById("cardGlare");
const artworkWrapper = document.getElementById("artworkWrapper");
const artworkCanvas = document.getElementById("artworkCanvas");
const vinylDisc = document.getElementById("vinylDisc");
const trackBadge = document.getElementById("trackBadge");
const songInfo = document.getElementById("songInfo");
const songTitle = document.getElementById("songTitle");
const artistName = document.getElementById("artistName");
const dynamicOrb = document.getElementById("dynamicOrb");

// Progress Elements
const progressContainer = document.getElementById("progressContainer");
const progressBar = document.getElementById("progressBar");
const progressHoverTooltip = document.getElementById("progressHoverTooltip");
const currentTimeEl = document.getElementById("currentTime");
const totalDurationEl = document.getElementById("totalDuration");

// Control Buttons
const prevBtn = document.getElementById("prevBtn");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const nextBtn = document.getElementById("nextBtn");

// Volume Elements
const muteBtn = document.getElementById("muteBtn");
const volumeIcon = document.getElementById("volumeIcon");
const volumeSlider = document.getElementById("volumeSlider");
const volumePercent = document.getElementById("volumePercent");

// Local File Picker & Hub Elements
const audioFileInput = document.getElementById("audioFileInput");
const addMusicBtn = document.getElementById("addMusicBtn");
const quickAddBtn = document.getElementById("quickAddBtn");
const createPlaylistBtn = document.getElementById("createPlaylistBtn");
const playlistTabsBar = document.getElementById("playlistTabsBar");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const sortSelect = document.getElementById("sortSelect");
const playlistEl = document.getElementById("playlist");
const trackCountBadge = document.getElementById("trackCountBadge");
const emptyPlaylistState = document.getElementById("emptyPlaylistState");
const playlistMainTitle = document.getElementById("playlistMainTitle");

// Error Banner Elements
const errorBanner = document.getElementById("errorBanner");
const errorMessageText = document.getElementById("errorMessageText");
const errorCloseBtn = document.getElementById("errorCloseBtn");

// Modal Elements
const playlistModal = document.getElementById("playlistModal");
const closePlaylistModalBtn = document.getElementById("closePlaylistModalBtn");
const cancelPlaylistBtn = document.getElementById("cancelPlaylistBtn");
const confirmCreatePlaylistBtn = document.getElementById("confirmCreatePlaylistBtn");
const newPlaylistNameInput = document.getElementById("newPlaylistNameInput");

// ------------------------------------------------------------------------------
// 5. SVG Icons Constants
// ------------------------------------------------------------------------------
const PLAY_ICON_SVG = `
  <svg viewBox="0 0 24 24" width="26" height="26">
    <path fill="currentColor" d="M8 5v14l11-7z"/>
  </svg>
`;

const PAUSE_ICON_SVG = `
  <svg viewBox="0 0 24 24" width="26" height="26">
    <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
`;

const VOLUME_HIGH_SVG = `
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
  </svg>
`;

const VOLUME_LOW_SVG = `
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
  </svg>
`;

const VOLUME_MUTED_SVG = `
  <svg viewBox="0 0 24 24" width="20" height="20">
    <path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
  </svg>
`;

// ------------------------------------------------------------------------------
// 6. Time Formatter Helper Function
// ------------------------------------------------------------------------------
function formatTime(seconds) {
  if (isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return "0:00";
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// ------------------------------------------------------------------------------
// 7. Dynamic Ambient Theming System
// ------------------------------------------------------------------------------
function applySongTheme(theme) {
  if (!theme) return;
  const root = document.documentElement;
  root.style.setProperty("--accent-color", theme.accent);
  root.style.setProperty("--accent-secondary", theme.secondary);
  root.style.setProperty("--accent-glow", theme.glow);
  root.style.setProperty("--accent-gradient", theme.gradient);
  root.style.setProperty("--ambient-orb-color", theme.orb);

  if (dynamicOrb) {
    dynamicOrb.style.background = `radial-gradient(circle, ${theme.orb} 0%, rgba(0, 0, 0, 0) 70%)`;
  }
}

// ------------------------------------------------------------------------------
// 8. Queue & Filtering Engine
// ------------------------------------------------------------------------------
/**
 * Gets the current filtered & sorted playback queue
 * @returns {Array} List of track objects
 */
function getCurrentQueue() {
  // Combine all available tracks (user local songs + demo songs)
  let allTracks = [...userSongs, ...demoSongs];

  // Filter by active tab
  let filtered = [];
  if (activeTab === "all") {
    filtered = allTracks;
  } else if (activeTab === "favorites") {
    filtered = allTracks.filter(t => t.isFavorite);
  } else if (activeTab === "demos") {
    filtered = demoSongs;
  } else {
    // Custom playlist
    filtered = allTracks.filter(t => t.playlists && t.playlists.includes(activeTab));
  }

  // Filter by search query
  if (searchQuery.trim().length > 0) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(t => 
      t.title.toLowerCase().includes(q) || 
      (t.artist && t.artist.toLowerCase().includes(q))
    );
  }

  // Sort
  if (sortMode === "recent") {
    filtered.sort((a, b) => b.addedAt - a.addedAt);
  } else if (sortMode === "az") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortMode === "za") {
    filtered.sort((a, b) => b.title.localeCompare(a.title));
  }

  return filtered;
}

// ------------------------------------------------------------------------------
// 9. Core Audio Control Functions
// ------------------------------------------------------------------------------

/**
 * Loads a track object into the player
 * @param {object} track - Track object
 */
function loadTrack(track) {
  if (!track) return;
  hideErrorBanner();

  currentTrack = track;

  // Apply track's dynamic theme
  applySongTheme(track.theme || themePalettes[0]);

  // Smooth artwork pulse
  if (artworkCanvas) {
    artworkCanvas.classList.remove("song-change-pulse");
    void artworkCanvas.offsetWidth;
    artworkCanvas.classList.add("song-change-pulse");
  }

  // Smooth text transition
  if (songInfo) {
    songInfo.classList.add("song-text-transition");
    setTimeout(() => {
      songInfo.classList.remove("song-text-transition");
    }, 180);
  }

  // Update song titles & artist info
  if (songTitle) songTitle.textContent = track.title;
  if (artistName) artistName.textContent = track.artist || "Local File";

  // Update track counter badge in current queue
  const queue = getCurrentQueue();
  const currentIndex = queue.findIndex(t => t.id === track.id);
  const trackNum = currentIndex !== -1 ? currentIndex + 1 : 1;
  const totalNum = queue.length > 0 ? queue.length : 1;
  if (trackBadge) trackBadge.textContent = `Track ${trackNum} of ${totalNum}`;

  // Update audio source
  audio.src = track.src;

  // Reset progress UI
  if (progressBar) progressBar.style.width = "0%";
  if (currentTimeEl) currentTimeEl.textContent = "0:00";
  if (totalDurationEl) totalDurationEl.textContent = "0:00";

  // Re-render playlist to highlight the active track
  renderPlaylist();
}

/**
 * Plays the loaded audio
 */
function playSong() {
  isPlaying = true;
  if (playerCard) playerCard.classList.add("playing");
  if (playIcon) playIcon.innerHTML = PAUSE_ICON_SVG;
  if (playBtn) {
    playBtn.title = "Pause";
    playBtn.setAttribute("aria-label", "Pause");
  }

  audio.play().catch((err) => {
    console.warn("Audio playback notice:", err.message);
    handleAudioError("Could not play audio. File format may be unsupported.");
  });
}

/**
 * Pauses the loaded audio
 */
function pauseSong() {
  isPlaying = false;
  if (playerCard) playerCard.classList.remove("playing");
  if (playIcon) playIcon.innerHTML = PLAY_ICON_SVG;
  if (playBtn) {
    playBtn.title = "Play";
    playBtn.setAttribute("aria-label", "Play");
  }
  audio.pause();
}

/**
 * Toggles between play and pause states
 */
function togglePlay() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

/**
 * Plays next track in the active queue
 */
function nextSong() {
  const queue = getCurrentQueue();
  if (queue.length === 0) return;

  let currentIndex = queue.findIndex(t => t.id === currentTrack.id);
  if (currentIndex === -1) {
    currentIndex = 0;
  } else {
    currentIndex = (currentIndex + 1) % queue.length;
  }

  loadTrack(queue[currentIndex]);
  playSong();
}

/**
 * Plays previous track in the active queue
 */
function previousSong() {
  const queue = getCurrentQueue();
  if (queue.length === 0) return;

  let currentIndex = queue.findIndex(t => t.id === currentTrack.id);
  if (currentIndex === -1) {
    currentIndex = 0;
  } else {
    currentIndex = (currentIndex - 1 + queue.length) % queue.length;
  }

  loadTrack(queue[currentIndex]);
  playSong();
}

// ------------------------------------------------------------------------------
// 10. Accurate Progress & Seek Functions
// ------------------------------------------------------------------------------
function updateProgress() {
  if (isDraggingProgress) return;

  const { duration, currentTime } = audio;
  if (duration && !isNaN(duration) && isFinite(duration) && duration > 0) {
    const progressPercent = Math.min(100, Math.max(0, (currentTime / duration) * 100));
    if (progressBar) progressBar.style.width = `${progressPercent.toFixed(2)}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(currentTime);
  }
}

function setProgress(e) {
  if (!progressContainer) return;
  const rect = progressContainer.getBoundingClientRect();
  const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
  const clickX = clientX - rect.left;
  const width = rect.width;
  if (width <= 0) return;

  const clickRatio = Math.max(0, Math.min(clickX / width, 1));

  if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = clickRatio * audio.duration;
    if (progressBar) progressBar.style.width = `${(clickRatio * 100).toFixed(2)}%`;
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
  }
}

// ------------------------------------------------------------------------------
// 11. Volume & Mute Functions
// ------------------------------------------------------------------------------
function setVolume(e) {
  const val = parseFloat(e.target.value);
  audio.volume = val;
  audio.muted = (val === 0);

  if (val > 0) {
    lastVolume = val;
  }
  updateVolumeUI();
}

function toggleMute() {
  audio.muted = !audio.muted;

  if (audio.muted) {
    if (volumeSlider) volumeSlider.value = 0;
  } else {
    const restored = lastVolume > 0.05 ? lastVolume : 0.8;
    audio.volume = restored;
    if (volumeSlider) volumeSlider.value = restored;
  }
  updateVolumeUI();
}

function updateVolumeUI() {
  const currentVol = audio.muted ? 0 : audio.volume;
  const percent = Math.round(currentVol * 100);
  if (volumePercent) volumePercent.textContent = `${percent}%`;

  if (!volumeIcon || !muteBtn) return;

  if (audio.muted || currentVol === 0) {
    volumeIcon.innerHTML = VOLUME_MUTED_SVG;
    muteBtn.title = "Unmute";
    muteBtn.setAttribute("aria-label", "Unmute");
  } else if (currentVol < 0.5) {
    volumeIcon.innerHTML = VOLUME_LOW_SVG;
    muteBtn.title = "Mute";
    muteBtn.setAttribute("aria-label", "Mute");
  } else {
    volumeIcon.innerHTML = VOLUME_HIGH_SVG;
    muteBtn.title = "Mute";
    muteBtn.setAttribute("aria-label", "Mute");
  }
}

// ------------------------------------------------------------------------------
// 12. Local File Selection & Playlist Management
// ------------------------------------------------------------------------------

/**
 * Handles user-selected local files from computer
 * @param {Event} e
 */
function handleFilesSelected(e) {
  const files = Array.from(e.target.files);
  if (!files || files.length === 0) return;

  let firstAddedTrack = null;

  files.forEach((file, idx) => {
    // Clean filename: remove extension like .mp3, .wav, .m4a
    const cleanTitle = file.name.replace(/\.[^/.]+$/, "");

    // Pick an alternating theme palette
    const themeIdx = (userSongs.length + idx) % themePalettes.length;
    const theme = themePalettes[themeIdx];

    // Create persistent temporary object URL for the File object
    const objectUrl = URL.createObjectURL(file);

    const newSong = {
      id: "local_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      file: file,
      title: cleanTitle,
      artist: "Local File",
      src: objectUrl,
      isLocal: true,
      addedAt: Date.now() + idx,
      isFavorite: false,
      playlists: ["all", "My Music"],
      theme: theme
    };

    userSongs.unshift(newSong);

    if (!firstAddedTrack) {
      firstAddedTrack = newSong;
    }
  });

  // Automatically switch tab to "all" to show newly added music
  activeTab = "all";
  updateTabsUI();

  // Reset file input so user can choose more files later
  audioFileInput.value = "";

  // Re-render playlist
  renderPlaylist();

  // Immediately play the first selected file
  if (firstAddedTrack) {
    loadTrack(firstAddedTrack);
    playSong();
  }
}

/**
 * Removes a local song from userSongs and revokes its object URL
 * @param {string} songId
 */
function removeSong(songId) {
  const songIndex = userSongs.findIndex(s => s.id === songId);
  if (songIndex === -1) {
    // If it's a demo song, allow removing from current view
    const demoIndex = demoSongs.findIndex(s => s.id === songId);
    if (demoIndex !== -1) {
      demoSongs.splice(demoIndex, 1);
    }
  } else {
    const song = userSongs[songIndex];
    // Revoke object URL to prevent memory leaks
    if (song.src && song.src.startsWith("blob:")) {
      URL.revokeObjectURL(song.src);
    }
    userSongs.splice(songIndex, 1);
  }

  // If currently playing the deleted song, safely advance or pause
  if (currentTrack && currentTrack.id === songId) {
    const queue = getCurrentQueue();
    if (queue.length > 0) {
      loadTrack(queue[0]);
      playSong();
    } else {
      pauseSong();
      if (songTitle) songTitle.textContent = "No Song Selected";
      if (artistName) artistName.textContent = "Add Music to Play";
    }
  }

  renderPlaylist();
}

/**
 * Toggles a song's favorite state
 * @param {string} songId
 */
function toggleFavorite(songId) {
  const song = [...userSongs, ...demoSongs].find(s => s.id === songId);
  if (song) {
    song.isFavorite = !song.isFavorite;
    renderPlaylist();
  }
}

// ------------------------------------------------------------------------------
// 13. Playlist Rendering & 3D UI
// ------------------------------------------------------------------------------
function renderPlaylist() {
  if (!playlistEl) return;
  playlistEl.innerHTML = "";

  const queue = getCurrentQueue();

  // Update track count badge
  if (trackCountBadge) {
    trackCountBadge.textContent = `${queue.length < 10 ? "0" + queue.length : queue.length} ${queue.length === 1 ? "Track" : "Tracks"}`;
  }

  // Update section title based on active tab
  if (playlistMainTitle) {
    if (activeTab === "all") playlistMainTitle.textContent = "MY MUSIC";
    else if (activeTab === "favorites") playlistMainTitle.textContent = "FAVORITES";
    else if (activeTab === "demos") playlistMainTitle.textContent = "DEMO TRACKS";
    else playlistMainTitle.textContent = activeTab.toUpperCase();
  }

  // Show or hide empty state
  if (emptyPlaylistState) {
    emptyPlaylistState.style.display = queue.length === 0 ? "flex" : "none";
  }

  queue.forEach((song, index) => {
    const li = document.createElement("li");
    const isActive = currentTrack && song.id === currentTrack.id;
    li.className = `playlist-item ${isActive ? "active" : ""}`;
    li.setAttribute("role", "button");
    li.setAttribute("tabindex", "0");
    li.setAttribute("aria-label", `Play ${song.title}`);

    // Format index (01, 02...)
    const num = index + 1 < 10 ? "0" + (index + 1) : index + 1;

    li.innerHTML = `
      <span class="playlist-item-index">${num}</span>
      <div class="playlist-item-thumb" style="background:${song.theme ? song.theme.gradient : 'var(--accent-gradient)'}">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>
      <div class="playlist-item-details">
        <div class="playlist-item-title">${song.title}</div>
        <div class="playlist-item-artist">${song.artist || "Local File"}</div>
      </div>
      <div class="mini-wave" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="song-item-actions">
        <button class="song-action-btn song-fav-btn ${song.isFavorite ? 'is-fav' : ''}" title="${song.isFavorite ? 'Remove from favorites' : 'Add to favorites'}" aria-label="Favorite">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="${song.isFavorite 
              ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
              : 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'}"/>
          </svg>
        </button>
        <button class="song-action-btn song-remove-btn" title="Remove from My Music" aria-label="Remove">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    `;

    // Click handler to play this track
    li.addEventListener("click", (e) => {
      // Ignore if clicking action buttons
      if (e.target.closest(".song-action-btn")) return;

      if (currentTrack && currentTrack.id === song.id && isPlaying) {
        pauseSong();
      } else {
        loadTrack(song);
        playSong();
      }
    });

    // Keyboard support
    li.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        loadTrack(song);
        playSong();
      }
    });

    // Favorite button click
    const favBtn = li.querySelector(".song-fav-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(song.id);
    });

    // Remove button click
    const removeBtn = li.querySelector(".song-remove-btn");
    removeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSong(song.id);
    });

    playlistEl.appendChild(li);
  });
}

/**
 * Updates playlist tabs UI (adds custom playlist tabs)
 */
function updateTabsUI() {
  if (!playlistTabsBar) return;
  playlistTabsBar.innerHTML = "";

  const baseTabs = [
    { id: "all", label: "All Music" },
    { id: "favorites", label: "♥ Favorites" },
    { id: "demos", label: "🎵 Demos" }
  ];

  const allTabs = [
    ...baseTabs,
    ...customPlaylists.map(name => ({ id: name, label: "📂 " + name }))
  ];

  allTabs.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = `tab-pill ${activeTab === tab.id ? 'active' : ''}`;
    btn.textContent = tab.label;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", activeTab === tab.id ? "true" : "false");

    btn.addEventListener("click", () => {
      activeTab = tab.id;
      updateTabsUI();
      renderPlaylist();
    });

    playlistTabsBar.appendChild(btn);
  });
}

// ------------------------------------------------------------------------------
// 14. Error Handling Functions
// ------------------------------------------------------------------------------
function handleAudioError(msg) {
  pauseSong();
  if (errorBanner) {
    if (errorMessageText) {
      errorMessageText.innerHTML = `<strong>Notice:</strong> ${msg || "Audio file not found or format unsupported."}`;
    }
    errorBanner.classList.remove("hidden");
  }
}

function hideErrorBanner() {
  if (errorBanner) {
    errorBanner.classList.add("hidden");
  }
}

// ------------------------------------------------------------------------------
// 15. Liquid Smooth 3D Mouse Tilt & Radial Lighting Engine
// ------------------------------------------------------------------------------
let currentRotX = 0;
let currentRotY = 0;
let targetRotX = 0;
let targetRotY = 0;
let isHoveringCard = false;
let animationFrameId = null;

const isPointerFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function updateCardTilt() {
  const damping = isHoveringCard ? 0.08 : 0.06;
  currentRotX += (targetRotX - currentRotX) * damping;
  currentRotY += (targetRotY - currentRotY) * damping;

  if (playerCard) {
    playerCard.style.transform = `rotateX(${currentRotX.toFixed(3)}deg) rotateY(${currentRotY.toFixed(3)}deg) translateZ(0px)`;
  }

  const isMoving = Math.abs(targetRotX - currentRotX) > 0.005 || Math.abs(targetRotY - currentRotY) > 0.005;

  if (isHoveringCard || isMoving) {
    animationFrameId = requestAnimationFrame(updateCardTilt);
  } else {
    currentRotX = 0;
    currentRotY = 0;
    if (playerCard) {
      playerCard.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0px)";
    }
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

if (playerCard && isPointerFine) {
  playerCard.addEventListener("mouseenter", () => {
    isHoveringCard = true;
    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateCardTilt);
    }
  });

  playerCard.addEventListener("mousemove", (e) => {
    const rect = playerCard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;

    // Subtle 3D tilt: 5–6 degrees max
    targetRotY = normX * 5.8;
    targetRotX = -normY * 5.8;

    // Soft Radial Mouse Light Illumination Follow
    const lightPercentX = Math.round((x / rect.width) * 100);
    const lightPercentY = Math.round((y / rect.height) * 100);

    playerCard.style.setProperty("--mouse-x", `${lightPercentX}%`);
    playerCard.style.setProperty("--mouse-y", `${lightPercentY}%`);

    if (mouseLightOverlay) {
      mouseLightOverlay.style.opacity = "1";
    }

    if (cardGlare) {
      cardGlare.style.opacity = "1";
      cardGlare.style.background = `radial-gradient(circle 350px at ${lightPercentX}% ${lightPercentY}%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 80%)`;
    }
  });

  playerCard.addEventListener("mouseleave", () => {
    isHoveringCard = false;
    targetRotX = 0;
    targetRotY = 0;

    if (mouseLightOverlay) {
      mouseLightOverlay.style.opacity = "0";
    }

    if (cardGlare) {
      cardGlare.style.opacity = "0";
    }

    if (!animationFrameId) {
      animationFrameId = requestAnimationFrame(updateCardTilt);
    }
  });
}

// ------------------------------------------------------------------------------
// 16. Progress Bar Hover Tooltip
// ------------------------------------------------------------------------------
if (progressContainer && progressHoverTooltip) {
  progressContainer.addEventListener("mousemove", (e) => {
    const rect = progressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(x / rect.width, 1));

    if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
      const previewTime = ratio * audio.duration;
      progressHoverTooltip.textContent = formatTime(previewTime);
      const percent = (ratio * 100).toFixed(1);
      progressHoverTooltip.style.left = `clamp(22px, ${percent}%, calc(100% - 22px))`;
      progressHoverTooltip.classList.add("active");
    }
  });

  progressContainer.addEventListener("mouseleave", () => {
    progressHoverTooltip.classList.remove("active");
  });
}

// ------------------------------------------------------------------------------
// 17. Audio Lifecycle Event Listeners
// ------------------------------------------------------------------------------
audio.addEventListener("timeupdate", updateProgress);

audio.addEventListener("loadedmetadata", () => {
  if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
    if (totalDurationEl) totalDurationEl.textContent = formatTime(audio.duration);
  }
});

// Autoplay next track on song completion
audio.addEventListener("ended", () => {
  nextSong();
});

audio.addEventListener("error", (e) => {
  console.warn("Audio file notice:", e);
  handleAudioError("Audio playback error. The local file might have been moved or revoked.");
});

// ------------------------------------------------------------------------------
// 18. UI Control Listeners
// ------------------------------------------------------------------------------
if (playBtn) playBtn.addEventListener("click", togglePlay);
if (prevBtn) prevBtn.addEventListener("click", previousSong);
if (nextBtn) nextBtn.addEventListener("click", nextSong);

if (volumeSlider) volumeSlider.addEventListener("input", setVolume);
if (muteBtn) muteBtn.addEventListener("click", toggleMute);

if (errorCloseBtn) {
  errorCloseBtn.addEventListener("click", hideErrorBanner);
}

// File Picker Trigger Buttons
if (addMusicBtn && audioFileInput) {
  addMusicBtn.addEventListener("click", () => {
    audioFileInput.click();
  });
}

if (quickAddBtn && audioFileInput) {
  quickAddBtn.addEventListener("click", () => {
    audioFileInput.click();
  });
}

if (audioFileInput) {
  audioFileInput.addEventListener("change", handleFilesSelected);
}

// Search & Sort Controls
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    if (clearSearchBtn) {
      clearSearchBtn.style.display = searchQuery.length > 0 ? "block" : "none";
    }
    renderPlaylist();
  });
}

if (clearSearchBtn && searchInput) {
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    clearSearchBtn.style.display = "none";
    renderPlaylist();
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", (e) => {
    sortMode = e.target.value;
    renderPlaylist();
  });
}

// Create Playlist Modal
if (createPlaylistBtn && playlistModal) {
  createPlaylistBtn.addEventListener("click", () => {
    playlistModal.classList.add("open");
    if (newPlaylistNameInput) {
      newPlaylistNameInput.value = "";
      setTimeout(() => newPlaylistNameInput.focus(), 100);
    }
  });
}

function closePlaylistModal() {
  if (playlistModal) playlistModal.classList.remove("open");
}

if (closePlaylistModalBtn) closePlaylistModalBtn.addEventListener("click", closePlaylistModal);
if (cancelPlaylistBtn) cancelPlaylistBtn.addEventListener("click", closePlaylistModal);

if (playlistModal) {
  playlistModal.addEventListener("click", (e) => {
    if (e.target === playlistModal) closePlaylistModal();
  });
}

if (confirmCreatePlaylistBtn && newPlaylistNameInput) {
  confirmCreatePlaylistBtn.addEventListener("click", () => {
    const name = newPlaylistNameInput.value.trim();
    if (name.length > 0 && !customPlaylists.includes(name)) {
      customPlaylists.push(name);
      activeTab = name;
      updateTabsUI();
      renderPlaylist();
      closePlaylistModal();
    }
  });

  newPlaylistNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      confirmCreatePlaylistBtn.click();
    }
  });
}

// Progress Bar Seeking: Mouse & Touch
if (progressContainer) {
  progressContainer.addEventListener("click", setProgress);

  progressContainer.addEventListener("mousedown", (e) => {
    isDraggingProgress = true;
    if (progressBar) progressBar.style.transition = "none";
    setProgress(e);
  });

  window.addEventListener("mousemove", (e) => {
    if (isDraggingProgress) {
      setProgress(e);
    }
  });

  window.addEventListener("mouseup", () => {
    if (isDraggingProgress) {
      isDraggingProgress = false;
      if (progressBar) progressBar.style.transition = "";
    }
  });

  // Mobile Touch Seeking
  progressContainer.addEventListener("touchstart", (e) => {
    isDraggingProgress = true;
    if (progressBar) progressBar.style.transition = "none";
    setProgress(e);
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (isDraggingProgress) {
      setProgress(e);
    }
  }, { passive: true });

  window.addEventListener("touchend", () => {
    if (isDraggingProgress) {
      isDraggingProgress = false;
      if (progressBar) progressBar.style.transition = "";
    }
  });
}

// ------------------------------------------------------------------------------
// 19. Keyboard Shortcuts
// ------------------------------------------------------------------------------
window.addEventListener("keydown", (e) => {
  if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    if (document.activeElement !== volumeSlider) {
      return;
    }
  }

  switch (e.code) {
    case "Space":
      e.preventDefault();
      togglePlay();
      break;

    case "ArrowRight":
      e.preventDefault();
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
        updateProgress();
      }
      break;

    case "ArrowLeft":
      e.preventDefault();
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = Math.max(0, audio.currentTime - 5);
        updateProgress();
      }
      break;

    case "ArrowUp":
      e.preventDefault();
      audio.volume = Math.min(1, Math.round((audio.volume + 0.05) * 100) / 100);
      if (volumeSlider) volumeSlider.value = audio.volume;
      audio.muted = false;
      lastVolume = audio.volume;
      updateVolumeUI();
      break;

    case "ArrowDown":
      e.preventDefault();
      audio.volume = Math.max(0, Math.round((audio.volume - 0.05) * 100) / 100);
      if (volumeSlider) volumeSlider.value = audio.volume;
      if (audio.volume === 0) {
        audio.muted = true;
      }
      updateVolumeUI();
      break;

    default:
      break;
  }
});

// ------------------------------------------------------------------------------
// 20. App Startup
// ------------------------------------------------------------------------------
updateTabsUI();
loadTrack(currentTrack);
updateVolumeUI();
