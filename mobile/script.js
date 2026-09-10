// ============================================
// MOBILE VERSION - SCRIPT.JS
// ============================================

const state = {
    settings: {
        name: '',
        theme: 'light',
        musicService: 'spotify',
        rewindSeconds: 10,
        forwardSeconds: 10
    },
    player: {
        currentSong: null,
        currentAlbum: null,
        currentIndex: -1,
        isPlaying: false,
        position: 0,
        queue: [],
        shuffle: true,
        loop: 'on', // 'off', 'on', 'single'
        audio: null
    },
    lyrics: {
        sync: false
    },
    isFirstVisit: true,
    currentPage: 'games',
    searchPreference: 'song',
    sortPreference: 'name',
    searchQuery: '',
    songsData: null,
    scrollPositions: {
        home: 0,
        games: 0,
        library: 0,
        lyrics: 0,
        settings: 0
    }
};

// ============================================
// DOM REFERENCES
// ============================================

const DOM = {};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('World of Diljit Dosanjh - Mobile App Loaded');
    
    checkFirstVisit();
    loadSettings();
    loadPlayerState();
    loadLyricsState();
    applyTheme();
    setupNavigation();
    
    if (window.location.pathname.includes('settings.html')) {
        setupSettingsPage();
    }
    
    if (window.location.pathname.includes('main.html')) {
        setupMainPage();
    }
    
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/mobile/') {
        setupHomePage();
    }
    
    setupScrollTracking();
    setTimeout(updateDotPosition, 50);
});

// ============================================
// FIRST VISIT CHECK
// ============================================

function checkFirstVisit() {
    const visited = localStorage.getItem('diljit_visited');
    const currentPath = window.location.pathname;
    const isSettingsPage = currentPath.includes('settings.html');
    
    if (visited === 'true') {
        state.isFirstVisit = false;
    } else {
        state.isFirstVisit = true;
        if (!isSettingsPage) {
            window.location.href = 'settings.html';
            return;
        }
    }
}

// ============================================
// PLAYER STATE MANAGEMENT
// ============================================

function loadPlayerState() {
    const shuffleSaved = localStorage.getItem('diljit_shuffle');
    if (shuffleSaved !== null) {
        state.player.shuffle = shuffleSaved === 'true';
    }
    
    const loopSaved = localStorage.getItem('diljit_loop');
    if (loopSaved) {
        state.player.loop = loopSaved;
    }
}

function savePlayerState() {
    localStorage.setItem('diljit_shuffle', state.player.shuffle);
    localStorage.setItem('diljit_loop', state.player.loop);
}

// ============================================
// LYRICS STATE MANAGEMENT
// ============================================

function loadLyricsState() {
    const syncSaved = localStorage.getItem('diljit_sync');
    if (syncSaved !== null) {
        state.lyrics.sync = syncSaved === 'true';
    }
}

function saveLyricsState() {
    localStorage.setItem('diljit_sync', state.lyrics.sync);
}

// ============================================
// SETTINGS MANAGEMENT
// ============================================

function loadSettings() {
    const saved = localStorage.getItem('diljit_settings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.settings = { ...state.settings, ...parsed };
        } catch (e) {
            console.error('Error loading settings:', e);
        }
    }
}

function saveSettings() {
    localStorage.setItem('diljit_settings', JSON.stringify(state.settings));
}

function applyTheme() {
    const body = document.body;
    body.classList.remove('light-mode', 'dark-mode');
    
    if (state.settings.theme === 'dark') {
        body.classList.add('dark-mode');
    } else {
        body.classList.add('light-mode');
    }
}

// ============================================
// NAVIGATION
// ============================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('main.html')) {
        const hash = window.location.hash || '#games';
        switchMainSection(hash.replace('#', ''));
        
        window.addEventListener('hashchange', function() {
            const newHash = window.location.hash.replace('#', '');
            switchMainSection(newHash);
        });
    }
    
    if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '/mobile/') {
        const homeLink = document.querySelector('.nav-item[data-page="home"]');
        if (homeLink) {
            homeLink.classList.add('active-text');
        }
        setTimeout(updateDotPosition, 10);
    }
    
    if (currentPath.includes('settings.html')) {
        const settingsLink = document.querySelector('.nav-item[data-page="settings"]');
        if (settingsLink) {
            settingsLink.classList.add('active-text');
        }
        setTimeout(updateDotPosition, 10);
    }
}

function switchMainSection(section) {
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active-text');
    });
    
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentPage = section;
        
        const navLinks = document.querySelectorAll('.nav-item[data-page]');
        navLinks.forEach(link => {
            if (link.dataset.page === section) {
                link.classList.add('active-text');
            }
        });
        
        updateDotPosition();
        
        const savedPos = state.scrollPositions[section] || 0;
        setTimeout(() => {
            window.scrollTo(0, savedPos);
        }, 50);
    }
}

// ============================================
// DOT POSITION
// ============================================

function updateDotPosition() {
    const slider = document.getElementById('slider-dot');
    if (!slider) return;
    
    const activeNav = document.querySelector('.nav-item.active-text');
    if (!activeNav) {
        slider.classList.remove('visible');
        return;
    }
    
    const currentPage = activeNav.dataset.page;
    const animatePages = ['games', 'library', 'lyrics'];
    const shouldAnimate = animatePages.includes(currentPage);
    
    const navRect = activeNav.getBoundingClientRect();
    const navParentRect = activeNav.closest('nav').getBoundingClientRect();
    
    const left = navRect.left - navParentRect.left + (navRect.width / 2) - 3;
    
    slider.style.left = left + 'px';
    slider.classList.add('visible');
    
    if (!shouldAnimate) {
        slider.style.transition = 'none';
        void slider.offsetHeight;
        slider.style.transition = 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
}

// ============================================
// SETTINGS PAGE
// ============================================

function setupSettingsPage() {
    const nameInput = document.getElementById('user-name');
    const themeToggle = document.getElementById('theme-toggle');
    const serviceBtns = document.querySelectorAll('.service-btn');
    const rewindBtns = document.querySelectorAll('#rewind-setting .sec-btn');
    const forwardBtns = document.querySelectorAll('#forward-setting .sec-btn');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-settings');
    
    if (nameInput && state.settings.name) {
        nameInput.value = state.settings.name;
    }
    
    if (themeToggle) {
        if (state.settings.theme === 'dark') {
            themeToggle.classList.add('active');
        } else {
            themeToggle.classList.remove('active');
        }
    }
    
    serviceBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.service === state.settings.musicService) {
            btn.classList.add('active');
        }
    });
    
    rewindBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.seconds) === state.settings.rewindSeconds) {
            btn.classList.add('active');
        }
    });
    
    forwardBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.seconds) === state.settings.forwardSeconds) {
            btn.classList.add('active');
        }
    });
    
    if (state.isFirstVisit) {
        document.querySelectorAll('.help-box').forEach(box => {
            box.classList.add('visible');
        });
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const isDark = this.classList.contains('active');
            state.settings.theme = isDark ? 'dark' : 'light';
            applyTheme();
            saveSettings();
        });
    }
    
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            serviceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.settings.musicService = this.dataset.service;
            saveSettings();
        });
    });
    
    rewindBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            rewindBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.settings.rewindSeconds = parseInt(this.dataset.seconds);
            saveSettings();
        });
    });
    
    forwardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            forwardBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.settings.forwardSeconds = parseInt(this.dataset.seconds);
            saveSettings();
        });
    });
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            const nameVal = nameInput ? nameInput.value.trim() : '';
            if (!nameVal) {
                showAlert('Please enter your name.');
                return;
            }
            
            state.settings.name = nameVal;
            saveSettings();
            
            localStorage.setItem('diljit_visited', 'true');
            state.isFirstVisit = false;
            
            window.location.href = 'index.html';
        });
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                localStorage.clear();
                
                state.settings = {
                    name: '',
                    theme: 'light',
                    musicService: 'spotify',
                    rewindSeconds: 10,
                    forwardSeconds: 10
                };
                state.player.shuffle = false;
                state.player.loop = 'off';
                state.lyrics.sync = false;
                state.isFirstVisit = true;
                
                window.location.reload();
            }
        });
    }
}

// ============================================
// HOME PAGE
// ============================================

function setupHomePage() {
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && state.settings.name) {
        nameDisplay.textContent = state.settings.name;
    }
}

// ============================================
// MAIN PAGE
// ============================================

function setupMainPage() {
    setupLibrary();
    setupLyrics();
    setupGames();
    setupPlayerControls();
    setupDraggableDot();
    loadLastPlayedSong();
    setupPopup();
    
    // Add click handler for lyrics title (only on the span itself)
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.lyrics-title-link');
        if (!target) return;
        
        const albumName = target.dataset.album;
        if (!albumName) return;
        
        // Switch to Library section
        const libraryLink = document.querySelector('.nav-item[data-page="library"]');
        if (libraryLink) {
            libraryLink.click();
        }
        
        // Scroll to the album after a short delay
        setTimeout(function() {
            const albumContainers = document.querySelectorAll('.album-container');
            for (const container of albumContainers) {
                const nameElement = container.querySelector('.album-name');
                if (nameElement && nameElement.textContent === albumName) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    break;
                }
            }
        }, 300);
    });
    
    // Build queue if songs are loaded and no queue exists
    if (state.songsData && state.player.queue.length === 0) {
        // If there's a last played song, use it
        const lastSong = localStorage.getItem('diljit_last_song');
        if (lastSong) {
            try {
                const parsed = JSON.parse(lastSong);
                // Find the song
                for (const album of state.songsData.albums) {
                    for (const song of album.songs) {
                        if (song.id === parsed.id) {
                            buildQueueWithStartingSong(song);
                            return;
                        }
                    }
                }
            } catch (e) {}
        }
        // Fallback - build queue with first song of first album
        if (state.songsData.albums.length > 0 && state.songsData.albums[0].songs.length > 0) {
            buildQueueWithStartingSong(state.songsData.albums[0].songs[0]);
        }
    }
}

// ============================================
// CUSTOM ALERT & CONFIRM
// ============================================

function showAlert(message, callback) {
    const overlay = document.getElementById('alert-overlay');
    const messageEl = document.getElementById('alert-message');
    const okBtn = document.getElementById('alert-ok');
    
    if (!overlay || !messageEl || !okBtn) {
        // Fallback to native alert if elements missing
        alert(message);
        if (callback) callback();
        return;
    }
    
    messageEl.textContent = message;
    overlay.classList.add('visible');
    
    // Remove any existing listener by cloning the button
    const newOkBtn = okBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOkBtn, okBtn);
    
    newOkBtn.addEventListener('click', function() {
        overlay.classList.remove('visible');
        if (callback) callback();
    });
}

// ============================================
// POPUP - MUSIC STOP WARNING
// ============================================

function setupPopup() {
    const popupOverlay = document.getElementById('popup-overlay');
    const popupContinue = document.getElementById('popup-continue');
    const popupStay = document.getElementById('popup-stay');
    
    if (!popupOverlay) return;
    
    let pendingUrl = null;
    
    // Intercept clicks on nav links that go to other pages
    document.addEventListener('click', function(e) {
        const navLink = e.target.closest('.nav-item');
        if (!navLink) return;
        
        const href = navLink.getAttribute('href');
        if (!href || href.startsWith('#')) return;
        
        // Only show popup if music is playing
        if (state.player.currentSong && state.player.isPlaying) {
            e.preventDefault();
            e.stopPropagation();
            
            // Save the playback position
            if (state.player.audio) {
                localStorage.setItem('diljit_playback_position', JSON.stringify({
                    songId: state.player.currentSong.id,
                    currentTime: state.player.audio.currentTime
                }));
            }
            
            // Show the popup
            pendingUrl = href;
            popupOverlay.classList.add('visible');
        }
    }, true);
    
    // Continue button - stop music and navigate
    if (popupContinue) {
        popupContinue.addEventListener('click', function() {
            // Stop the music
            if (state.player.audio) {
                state.player.audio.pause();
                state.player.isPlaying = false;
            }
            
            popupOverlay.classList.remove('visible');
            
            // Navigate
            if (pendingUrl) {
                window.location.href = pendingUrl;
            }
        });
    }
    
    // Stay button - cancel navigation
    if (popupStay) {
        popupStay.addEventListener('click', function() {
            popupOverlay.classList.remove('visible');
            pendingUrl = null;
        });
    }
}

// ============================================
// LIBRARY
// ============================================

function setupLibrary() {
    const savedSearchPref = localStorage.getItem('diljit_search_pref');
    if (savedSearchPref) {
        state.searchPreference = savedSearchPref;
    }
    
    const savedSortPref = localStorage.getItem('diljit_sort_pref');
    if (savedSortPref) {
        state.sortPreference = savedSortPref;
    }
    
    const playlistLink = document.getElementById('playlist-link');
    if (playlistLink) {
        if (state.settings.musicService === 'spotify') {
            playlistLink.textContent = 'Open playlist in Spotify';
            playlistLink.href = 'https://open.spotify.com/playlist/7kKP6I3H1qOvL12E4pkpOo?si=LJKKLN0JQP2u_dpIH_VGrg';
        } else {
            playlistLink.textContent = 'Open playlist in YouTube';
            playlistLink.href = 'https://youtube.com/playlist?list=PLS3iv0s08T00&si=a-eNbmDqnxmDA3lG';
        }
    }
    
    // Search dropdown
    const searchToggle = document.getElementById('search-toggle');
    const searchMenu = document.getElementById('search-menu');
    const searchTypeLabel = document.getElementById('search-type-label');
    
    // Sort dropdown
    const sortToggle = document.getElementById('sort-toggle');
    const sortMenu = document.getElementById('sort-menu');
    const sortTypeLabel = document.getElementById('sort-type-label');
    
    // Search dropdown
    if (searchToggle && searchMenu) {
        searchToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            searchMenu.classList.toggle('show');
            if (sortMenu) sortMenu.classList.remove('show');
        });
        
        searchMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.searchType;
                state.searchPreference = type;
                localStorage.setItem('diljit_search_pref', type);
                searchMenu.classList.remove('show');
                
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    // Clear search when changing type
                    searchInput.value = '';
                    state.searchQuery = '';
                    if (state.songsData) {
                        displayLibrary(state.songsData);
                    }
                }
            });
        });
    }
    
    // Sort dropdown
    if (sortToggle && sortMenu) {
        sortToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            sortMenu.classList.toggle('show');
            if (searchMenu) searchMenu.classList.remove('show');
        });
        
        sortMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.sortType;
                state.sortPreference = type;
                localStorage.setItem('diljit_sort_pref', type);
                sortMenu.classList.remove('show');
                
                // Refresh the library with new sort
                if (state.songsData) {
                    displayLibrary(state.songsData);
                }
            });
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function() {
        if (searchMenu) searchMenu.classList.remove('show');
        if (sortMenu) sortMenu.classList.remove('show');
    });
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
    }
    
    loadSongs().then(data => {
        if (data) {
            displayLibrary(data);
        }
    });
}

// ============================================
// DISPLAY LIBRARY
// ============================================

function displayLibrary(data) {
    const albumList = document.getElementById('album-list');
    if (!albumList) return;
    
    albumList.innerHTML = '';
    
    // Load sort preference from localStorage
    const savedSortPref = localStorage.getItem('diljit_sort_pref');
    if (savedSortPref) {
        state.sortPreference = savedSortPref;
    }
    
    // Get search query
    const query = state.searchQuery || '';
    const searchType = state.searchPreference || 'song';
    
    // Filter albums based on search
    let filteredAlbums = [...data.albums];
    
    if (query) {
        if (searchType === 'song') {
            // Filter songs by title (clean both the song title and the query)
            filteredAlbums = filteredAlbums.map(album => {
                const matchingSongs = album.songs.filter(song => {
                    const cleanSongTitle = cleanText(song.title);
                    return cleanSongTitle.includes(query);
                });
                return { ...album, songs: matchingSongs };
            }).filter(album => album.songs.length > 0);
        } else {
            // Search by album name (clean both the album name and the query)
            filteredAlbums = filteredAlbums.filter(album => {
                const cleanAlbumName = cleanText(album.name);
                return cleanAlbumName.includes(query);
            });
        }
    }
    
    // Sort albums based on preference
    let sortedAlbums = filteredAlbums;
    
    if (state.sortPreference === 'date') {
        // Sort by release date (newest first)
        sortedAlbums.sort((a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            return dateB - dateA;
        });
    } else {
        // Sort by name (default, ignore punctuation)
        sortedAlbums.sort((a, b) => {
            const cleanA = a.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const cleanB = b.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            return cleanA.localeCompare(cleanB);
        });
    }
    
    sortedAlbums.forEach(album => {
        const albumContainer = document.createElement('div');
        albumContainer.className = 'album-container';
        
        const header = document.createElement('div');
        header.className = 'album-header';
        
        const albumArt = document.createElement('img');
        albumArt.className = 'album-art';
        albumArt.src = `images/album-covers/${album.cover}`;
        albumArt.alt = album.name;
        albumArt.onerror = function() {
            this.src = '';
            this.style.display = 'none';
        };
        
        const albumInfo = document.createElement('div');
        albumInfo.className = 'album-info';
        albumInfo.innerHTML = `
            <div class="album-name">${album.name}</div>
            <div class="album-meta">${album.songs.length} songs • ${album.releaseDate}</div>
        `;
        
        header.appendChild(albumArt);
        header.appendChild(albumInfo);
        albumContainer.appendChild(header);
        
        const table = document.createElement('table');
        table.className = 'song-table';
        
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>#</th>
                <th>Song</th>
                <th>Duration</th>
            </tr>
        `;
        table.appendChild(thead);
        
        const tbody = document.createElement('tbody');
        album.songs.forEach(song => {
            const tr = document.createElement('tr');
            const durationMinutes = Math.floor(song.duration / 60);
            const durationSeconds = song.duration % 60;
            const durationFormatted = `${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
            
            tr.innerHTML = `
                <td>${song.track}</td>
                <td class="song-name" data-song-id="${song.id}">${song.title}</td>
                <td>${durationFormatted}</td>
            `;
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        albumContainer.appendChild(table);
        albumList.appendChild(albumContainer);
    });
    
    document.querySelectorAll('.song-name').forEach(element => {
        element.addEventListener('click', function() {
            const songId = parseInt(this.dataset.songId);
            playSongById(songId);
        });
    });
}

// ============================================
// PLAY SONG BY ID
// ============================================

function playSongById(songId, rebuildQueue = true) {
    if (!state.songsData) return;
    
    let foundSong = null;
    let foundAlbum = null;
    
    for (const album of state.songsData.albums) {
        for (const song of album.songs) {
            if (song.id === songId) {
                foundSong = song;
                foundAlbum = album;
                break;
            }
        }
        if (foundSong) break;
    }
    
    if (!foundSong) {
        console.error('Song not found:', songId);
        return;
    }
    
    if (!state.player.audio) {
        state.player.audio = new Audio();
    }
    
    if (state.player.isPlaying) {
        state.player.audio.pause();
    }
    
    state.player.audio.src = `audio/${foundSong.audio}`;
    state.player.audio.load();
    state.player.audio.currentTime = 0;
    
    state.player.currentSong = foundSong;
    state.player.currentAlbum = foundAlbum;
    state.player.isPlaying = true;
    
    const currentSongName = document.getElementById('current-song-name');
    if (currentSongName) {
        currentSongName.textContent = foundSong.title;
    }
    
    const playIcon = document.getElementById('play-icon');
    if (playIcon) {
        playIcon.src = 'images/icons/pause.png';
    }
    
    state.player.audio.play().catch(error => {
        console.error('Error playing audio:', error);
    });
    
    // Set duration display
    const songDurationDisplay = document.getElementById('song-duration');
    if (songDurationDisplay && foundSong.duration) {
        songDurationDisplay.textContent = formatTime(foundSong.duration);
    }
    
    // Reset progress bar (border fill)
    const progressFill = document.getElementById('progress-border-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
    }
    
    // Reset dot position
    const progressDot = document.getElementById('progress-dot');
    if (progressDot) {
        progressDot.style.left = '0px';
    }
    
    updateLyrics(foundSong);
    startProgressUpdate();
    
    // Reset sync highlighting when new song starts
    if (state.lyrics.sync) {
        setTimeout(function() {
            updateSyncHighlight(0);
        }, 100);
    }
    
    // Only rebuild queue if this is a manual selection (not Previous/Next)
    if (rebuildQueue) {
        buildQueueWithStartingSong(foundSong);
    }
    
    localStorage.setItem('diljit_last_song', JSON.stringify({
        id: foundSong.id,
        title: foundSong.title,
        album: foundAlbum.name
    }));
    
    state.player.audio.onended = function() {
        handleSongEnded();
    };
    
    console.log('Now playing:', foundSong.title);
}

// ============================================
// BUILD QUEUE - FIXED: Sorts albums alphabetically
// ============================================

function buildQueue() {
    if (!state.songsData) return;
    
    // Get all songs in alphabetical order (by album name, then track number)
    let allSongs = [];
    state.songsData.albums.forEach(album => {
        album.songs.forEach(song => {
            allSongs.push({
                ...song,
                albumName: album.name
            });
        });
    });
    
    // Sort by album name (ignoring punctuation), then track number
    allSongs.sort((a, b) => {
        const cleanA = a.albumName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanB = b.albumName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        if (cleanA !== cleanB) {
            return cleanA.localeCompare(cleanB);
        }
        return a.track - b.track;
    });
    
    // If shuffle is on, shuffle the queue
    if (state.player.shuffle) {
        for (let i = allSongs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
        }
    }
    
    state.player.queue = allSongs;
    
    // Find the index of the current song in the queue
    if (state.player.currentSong) {
        state.player.currentIndex = state.player.queue.findIndex(
            song => song.id === state.player.currentSong.id
        );
        // If current song not found in queue (shouldn't happen), reset
        if (state.player.currentIndex === -1) {
            state.player.currentIndex = 0;
            state.player.currentSong = state.player.queue[0];
        }
    } else {
        state.player.currentIndex = 0;
        state.player.currentSong = state.player.queue[0];
    }
}

// ============================================
// BUILD QUEUE WITH STARTING SONG
// ============================================

function buildQueueWithStartingSong(startingSong) {
    if (!state.songsData) return;
    
    // Get all songs
    let allSongs = [];
    state.songsData.albums.forEach(album => {
        album.songs.forEach(song => {
            allSongs.push({
                ...song,
                albumName: album.name,
                releaseDate: album.releaseDate
            });
        });
    });
    
    // Sort based on current sort preference
    if (state.sortPreference === 'date') {
        // Sort by release date (newest first), then track number
        allSongs.sort((a, b) => {
            const dateA = new Date(a.releaseDate);
            const dateB = new Date(b.releaseDate);
            if (dateA.getTime() !== dateB.getTime()) {
                return dateB - dateA;
            }
            return a.track - b.track;
        });
    } else {
        // Sort by album name (ignoring punctuation), then track number
        allSongs.sort((a, b) => {
            const cleanA = a.albumName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            const cleanB = b.albumName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            if (cleanA !== cleanB) {
                return cleanA.localeCompare(cleanB);
            }
            return a.track - b.track;
        });
    }
    
    // If shuffle is on, shuffle the queue with starting song first
    if (state.player.shuffle) {
        // Find the starting song and remove it from the list
        const startIndex = allSongs.findIndex(song => song.id === startingSong.id);
        if (startIndex !== -1) {
            const [startSong] = allSongs.splice(startIndex, 1);
            
            // Shuffle the remaining songs
            for (let i = allSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
            }
            
            // Put the starting song at the beginning
            allSongs = [startSong, ...allSongs];
        } else {
            // Fallback - just shuffle normally
            for (let i = allSongs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allSongs[i], allSongs[j]] = [allSongs[j], allSongs[i]];
            }
        }
    } else {
        // Shuffle is OFF - reorder so selected song is first, then the rest in current sort order
        const startIndex = allSongs.findIndex(song => song.id === startingSong.id);
        if (startIndex !== -1) {
            const beforeSelected = allSongs.slice(0, startIndex);
            const selectedAndAfter = allSongs.slice(startIndex);
            allSongs = [...selectedAndAfter, ...beforeSelected];
        }
    }
    
    state.player.queue = allSongs;
    state.player.currentIndex = 0;
    state.player.currentSong = startingSong;
}

// ============================================
// HANDLE SONG ENDED - FIXED: Repeats same order
// ============================================

function handleSongEnded() {
    if (state.player.loop === 'single') {
        if (state.player.audio) {
            state.player.audio.currentTime = 0;
            state.player.audio.play();
        }
        return;
    }
    
    state.player.currentIndex++;
    
    if (state.player.currentIndex >= state.player.queue.length) {
        if (state.player.loop === 'on') {
            // Loop - go back to the start of the current queue
            state.player.currentIndex = 0;
        } else {
            // Loop is OFF - stop playback
            state.player.currentIndex = state.player.queue.length - 1;
            state.player.isPlaying = false;
            const playIcon = document.getElementById('play-icon');
            if (playIcon) {
                playIcon.src = 'images/icons/play.png';
            }
            return;
        }
    }
    
    const nextSong = state.player.queue[state.player.currentIndex];
    if (nextSong) {
        playSongById(nextSong.id, false); // Don't rebuild queue
    }
}

// ============================================
// UPDATE LYRICS
// ============================================

function updateLyrics(song) {
    const lyricsTitle = document.getElementById('lyrics-song-title');
    const lyricsText = document.getElementById('lyrics-text');
    
    if (lyricsTitle) {
        lyricsTitle.innerHTML = `<span class="lyrics-title-link" data-album="${state.player.currentAlbum ? state.player.currentAlbum.name : ''}" style="cursor:pointer; color: #158edd;">${song.title}</span>`;
    }
    
    if (lyricsText) {
        if (song.lyrics && song.lyrics !== 'Lyrics coming soon...') {
            const lines = song.lyrics.split('\n');
            let html = '';
            lines.forEach(line => {
                const timestampMatch = line.match(/^\[([\d.]+)\]\s*(.*)/);
                if (timestampMatch) {
                    const time = parseFloat(timestampMatch[1]);
                    const text = timestampMatch[2];
                    html += `<div class="lyrics-line" data-time="${time}">${text}</div>`;
                } else if (line.trim()) {
                    html += `<div class="lyrics-line">${line}</div>`;
                }
            });
            lyricsText.innerHTML = html || 'No lyrics available for this song.';
        } else {
            lyricsText.textContent = 'Lyrics coming soon...';
        }
    }
}

// ============================================
// LOAD LAST PLAYED SONG
// ============================================

function loadLastPlayedSong() {
    const lastSong = localStorage.getItem('diljit_last_song');
    if (lastSong) {
        try {
            const parsed = JSON.parse(lastSong);
            if (state.songsData) {
                for (const album of state.songsData.albums) {
                    for (const song of album.songs) {
                        if (song.id === parsed.id) {
                            const currentSongName = document.getElementById('current-song-name');
                            if (currentSongName) {
                                currentSongName.textContent = song.title;
                            }
                            state.player.currentSong = song;
                            state.player.currentAlbum = album;
                            updateLyrics(song);
                            break;
                        }
                    }
                    if (state.player.currentSong) break;
                }
            }
        } catch (e) {
            console.error('Error loading last song:', e);
        }
    }
}

function performSearch(query) {
    // If no songs data, return
    if (!state.songsData) return;
    
    // Store the search query (cleaned of punctuation)
    state.searchQuery = cleanText(query);
    
    // Re-display the library with the search filter
    displayLibrary(state.songsData);
}

// ============================================
// LYRICS
// ============================================

function setupLyrics() {
    const syncToggle = document.getElementById('sync-toggle');
    const lyricsContainer = document.getElementById('lyrics-container');
    
    if (syncToggle) {
        if (state.lyrics.sync) {
            syncToggle.classList.add('active');
            if (lyricsContainer) {
                lyricsContainer.classList.add('lyrics-sync-on');
            }
        }
        
        syncToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const isSyncOn = this.classList.contains('active');
            
            state.lyrics.sync = isSyncOn;
            saveLyricsState();
            
            if (isSyncOn) {
                lyricsContainer.classList.add('lyrics-sync-on');
                // Snap to the current active line
                const activeLine = document.querySelector('.lyrics-line.active');
                if (activeLine && lyricsContainer) {
                    const containerHeight = lyricsContainer.clientHeight;
                    const lineHeight = activeLine.offsetHeight;
                    const targetScroll = activeLine.offsetTop - (containerHeight / 2) + (lineHeight / 2);
                    smoothScrollTo(lyricsContainer, targetScroll, 300);
                }
            } else {
                lyricsContainer.classList.remove('lyrics-sync-on');
            }
        });
    }
    
    // Click handler for lyric lines (tap to seek) - only when sync is off
    if (lyricsContainer) {
        lyricsContainer.addEventListener('click', function(e) {
            // Only allow when sync is off
            if (state.lyrics.sync) return;
            
            const line = e.target.closest('.lyrics-line[data-time]');
            if (!line) return;
            
            const timeAttr = line.getAttribute('data-time');
            if (timeAttr === null || timeAttr === '') return;
            
            const time = parseFloat(timeAttr);
            if (isNaN(time)) return;
            
            // Jump to that position in the song
            if (state.player.audio) {
                state.player.audio.currentTime = time;
                updateProgress();
            }
        });
        
        // Block touch scrolling when sync is on
        lyricsContainer.addEventListener('touchmove', function(e) {
            if (state.lyrics.sync) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Block mouse wheel scrolling when sync is on
        lyricsContainer.addEventListener('wheel', function(e) {
            if (state.lyrics.sync) {
                e.preventDefault();
            }
        }, { passive: false });
    }
}

// ============================================
// GAMES (Placeholder)
// ============================================

function setupGames() {
    console.log('Games section loaded');
}

// ============================================
// PROGRESS BAR FUNCTIONS
// ============================================

let progressInterval = null;

function startProgressUpdate() {
    stopProgressUpdate();
    progressInterval = setInterval(updateProgress, 500);
}

function stopProgressUpdate() {
    if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
    }
}

function updateProgress() {
    const audio = state.player.audio;
    if (!audio) return;
    
    const currentTime = audio.currentTime || 0;
    const duration = audio.duration || 0;
    
    const currentTimeDisplay = document.getElementById('current-time');
    const songDurationDisplay = document.getElementById('song-duration');
    const progressFill = document.getElementById('progress-border-fill');
    const progressDot = document.getElementById('progress-dot');
    const progressWrapper = document.getElementById('progress-wrapper');
    
    // Update time displays
    if (currentTimeDisplay) {
        currentTimeDisplay.textContent = formatTime(currentTime);
    }
    
    if (songDurationDisplay && duration > 0) {
        songDurationDisplay.textContent = formatTime(duration);
    }
    
    // Update progress bar fill
    if (progressFill && duration > 0) {
        const percentage = (currentTime / duration) * 100;
        progressFill.style.width = percentage + '%';
    }
    
    // Update dot position relative to wrapper
    if (progressDot && progressWrapper && duration > 0) {
        const percentage = (currentTime / duration) * 100;
        const wrapperWidth = progressWrapper.offsetWidth;
        const dotLeft = (percentage / 100) * wrapperWidth;
        progressDot.style.left = dotLeft + 'px';
        
        // Show dot when a song is playing
        if (state.player.isPlaying) {
            progressDot.classList.add('visible');
        }
    }
    
    // Always update the active lyric highlight (blue line)
    updateSyncHighlight(currentTime);
}

function updateSyncHighlight(currentTime) {
    const lyricsLines = document.querySelectorAll('.lyrics-line[data-time]');
    if (!lyricsLines.length) return;
    
    let activeIndex = 0;
    let latestTime = -1;
    
    // Find the line with the largest timestamp that is <= currentTime
    for (let i = 0; i < lyricsLines.length; i++) {
        const timeAttr = lyricsLines[i].getAttribute('data-time');
        if (timeAttr === null || timeAttr === '') continue;
        
        const lineTime = parseFloat(timeAttr);
        if (isNaN(lineTime)) continue;
        
        if (lineTime <= currentTime && lineTime > latestTime) {
            latestTime = lineTime;
            activeIndex = i;
        }
    }
    
    // Only update if the active line has actually changed
    const currentActive = document.querySelector('.lyrics-line.active');
    const newActive = lyricsLines[activeIndex];
    
    if (currentActive === newActive) {
        return; // No change, do nothing
    }
    
    // Remove active class from all lines
    lyricsLines.forEach(line => line.classList.remove('active'));
    
    // Add active class to the found line (always, regardless of sync state)
    if (newActive) {
        newActive.classList.add('active');
        
        // Only auto-scroll when sync is on
        if (state.lyrics.sync) {
            const container = document.getElementById('lyrics-container');
            if (container) {
                const containerHeight = container.clientHeight;
                const lineHeight = newActive.offsetHeight;
                const targetScroll = newActive.offsetTop - (containerHeight / 2) + (lineHeight / 2);
                smoothScrollTo(container, targetScroll, 300);
            }
        }
    }
}

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function cleanText(text) {
    return text.toLowerCase()
        .replace(/&/g, 'and')       // Convert & to 'and'
        .replace(/and/g, '')        // Remove ALL 'and' (so blackandwhite becomes blackwhite)
        .replace(/[^a-z0-9]/g, ''); // Remove everything else
}

function smoothScrollTo(element, target, duration) {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();
    
    // Cancel any existing scroll animation
    if (element._scrollAnimation) {
        cancelAnimationFrame(element._scrollAnimation);
    }
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out for smooth feel
        const ease = progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        element.scrollTop = start + (change * ease);
        
        if (progress < 1) {
            element._scrollAnimation = requestAnimationFrame(animate);
        } else {
            element._scrollAnimation = null;
        }
    }
    
    element._scrollAnimation = requestAnimationFrame(animate);
}

// ============================================
// DRAGGABLE PROGRESS DOT
// ============================================

function setupDraggableDot() {
    const progressDot = document.getElementById('progress-dot');
    const progressFill = document.getElementById('progress-border-fill');
    
    if (!progressDot) return;
    
    let isDragging = false;
    
    // Mouse events - ONLY on the dot itself
    progressDot.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events - ONLY on the dot itself
    progressDot.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('touchmove', onDragTouch, { passive: false });
    document.addEventListener('touchend', endDragTouch);
    
    // Prevent click on dot from triggering anything else
    progressDot.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    function startDrag(e) {
        if (!state.player.audio || !state.player.audio.duration) return;
        isDragging = true;
        progressDot.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    function startDragTouch(e) {
        if (!state.player.audio || !state.player.audio.duration) return;
        isDragging = true;
        const touch = e.touches[0];
        updatePosition(touch.clientX);
        e.preventDefault();
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        updatePosition(e.clientX);
        e.preventDefault();
    }
    
    function onDragTouch(e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        updatePosition(touch.clientX);
        e.preventDefault();
    }
    
    function endDrag() {
        if (isDragging) {
            isDragging = false;
            progressDot.style.cursor = 'grab';
        }
    }
    
    function endDragTouch() {
        if (isDragging) {
            isDragging = false;
        }
    }
    
    function updatePosition(clientX) {
        const duration = state.player.audio.duration || 0;
        if (!duration) return;
        
        // Get the position relative to the wrapper
        const wrapper = document.getElementById('progress-wrapper');
        if (!wrapper) return;
        
        const rect = wrapper.getBoundingClientRect();
        const x = clientX - rect.left;
        const width = rect.width;
        const percentage = Math.max(0, Math.min(1, x / width));
        
        const newTime = percentage * duration;
        state.player.audio.currentTime = newTime;
        
        // Update progress fill
        if (progressFill) {
            progressFill.style.width = (percentage * 100) + '%';
        }
        
        // Update dot position
        const dotLeft = percentage * width;
        progressDot.style.left = dotLeft + 'px';
        
        // Update time display
        const currentTimeDisplay = document.getElementById('current-time');
        if (currentTimeDisplay) {
            currentTimeDisplay.textContent = formatTime(newTime);
        }
    }
}

// ============================================
// PLAYER CONTROLS
// ============================================

function setupPlayerControls() {
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const shuffleIcon = document.getElementById('shuffle-icon');
    const loopBtn = document.getElementById('loop-btn');
    const loopIcon = document.getElementById('loop-icon');
    const currentSongName = document.getElementById('current-song-name');
    const currentTimeDisplay = document.getElementById('current-time');
    const songDurationDisplay = document.getElementById('song-duration');
    const progressFilled = document.getElementById('progress-filled');
    const progressDot = document.getElementById('progress-dot');
    const progressContainer = document.getElementById('progress-container');
    
    if (currentSongName) {
        currentSongName.textContent = '-';
    }
    
    if (shuffleIcon) {
        if (state.player.shuffle) {
            shuffleIcon.src = 'images/icons/shuffle-on.png';
        } else {
            shuffleIcon.src = 'images/icons/shuffle-off.png';
        }
    }
    
    if (loopIcon) {
        switch(state.player.loop) {
            case 'off':
                loopIcon.src = 'images/icons/loop-off.png';
                break;
            case 'on':
                loopIcon.src = 'images/icons/loop-on.png';
                break;
            case 'single':
                loopIcon.src = 'images/icons/loop-single.png';
                break;
        }
    }
    
    if (playBtn && playIcon) {
        playBtn.addEventListener('click', function() {
            if (!state.player.currentSong) {
                showAlert('Please select a song from the Library first.');
                return;
            }
            
            state.player.isPlaying = !state.player.isPlaying;
            
            if (state.player.isPlaying) {
                state.player.audio.play();
                playIcon.src = 'images/icons/pause.png';
                startProgressUpdate();
            } else {
                state.player.audio.pause();
                playIcon.src = 'images/icons/play.png';
                stopProgressUpdate();
            }
        });
    }
    
    if (shuffleBtn && shuffleIcon) {
        shuffleBtn.addEventListener('click', function() {
            state.player.shuffle = !state.player.shuffle;
            savePlayerState();
            
            if (state.player.shuffle) {
                shuffleIcon.src = 'images/icons/shuffle-on.png';
            } else {
                shuffleIcon.src = 'images/icons/shuffle-off.png';
            }
            
            // Rebuild queue with current song as starting point (if shuffle ON)
            // or rebuild in album order (if shuffle OFF)
            if (state.player.currentSong) {
                buildQueueWithStartingSong(state.player.currentSong);
            } else {
                buildQueue();
            }
        });
    }
    
    if (loopBtn && loopIcon) {
        loopBtn.addEventListener('click', function() {
            const loopStates = ['off', 'on', 'single'];
            const currentIndex = loopStates.indexOf(state.player.loop);
            const nextIndex = (currentIndex + 1) % loopStates.length;
            state.player.loop = loopStates[nextIndex];
            savePlayerState();
            
            switch(state.player.loop) {
                case 'off':
                    loopIcon.src = 'images/icons/loop-off.png';
                    break;
                case 'on':
                    loopIcon.src = 'images/icons/loop-on.png';
                    break;
                case 'single':
                    loopIcon.src = 'images/icons/loop-single.png';
                    break;
            }
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            // If single loop is on, restart the current song
            if (state.player.loop === 'single') {
                if (state.player.audio) {
                    state.player.audio.currentTime = 0;
                    if (!state.player.isPlaying) {
                        state.player.audio.play();
                        state.player.isPlaying = true;
                        const playIcon = document.getElementById('play-icon');
                        if (playIcon) {
                            playIcon.src = 'images/icons/pause.png';
                        }
                    }
                }
                return;
            }
            
            if (!state.player.queue.length) {
                buildQueue();
            }
            
            state.player.currentIndex--;
            if (state.player.currentIndex < 0) {
                state.player.currentIndex = state.player.queue.length - 1;
            }
            
            const prevSong = state.player.queue[state.player.currentIndex];
            if (prevSong) {
                playSongById(prevSong.id, false); // Don't rebuild queue
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            // If single loop is on, restart the current song
            if (state.player.loop === 'single') {
                if (state.player.audio) {
                    state.player.audio.currentTime = 0;
                    if (!state.player.isPlaying) {
                        state.player.audio.play();
                        state.player.isPlaying = true;
                        const playIcon = document.getElementById('play-icon');
                        if (playIcon) {
                            playIcon.src = 'images/icons/pause.png';
                        }
                    }
                }
                return;
            }
            
            if (!state.player.queue.length) {
                buildQueue();
            }
            
            state.player.currentIndex++;
            if (state.player.currentIndex >= state.player.queue.length) {
                if (state.player.loop === 'on') {
                    state.player.currentIndex = 0;
                } else {
                    state.player.currentIndex = state.player.queue.length - 1;
                    return;
                }
            }
            
            const nextSong = state.player.queue[state.player.currentIndex];
            if (nextSong) {
                playSongById(nextSong.id, false); // Don't rebuild queue
            }
        });
    }
    
    if (rewindBtn) {
        rewindBtn.addEventListener('click', function() {
            if (!state.player.audio) return;
            const newTime = Math.max(0, state.player.audio.currentTime - state.settings.rewindSeconds);
            state.player.audio.currentTime = newTime;
            // Update progress bar immediately
            updateProgress();
            console.log(`Rewind ${state.settings.rewindSeconds} seconds to ${newTime}s`);
        });
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener('click', function() {
            if (!state.player.audio) return;
            const duration = state.player.audio.duration || 0;
            const newTime = Math.min(duration, state.player.audio.currentTime + state.settings.forwardSeconds);
            state.player.audio.currentTime = newTime;
            // Update progress bar immediately
            updateProgress();
            console.log(`Forward ${state.settings.forwardSeconds} seconds to ${newTime}s`);
        });
    }
}

// ============================================
// SCROLL POSITION TRACKING
// ============================================

function setupScrollTracking() {
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        const savedPos = state.scrollPositions.home || 0;
        window.scrollTo(0, savedPos);
        
        window.addEventListener('scroll', function() {
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/mobile/') {
                state.scrollPositions.home = window.scrollY;
            }
        });
    }
    
    if (window.location.pathname.includes('main.html')) {
        const sections = ['games', 'library', 'lyrics'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (section.classList.contains('active')) {
                                const savedPos = state.scrollPositions[sectionId] || 0;
                                window.scrollTo(0, savedPos);
                            } else {
                                state.scrollPositions[sectionId] = window.scrollY;
                            }
                        }
                    });
                });
                
                observer.observe(section, { attributes: true });
            }
        });
        
        window.addEventListener('scroll', function() {
            const activeSection = document.querySelector('.page-section.active');
            if (activeSection) {
                const sectionId = activeSection.id;
                state.scrollPositions[sectionId] = window.scrollY;
            }
        });
    }
    
    if (window.location.pathname.includes('settings.html')) {
        const savedPos = state.scrollPositions.settings || 0;
        window.scrollTo(0, savedPos);
        
        window.addEventListener('scroll', function() {
            state.scrollPositions.settings = window.scrollY;
        });
    }
}

// ============================================
// LOAD SONGS FROM JSON
// ============================================

function loadSongs() {
    return fetch('data/songs.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load songs.json');
            }
            return response.json();
        })
        .then(data => {
            state.songsData = data;
            console.log('Songs loaded successfully:', data.albums.length, 'albums');
            return data;
        })
        .catch(error => {
            console.error('Error loading songs:', error);
            return null;
        });
}

// ============================================
// EXPOSE STATE FOR DEBUGGING
// ============================================

window.__state = state;
