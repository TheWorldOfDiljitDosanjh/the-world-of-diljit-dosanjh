// ============================================
// MOBILE VERSION - SCRIPT.JS
// ============================================

// ============================================
// GLOBAL STATE
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
                alert('Please enter your name.');
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
    loadLastPlayedSong();
    
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
// LIBRARY
// ============================================

function setupLibrary() {
    const savedSearchPref = localStorage.getItem('diljit_search_pref');
    if (savedSearchPref) {
        state.searchPreference = savedSearchPref;
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
    
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const searchTypeLabel = document.getElementById('search-type-label');
    
    const savedPref = localStorage.getItem('diljit_search_pref');
    if (savedPref) {
        state.searchPreference = savedPref;
    }
    
    if (searchTypeLabel) {
        if (state.searchPreference === 'album') {
            searchTypeLabel.textContent = 'Search by album';
        } else {
            searchTypeLabel.textContent = 'Search by song';
        }
    }
        
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', function() {
            dropdownMenu.classList.remove('show');
        });
        
        dropdownMenu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function() {
                const type = this.dataset.searchType;
                state.searchPreference = type;
                localStorage.setItem('diljit_search_pref', type);
                
                if (searchTypeLabel) {
                    searchTypeLabel.textContent = type === 'song' ? 'Search by song' : 'Search by album';
                }
                
                dropdownMenu.classList.remove('show');
                
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    performSearch(searchInput.value);
                }
            });
        });
    }
    
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
    
    const sortedAlbums = [...data.albums].sort((a, b) => {
        const cleanA = a.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        const cleanB = b.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return cleanA.localeCompare(cleanB);
    });
    
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
    
    updateLyrics(foundSong);
    
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
        // Shuffle is OFF - reorder so selected song is first, then the rest in album order
        const startIndex = allSongs.findIndex(song => song.id === startingSong.id);
        if (startIndex !== -1) {
            // Split the array at the startIndex
            // Take the selected song and everything after it, then wrap around to the beginning
            const beforeSelected = allSongs.slice(0, startIndex);
            const selectedAndAfter = allSongs.slice(startIndex);
            // Rebuild: selected + everything after it + everything before it
            allSongs = [...selectedAndAfter, ...beforeSelected];
        }
    }
    // If shuffle is OFF, allSongs stays in sorted album order
    
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
        lyricsTitle.textContent = song.title;
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
    console.log('Searching for:', query);
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
            } else {
                lyricsContainer.classList.remove('lyrics-sync-on');
            }
        });
    }
}

// ============================================
// GAMES (Placeholder)
// ============================================

function setupGames() {
    console.log('Games section loaded');
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
                alert('Please select a song from the Library first.');
                return;
            }
            
            state.player.isPlaying = !state.player.isPlaying;
            
            if (state.player.isPlaying) {
                state.player.audio.play();
                playIcon.src = 'images/icons/pause.png';
            } else {
                state.player.audio.pause();
                playIcon.src = 'images/icons/play.png';
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
            console.log(`Rewind ${state.settings.rewindSeconds} seconds to ${newTime}s`);
        });
    }
    
    if (forwardBtn) {
        forwardBtn.addEventListener('click', function() {
            if (!state.player.audio) return;
            const duration = state.player.audio.duration || 0;
            const newTime = Math.min(duration, state.player.audio.currentTime + state.settings.forwardSeconds);
            state.player.audio.currentTime = newTime;
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
