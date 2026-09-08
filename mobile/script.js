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
        currentIndex: -1,
        isPlaying: false,
        position: 0,
        queue: [],
        shuffle: true,
        loop: 'on' // 'off', 'on', 'single'
    },
    lyrics: {
        sync: false
    },
    isFirstVisit: true,
    currentPage: 'games', // 'games', 'library', 'lyrics'
    searchPreference: 'song',
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
    
    // Check if it's first visit - THIS MUST RUN FIRST
    checkFirstVisit();
    
    // Initialize settings
    loadSettings();
    
    // Load player state
    loadPlayerState();
    
    // Load lyrics state
    loadLyricsState();
    
    // Apply theme
    applyTheme();
    
    // Setup navigation
    setupNavigation();
    
    // Setup settings page if on settings.html
    if (window.location.pathname.includes('settings.html')) {
        setupSettingsPage();
    }
    
    // Setup main page if on main.html
    if (window.location.pathname.includes('main.html')) {
        setupMainPage();
    }
    
    // Setup home page if on index.html
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/mobile/') {
        setupHomePage();
    }
    
    // Setup scroll position tracking
    setupScrollTracking();
    
    // Show the dot in the correct position on page load
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
        // Allow access to all pages
    } else {
        state.isFirstVisit = true;
        
        // If NOT on settings page, redirect to settings
        if (!isSettingsPage) {
            window.location.href = 'settings.html';
            return; // Stop execution
        }
    }
}

// ============================================
// PLAYER STATE MANAGEMENT
// ============================================

function loadPlayerState() {
    // Load shuffle state
    const shuffleSaved = localStorage.getItem('diljit_shuffle');
    if (shuffleSaved !== null) {
        state.player.shuffle = shuffleSaved === 'true';
    }
    
    // Load loop state
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
    
    // For main.html, handle section switching
    if (currentPath.includes('main.html')) {
        const hash = window.location.hash || '#games';
        switchMainSection(hash.replace('#', ''));
        
        // Listen for hash changes
        window.addEventListener('hashchange', function() {
            const newHash = window.location.hash.replace('#', '');
            switchMainSection(newHash);
        });
    }
    
    // For index.html, set home as active
    if (currentPath.includes('index.html') || currentPath === '/' || currentPath === '/mobile/') {
        const homeLink = document.querySelector('.nav-item[data-page="home"]');
        if (homeLink) {
            homeLink.classList.add('active-text');
        }
        setTimeout(updateDotPosition, 10);
    }
    
    // For settings.html, set settings as active
    if (currentPath.includes('settings.html')) {
        const settingsLink = document.querySelector('.nav-item[data-page="settings"]');
        if (settingsLink) {
            settingsLink.classList.add('active-text');
        }
        setTimeout(updateDotPosition, 10);
    }
}

function switchMainSection(section) {
    // Remove active from all sections
    document.querySelectorAll('.page-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Remove active-text from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active-text');
    });
    
    // Activate the selected section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentPage = section;
        
        // Update header nav - ALL items use active-text now
        const navLinks = document.querySelectorAll('.nav-item[data-page]');
        navLinks.forEach(link => {
            if (link.dataset.page === section) {
                link.classList.add('active-text');
            }
        });
        
        // Update dot position (animates between Games/Library/Lyrics)
        updateDotPosition();
        
        // Restore scroll position for this section
        const savedPos = state.scrollPositions[section] || 0;
        setTimeout(() => {
            window.scrollTo(0, savedPos);
        }, 50);
    }
}

// ============================================
// DOT POSITION - ONLY ANIMATES ON MAIN PAGE SECTIONS
// ============================================

function updateDotPosition() {
    const slider = document.getElementById('slider-dot');
    if (!slider) return;
    
    // Find which page is currently active (has active-text class)
    const activeNav = document.querySelector('.nav-item.active-text');
    if (!activeNav) {
        slider.classList.remove('visible');
        return;
    }
    
    // Get the current page
    const currentPage = activeNav.dataset.page;
    
    // Only animate for Games, Library, Lyrics (they're on the same page)
    // For Home and Settings, just show the dot instantly with no animation
    const animatePages = ['games', 'library', 'lyrics'];
    const shouldAnimate = animatePages.includes(currentPage);
    
    // Get position of the active nav item
    const navRect = activeNav.getBoundingClientRect();
    const navParentRect = activeNav.closest('nav').getBoundingClientRect();
    
    // Calculate position relative to nav
    const left = navRect.left - navParentRect.left + (navRect.width / 2) - 3; // Center the dot (6px wide, so offset by 3px)
    
    // Apply to slider
    slider.style.left = left + 'px';
    slider.classList.add('visible');
    
    // If it's an animate page, ensure transition is enabled
    // If it's Home or Settings, disable transition for instant jump
    if (!shouldAnimate) {
        slider.style.transition = 'none';
        // Force reflow, then re-enable transition
        void slider.offsetHeight;
        slider.style.transition = 'left 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
}

// ============================================
// SETTINGS PAGE
// ============================================

function setupSettingsPage() {
    // Populate fields with saved settings
    const nameInput = document.getElementById('user-name');
    const themeToggle = document.getElementById('theme-toggle');
    const serviceBtns = document.querySelectorAll('.service-btn');
    const rewindBtns = document.querySelectorAll('#rewind-setting .sec-btn');
    const forwardBtns = document.querySelectorAll('#forward-setting .sec-btn');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-settings');
    
    // Set name
    if (nameInput && state.settings.name) {
        nameInput.value = state.settings.name;
    }
    
    // Set theme toggle
    if (themeToggle) {
        if (state.settings.theme === 'dark') {
            themeToggle.classList.add('active');
        } else {
            themeToggle.classList.remove('active');
        }
    }
    
    // Set service
    serviceBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.service === state.settings.musicService) {
            btn.classList.add('active');
        }
    });
    
    // Set rewind
    rewindBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.seconds) === state.settings.rewindSeconds) {
            btn.classList.add('active');
        }
    });
    
    // Set forward
    forwardBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.seconds) === state.settings.forwardSeconds) {
            btn.classList.add('active');
        }
    });
    
    // Show help boxes only on first visit
    if (state.isFirstVisit) {
        document.querySelectorAll('.help-box').forEach(box => {
            box.classList.add('visible');
        });
    }
    
    // Event Listeners
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const isDark = this.classList.contains('active');
            state.settings.theme = isDark ? 'dark' : 'light';
            applyTheme();
            saveSettings();
        });
    }
    
    // Service buttons
    serviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            serviceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.settings.musicService = this.dataset.service;
            saveSettings();
        });
    });
    
    // Rewind buttons
    rewindBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            rewindBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.settings.rewindSeconds = parseInt(this.dataset.seconds);
            saveSettings();
        });
    });
    
    // Forward buttons
    forwardBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            forwardBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            state.settings.forwardSeconds = parseInt(this.dataset.seconds);
            saveSettings();
        });
    });
    
    // Save button - THIS redirects to home
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            // Get name
            const nameVal = nameInput ? nameInput.value.trim() : '';
            if (!nameVal) {
                alert('Please enter your name.');
                return;
            }
            
            state.settings.name = nameVal;
            saveSettings();
            
            // Mark as visited
            localStorage.setItem('diljit_visited', 'true');
            state.isFirstVisit = false;
            
            // Redirect to home
            window.location.href = 'index.html';
        });
    }
    
    // Reset button
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                // Clear all localStorage
                localStorage.clear();
                
                // Reset state
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
                
                // Reload page to show first visit state
                window.location.reload();
            }
        });
    }
}

// ============================================
// HOME PAGE
// ============================================

function setupHomePage() {
    // Display user name - no blue color
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay && state.settings.name) {
        nameDisplay.textContent = state.settings.name;
    }
}

// ============================================
// MAIN PAGE
// ============================================

function setupMainPage() {
    // Setup library
    setupLibrary();
    
    // Setup lyrics
    setupLyrics();
    
    // Setup games (placeholder)
    setupGames();
    
    // Setup player controls
    setupPlayerControls();
}

// ============================================
// LIBRARY
// ============================================

function setupLibrary() {
    // Load search preference
    const savedSearchPref = localStorage.getItem('diljit_search_pref');
    if (savedSearchPref) {
        state.searchPreference = savedSearchPref;
    }
    
    // Setup playlist link based on music service
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
    
    // Setup dropdown
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const searchTypeLabel = document.getElementById('search-type-label');
    
    // Force load the preference from localStorage again to be safe
    const savedPref = localStorage.getItem('diljit_search_pref');
    if (savedPref) {
        state.searchPreference = savedPref;
    }
    
    // Set the label to saved preference on load
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
                
                // Trigger search
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    performSearch(searchInput.value);
                }
            });
        });
    }
    
    // Setup search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            performSearch(this.value);
        });
    }
}

function performSearch(query) {
    // This will be implemented when songs.json is loaded
    console.log('Searching for:', query);
    // TODO: Load songs.json and filter
}

// ============================================
// LYRICS
// ============================================

function setupLyrics() {
    const syncToggle = document.getElementById('sync-toggle');
    const lyricsContainer = document.getElementById('lyrics-container');
    
    if (syncToggle) {
        // Restore sync state
        if (state.lyrics.sync) {
            syncToggle.classList.add('active');
            if (lyricsContainer) {
                lyricsContainer.classList.add('lyrics-sync-on');
            }
        }
        
        syncToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            const isSyncOn = this.classList.contains('active');
            
            // Update state
            state.lyrics.sync = isSyncOn;
            saveLyricsState();
            
            if (isSyncOn) {
                lyricsContainer.classList.add('lyrics-sync-on');
                // TODO: Enable sync scrolling
            } else {
                lyricsContainer.classList.remove('lyrics-sync-on');
                // TODO: Disable sync scrolling
            }
        });
    }
}

// ============================================
// GAMES (Placeholder)
// ============================================

function setupGames() {
    // Games will be implemented later
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
    
    // Default state - empty
    currentSongName.textContent = '-';
    
    // Restore shuffle state
    if (shuffleIcon) {
        if (state.player.shuffle) {
            shuffleIcon.src = 'images/icons/shuffle-on.png';
        } else {
            shuffleIcon.src = 'images/icons/shuffle-off.png';
        }
    }
    
    // Restore loop state
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
    
    // Play/Pause
    if (playBtn && playIcon) {
        playBtn.addEventListener('click', function() {
            if (!state.player.currentSong) {
                alert('Please select a song from the Library first.');
                return;
            }
            
            state.player.isPlaying = !state.player.isPlaying;
            
            if (state.player.isPlaying) {
                playIcon.src = 'images/icons/pause.png';
                // TODO: Start audio playback
            } else {
                playIcon.src = 'images/icons/play.png';
                // TODO: Pause audio playback
            }
        });
    }
    
    // Shuffle
    if (shuffleBtn && shuffleIcon) {
        shuffleBtn.addEventListener('click', function() {
            state.player.shuffle = !state.player.shuffle;
            savePlayerState();
            
            if (state.player.shuffle) {
                shuffleIcon.src = 'images/icons/shuffle-on.png';
                // TODO: Shuffle queue
            } else {
                shuffleIcon.src = 'images/icons/shuffle-off.png';
                // TODO: Restore alphabetical queue
            }
        });
    }
    
    // Loop
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
    
    // Previous
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            // Check if single song loop is on - block navigation
            if (state.player.loop === 'single') {
                alert('Single song loop is on. Turn off to play the previous song.');
                return;
            }
            // TODO: Previous song in queue
            console.log('Previous song');
        });
    }
    
    // Next
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            // Check if single song loop is on - block navigation
            if (state.player.loop === 'single') {
                alert('Single song loop is on. Turn off to play the next song.');
                return;
            }
            // TODO: Next song in queue
            console.log('Next song');
        });
    }
    
    // Rewind
    if (rewindBtn) {
        rewindBtn.addEventListener('click', function() {
            console.log(`Rewind ${state.settings.rewindSeconds} seconds`);
            // TODO: Rewind audio by rewindSeconds
        });
    }
    
    // Forward
    if (forwardBtn) {
        forwardBtn.addEventListener('click', function() {
            console.log(`Forward ${state.settings.forwardSeconds} seconds`);
            // TODO: Forward audio by forwardSeconds
        });
    }
}

// ============================================
// SCROLL POSITION TRACKING
// ============================================

function setupScrollTracking() {
    // Track scroll position on home page
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        // Restore scroll position
        const savedPos = state.scrollPositions.home || 0;
        window.scrollTo(0, savedPos);
        
        // Save on scroll
        window.addEventListener('scroll', function() {
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname === '/mobile/') {
                state.scrollPositions.home = window.scrollY;
            }
        });
    }
    
    // Track scroll on main page sections
    if (window.location.pathname.includes('main.html')) {
        // Save scroll positions when switching sections
        const sections = ['games', 'library', 'lyrics'];
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                // Restore scroll position when section becomes active
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                            if (section.classList.contains('active')) {
                                const savedPos = state.scrollPositions[sectionId] || 0;
                                window.scrollTo(0, savedPos);
                            } else {
                                // Save position when leaving
                                state.scrollPositions[sectionId] = window.scrollY;
                            }
                        }
                    });
                });
                
                observer.observe(section, { attributes: true });
            }
        });
        
        // Also save on scroll
        window.addEventListener('scroll', function() {
            const activeSection = document.querySelector('.page-section.active');
            if (activeSection) {
                const sectionId = activeSection.id;
                state.scrollPositions[sectionId] = window.scrollY;
            }
        });
    }
    
    // Track settings page scroll
    if (window.location.pathname.includes('settings.html')) {
        const savedPos = state.scrollPositions.settings || 0;
        window.scrollTo(0, savedPos);
        
        window.addEventListener('scroll', function() {
            state.scrollPositions.settings = window.scrollY;
        });
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Placeholder for loading songs.json
function loadSongs() {
    // Will be implemented when songs.json is ready
    console.log('Loading songs...');
}

// ============================================
// EXPOSE STATE FOR DEBUGGING (Optional)
// ============================================

window.__state = state;
