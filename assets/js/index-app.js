/**
 * Index Page Application Logic - 声音疗愈应用主页逻辑
 * 从 index.html 提取的内联JavaScript
 *
 * @author Sound Healing Team
 * @version 2.0.0
 * @date 2025-10-01
 */

// ==========================================================================
// 全局变量声明
// ==========================================================================

console.log('Script starting...');

// Global i18n reference
let I18N_SYSTEM = null;

// Global Variables
let currentCategory = null;
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffleMode = false;
let isRepeatMode = false;
let sleepTimer = null;
const audio = new Audio();
let tracks = [];
const MAX_RECOMMENDATION_INIT_ATTEMPTS = 20;
let recommendationsRenderTimer = null;
const MOBILE_PLAYER_QUERY = (typeof window !== 'undefined' && typeof window.matchMedia === 'function')
    ? window.matchMedia('(max-width: 768px)')
    : null;

// Initialize audio settings
audio.volume = 0.7; // Default volume
audio.playbackRate = 1.0; // Default playback speed
audio.preload = 'auto';

console.log('Variables declared successfully');

// Helper function to get full URL for a file (using AUDIO_CONFIG)
function getAudioUrl(categoryKey, filename) {
    if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories[categoryKey]) {
        const category = AUDIO_CONFIG.categories[categoryKey];
        const folderName = category.folder || categoryKey.toLowerCase().replace(/\s+/g, '-');
        return `${AUDIO_CONFIG.baseUrl}${folderName}/${encodeURIComponent(filename)}`;
    }
    return null;
}

// Fallback Audio Data (in case external config fails to load)
const audioData = {
    meditation: [
        { name: '深度冥想引导', url: './assets/audio/meditation/深度冥想引导.mp3' },
        { name: '呼吸冥想练习', url: './assets/audio/meditation/呼吸冥想练习.mp3' },
        { name: '正念冥想', url: './assets/audio/meditation/正念冥想.mp3' }
    ],
    nature: [
        { name: '森林鸟鸣', url: './assets/audio/Animal sounds/森林鸟鸣.mp3' },
        { name: '海浪声', url: './assets/audio/running water/海浪声.mp3' },
        { name: '溪流声', url: './assets/audio/running water/溪流声.mp3' }
    ],
    rain: [
        { name: '轻柔雨声', url: './assets/audio/Rain/轻柔雨声.mp3' },
        { name: '雷雨声', url: './assets/audio/Rain/雷雨声.mp3' },
        { name: '雨夜声音', url: './assets/audio/Rain/雨夜声音.mp3' }
    ],
    singing: [
        { name: '颂钵冥想', url: './assets/audio/Singing bowl sound/颂钵冥想.mp3' },
        { name: 'Tibetan Singing Bowl', url: './assets/audio/Singing bowl sound/Tibetan%20Singing%20Bowl.mp3' },
        { name: 'Chakra Healing', url: './assets/audio/Singing bowl sound/Chakra%20Healing.mp3' }
    ]
};

const categoryInfo = {
    meditation: { name: 'ڤ������', icon: '🧘', desc: '��ȷ��ɣ�����ƽ��' },
    nature: { name: '��Ȼ֮��', icon: '🌿', desc: '���ﻨ�㣬��ˮ����' },
    rain: { name: '����ϵ��', icon: '🌧️', desc: '���Ž�����������' },
    singing: { name: '�̲�����', icon: '🔔', desc: '����������ƽ������' }
};

const categoryPresentations = {
    'Animal sounds': {
        badge: 'Forest Pulse',
        label: 'Bio Acoustic',
        tagline: 'Alpha Calm Bloom',
        accent: '#58f5c3'
    },
    'Fire': {
        badge: 'Warm Focus',
        label: 'Ember Flow',
        tagline: '200% Deep Heat Care',
        accent: '#ff8a65'
    },
    'hypnosis': {
        badge: 'Dream Lab',
        label: 'Subconscious Drift',
        tagline: 'Guided REM Reset',
        accent: '#a066ff'
    },
    'meditation': {
        badge: 'Zen Studio',
        label: 'Breathing Field',
        tagline: 'Mindful Bio-Sync',
        accent: '#7bdcb5'
    },
    'Rain': {
        badge: 'Cloud Core',
        label: 'Rain Sanctuary',
        tagline: 'Delta Sleep Engine',
        accent: '#5ec8ff'
    },
    'running water': {
        badge: 'Flow State',
        label: 'Liquid Focus',
        tagline: 'Hydro Memory Boost',
        accent: '#63f5ff'
    },
    'Singing bowl sound': {
        badge: 'Resonance Lab',
        label: 'Tibetan Bloom',
        tagline: 'Gamma Chakra Align',
        accent: '#f7b1ff'
    },
    'Chakra': {
        badge: 'Energy Grid',
        label: 'Chakra Align',
        tagline: 'Multi-tone Balance',
        accent: '#ff7de9'
    },
    'Subconscious Therapy': {
        badge: 'Mind Lab',
        label: 'Deep Therapy',
        tagline: 'Neuro Reset Mode',
        accent: '#a3b1ff'
    }
};

const DEFAULT_SLEEP_SESSION = {
    categoryKey: 'Rain',
    fileName: '小雨 入眠 助眠，学习，冥想，放松.mp3',
    fallbackTitle: 'Sleep Warm Rain · 15 min',
    fallbackTags: '#sleep #beginner #try-tonight',
    fallbackDesc: 'A gentle, voice-free rain track to slow your mind before bed.',
    badge: 'Official recommendation',
    duration: '15:00'
};
function getAvailableCategoryEntries() {
    if (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories) {
        return Object.entries(AUDIO_CONFIG.categories);
    }
    return Object.entries(categoryInfo);
}

function getCategoryDisplayName(key, category) {
    if (category.nameKey) {
        return getText(category.nameKey, category.name || categoryInfo[key]?.name || key);
    }
    const ecoKey = `ecosystem.${key}.name`;
    const fallbackKey = `category.${key}`;
    return getText(ecoKey, getText(fallbackKey, category.name || categoryInfo[key]?.name || key));
}

function getCategoryDescription(key, category) {
    return getText(`ecosystem.${key}.desc`, category.description || categoryInfo[key]?.desc || '');
}

function getDefaultSessionConfig() {
    return {
        categoryKey: DEFAULT_SLEEP_SESSION.categoryKey,
        fileName: DEFAULT_SLEEP_SESSION.fileName,
        title: getText('player.defaultTrack.title', DEFAULT_SLEEP_SESSION.fallbackTitle),
        tags: getText('player.defaultTrack.tags', DEFAULT_SLEEP_SESSION.fallbackTags),
        description: getText('player.defaultTrack.desc', DEFAULT_SLEEP_SESSION.fallbackDesc),
        badge: getText('player.defaultTrack.badge', DEFAULT_SLEEP_SESSION.badge),
        duration: DEFAULT_SLEEP_SESSION.duration || '15:00'
    };
}

function prefillInstantPlayer() {
    if (currentTrackIndex >= 0) {
        return;
    }
    const config = getDefaultSessionConfig();
    const trackEl = document.getElementById('currentTrack');
    const tagsEl = document.getElementById('playerTags');
    const descEl = document.getElementById('playerDescription');
    const badgeEl = document.getElementById('playerBadge');
    const totalDuration = document.getElementById('totalDuration');
    const legacyDuration = document.getElementById('duration');

    if (trackEl) trackEl.textContent = config.title;
    if (tagsEl) tagsEl.textContent = config.tags;
    if (descEl) descEl.textContent = config.description;
    if (badgeEl) badgeEl.textContent = config.badge;
    if (totalDuration) totalDuration.textContent = config.duration;
    if (legacyDuration) legacyDuration.textContent = config.duration;
}

function playDefaultSleepSession() {
    const config = getDefaultSessionConfig();
    const url = getAudioUrl(config.categoryKey, config.fileName);

    if (!url) {
        window.showNotification(getText('player.defaultTrack.error', 'Unable to load the starter track. Please try another category.'), 'error');
        return;
    }

    const categoryMeta = (typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.categories[config.categoryKey]) || {};
    currentCategory = {
        key: config.categoryKey,
        name: getCategoryDisplayName(config.categoryKey, categoryMeta)
    };
    tracks = [{
        name: config.title,
        url,
        fileName: config.fileName
    }];
    prefillInstantPlayer();
    playTrack(0);
}

if (typeof window !== 'undefined') {
    window.playDefaultSleepSession = playDefaultSleepSession;
}

function renderCategoryShortcuts(entries) {
    const shortcutsContainer = document.getElementById('categoryShortcuts');
    if (!shortcutsContainer) {
        return;
    }

    const data = entries || getAvailableCategoryEntries();
    shortcutsContainer.innerHTML = '';

    data.forEach(([key, category]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'category-shortcut';
        button.setAttribute('data-category', key);
        button.setAttribute('role', 'listitem');

        const icon = category.icon || categoryInfo[key]?.icon || '🎵';
        const name = getCategoryDisplayName(key, category);
        const desc = getCategoryDescription(key, category);
        const presentation = categoryPresentations[key] || {};
        const accentColor = presentation.accent || '#7b5dff';
        const badgeText = getText(`categoryCard.${key}.badge`, presentation.badge || 'Sound Module');
        const labelText = getText(`categoryCard.${key}.label`, presentation.label || name);
        const taglineText = getText(`categoryCard.${key}.tagline`, presentation.tagline || getText('nav.quick.start', '立即体验'));

        button.style.setProperty('--accent-color', accentColor);

        button.innerHTML = `
            <span class="category-shortcut__glow"></span>
            <span class="category-shortcut__orbit"></span>
            <div class="category-shortcut__header">
                <span class="category-shortcut__badge">${badgeText}</span>
                <span class="category-shortcut__label">${labelText}</span>
            </div>
            <div class="category-shortcut__body">
                <div class="category-shortcut__icon">${icon}</div>
                <div class="category-shortcut__copy">
                    <p class="category-shortcut__title">${name}</p>
                    <p class="category-shortcut__desc">${desc || getText('player.selectAudio', '选择音频')}</p>
                </div>
            </div>
            <div class="category-shortcut__cta">
                <span>${taglineText}</span>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        `;

        button.addEventListener('click', () => {
            const audioFiles = category.files || [];
            if (!audioFiles.length) {
                console.warn(`Category "${key}" has no audio files`);
                return;
            }

            const playlistTracks = audioFiles
                .map((filename) => {
                    const url = getAudioUrl(key, filename) || (category.baseUrl ? `${category.baseUrl}/${filename}` : null);

                    if (!url) {
                        console.warn(`Unable to resolve audio URL for ${key} -> ${filename}`);
                        return null;
                    }

                    return {
                        name: getLocalizedTrackTitle(key, filename),
                        fileName: filename,
                        url,
                        category: key
                    };
                })
                .filter(Boolean);

            if (!playlistTracks.length) {
                const fallbackTracks = audioData[key];
                if (fallbackTracks?.length) {
                    tracks = fallbackTracks;
                    currentCategory = { key, ...category };
                    playTrack(0);
                } else {
                    window.showNotification?.(
                        getText('player.playError', '????????????????????'),
                        'error'
                    );
                }
                return;
            }

            currentCategory = { key, ...category };
            tracks = playlistTracks;

            playTrack(0);
        });

        shortcutsContainer.appendChild(button);
    });
}

// Canvas animation variables
let canvas, ctx;
let particles = [];
let currentScene = 'default';
let animationId;

// Performance optimization variables
let isPageVisible = true;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 60;
const targetFrameTime = 1000 / 30; // Target 30 FPS for better performance

// ==========================================================================
// 国际化系统初始化
// ==========================================================================

/**
 * Initialize i18n system
 */
function initI18n() {
    if (typeof window.i18n !== 'undefined') {
        I18N_SYSTEM = window.i18n;
        console.log('✅ i18n system initialized');
        return true;
    } else {
        console.warn('⚠️ i18n system not found');
        return false;
    }
}

/**
 * Helper function to get translated text
 */
function getText(key, fallback) {
    if (I18N_SYSTEM && I18N_SYSTEM.t) {
        return I18N_SYSTEM.t(key) || fallback;
    }
    return fallback;
}

function getLocalizedTrackTitle(categoryKey, fileName) {
    if (window.audioMetadata && typeof window.audioMetadata.getLocalizedTitle === 'function') {
        const localized = window.audioMetadata.getLocalizedTitle(categoryKey, fileName);
        if (localized) {
            return localized;
        }
    }
    return fileName.replace(/\.[^/.]+$/, '');
}

// ==========================================================================
// 应用初始化
// ==========================================================================

/**
 * 初始化应用
 */
function initializeApp() {
    console.log('Initializing app...');

    // Initialize canvas
    canvas = document.getElementById('backgroundCanvas');
    if (canvas) {
        ctx = canvas.getContext('2d');
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    // Initialize Page Visibility API for performance
    setupPageVisibilityListener();

    // 加载导航下的快捷卡片
    loadCategories();
    initRecommendationRail();
    prefillInstantPlayer();

    const heroStartBtn = document.querySelector('[data-action="start-default-session"]');
    if (heroStartBtn) {
        heroStartBtn.addEventListener('click', () => {
            playDefaultSleepSession();
        });
    }

    // Initialize audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    audio.addEventListener('loadedmetadata', updateDuration);

    // Initialize volume control
    const volumeSlider = document.getElementById('volumeSlider');
    if (volumeSlider) {
        volumeSlider.value = audio.volume * 100;
        const volumeValue = document.getElementById('volumeValue');
        if (volumeValue) {
            volumeValue.textContent = Math.round(audio.volume * 100) + '%';
        }
    }

    // Hide loading screen
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const app = document.getElementById('app');

        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        if (app) {
            app.style.display = 'block';
        }

        // Start background animation
        if (canvas) {
            animateBackground();
        }

        window.showNotification(getText('app.ready', '声音疗愈空间已准备就绪！'), 'success');
    }, 1500);
}

// ==========================================================================
// Canvas 相关函数
// ==========================================================================

/**
 * 设置页面可见性监听器 - 优化性能
 */
function setupPageVisibilityListener() {
    // Check for browser support
    let hidden, visibilityChange;

    if (typeof document.hidden !== 'undefined') {
        hidden = 'hidden';
        visibilityChange = 'visibilitychange';
    } else if (typeof document.msHidden !== 'undefined') {
        hidden = 'msHidden';
        visibilityChange = 'msvisibilitychange';
    } else if (typeof document.webkitHidden !== 'undefined') {
        hidden = 'webkitHidden';
        visibilityChange = 'webkitvisibilitychange';
    }

    if (typeof document[hidden] !== 'undefined') {
        document.addEventListener(visibilityChange, function() {
            isPageVisible = !document[hidden];

            if (isPageVisible) {
                console.log('📱 Page visible - resuming animations');
                // Resume animations when page becomes visible
                if (canvas && !animationId) {
                    animateBackground();
                }
            } else {
                console.log('📱 Page hidden - pausing animations');
                // Cancel animation when page is hidden to save resources
                if (animationId) {
                    cancelAnimationFrame(animationId);
                    animationId = null;
                }
            }
        }, false);
    }
}

function resizeCanvas() {
    if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

// ==========================================================================
// 分类加载
// ==========================================================================

function loadCategories() {
    console.log('Loading categories...');

    // 只渲染导航下的快捷卡片，不加载中间的分类网格
    const entries = getAvailableCategoryEntries();
    renderCategoryShortcuts(entries);

    // 中间的分类网格已移除
    // const categoryGrid = document.getElementById('categoryGrid');
    // if (categoryGrid) {
    //     categoryGrid.innerHTML = '';
    //     entries.forEach(([key, category]) => {
    //         const categoryCard = createCategoryCard(key, category);
    //         categoryGrid.appendChild(categoryCard);
    //     });
    // }
}

function createCategoryCard(key, category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.onclick = () => openPlaylist(key, category);

    const icon = category.icon || categoryInfo[key]?.icon || '🎵';

    const name = getCategoryDisplayName(key, category);
    const desc = getCategoryDescription(key, category);

    card.innerHTML = `
        <div class="category-icon">${icon}</div>
        <div class="category-name">${name}</div>
        <div class="category-desc">${desc}</div>
    `;

    return card;
}

// ==========================================================================
// 播放列表管理
// ==========================================================================

function openPlaylist(categoryKey, category) {
    currentCategory = { key: categoryKey, ...category };

    // Use translated name for playlist title
    let playlistName;
    if (category.nameKey) {
        playlistName = getText(category.nameKey, category.name || categoryInfo[categoryKey]?.name || categoryKey);
    } else {
        const ecoKey = `ecosystem.${categoryKey}.name`;
        const categoryKey2 = `category.${categoryKey}`;
        playlistName = getText(ecoKey, getText(categoryKey2, category.name || categoryInfo[categoryKey]?.name || categoryKey));
    }

    const playlistTitle = document.getElementById('playlistTitle');
    if (playlistTitle) {
        playlistTitle.textContent = playlistName;
    }

    const trackList = document.getElementById('trackList');
    if (!trackList) {
        return;
    }

    trackList.innerHTML = '';

    // Load tracks
    if (category.files && typeof AUDIO_CONFIG !== 'undefined' && AUDIO_CONFIG.baseUrl) {
        tracks = category.files.map((fileName) => ({
            name: getLocalizedTrackTitle(categoryKey, fileName),
            fileName,
            url: getAudioUrl(categoryKey, fileName)
        }));
    } else {
        // Use fallback audioData
        tracks = audioData[categoryKey] || [
            { name: '示例音频', fileName: 'sample.mp3', url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' }
        ];
    }

    // Display tracks
    tracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        trackItem.onclick = () => playTrack(index);

        const title = document.createElement('div');
        title.style.fontSize = '1.1em';
        title.style.marginBottom = '4px';
        title.textContent = `🎧 ${track.name}`;
        trackItem.appendChild(title);

        const metaLine = getTrackMetaSummary(categoryKey, track.fileName);
        if (metaLine) {
            const metaDiv = document.createElement('div');
            metaDiv.className = 'track-meta';
            metaDiv.textContent = metaLine;
            trackItem.appendChild(metaDiv);
        }

        trackList.appendChild(trackItem);
    });

    // ❌ 移除这行，避免重复触发事件
    // changeBackgroundScene(categoryKey);
    // ✅ 视频切换将在 playTrack() 时统一触发

    // Show modal
    const playlistModal = document.getElementById('playlistModal');
    if (playlistModal) {
        playlistModal.style.display = 'block';
    }
}

function closePlaylist() {
    const playlistModal = document.getElementById('playlistModal');
    if (playlistModal) {
        playlistModal.style.display = 'none';
    }
}

// ==========================================================================
// 浮动播放器模态
// ==========================================================================

function syncPlayerModalOverflow(forceRemove = false) {
    if (typeof document === 'undefined') {
        return;
    }
    if (forceRemove || !MOBILE_PLAYER_QUERY) {
        document.body.classList.remove('player-modal-open');
        return;
    }
    const modal = document.getElementById('playerControlModal');
    if (!modal || !modal.classList.contains('player-modal--visible')) {
        document.body.classList.remove('player-modal-open');
        return;
    }
    if (MOBILE_PLAYER_QUERY.matches) {
        document.body.classList.add('player-modal-open');
    } else {
        document.body.classList.remove('player-modal-open');
    }
}

function openPlayerModal(shouldFocusClose = false) {
    const modal = document.getElementById('playerControlModal');
    const player = document.getElementById('audioPlayer');
    if (!modal) {
        return;
    }
    modal.classList.add('player-modal--visible');
    modal.removeAttribute('aria-hidden');
    syncPlayerModalOverflow();
    if (player) {
        player.classList.add('show');
    }

    if (shouldFocusClose) {
        const closeBtn = modal.querySelector('[data-role="player-modal-close"]');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
}

function closePlayerModal() {
    const modal = document.getElementById('playerControlModal');
    const player = document.getElementById('audioPlayer');
    if (!modal) {
        return;
    }
    modal.classList.remove('player-modal--visible');
    modal.setAttribute('aria-hidden', 'true');
    syncPlayerModalOverflow(true);
    if (player) {
        player.classList.remove('show');
    }
}

document.addEventListener('click', (event) => {
    if (event.target && event.target.hasAttribute('data-close-player-modal')) {
        closePlayerModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closePlayerModal();
    }
});

window.openPlayerModal = openPlayerModal;
window.closePlayerModal = closePlayerModal;

if (MOBILE_PLAYER_QUERY) {
    const mqHandler = () => syncPlayerModalOverflow();
    if (typeof MOBILE_PLAYER_QUERY.addEventListener === 'function') {
        MOBILE_PLAYER_QUERY.addEventListener('change', mqHandler);
    } else if (typeof MOBILE_PLAYER_QUERY.addListener === 'function') {
        MOBILE_PLAYER_QUERY.addListener(mqHandler);
    }
}

// ==========================================================================
// 音频播放控制
// ==========================================================================

async function playTrack(index) {
    currentTrackIndex = index;
    const track = tracks[index];
    const category = categoryInfo[currentCategory.key] || currentCategory;

    if (window.autoplayDetector) {
        const isAllowed = await window.autoplayDetector.detectAutoplay();

        if (!isAllowed && !window.autoplayDetector.hasUserInteracted) {
            console.log('⚠️ 需要用户交互才能播放');
            await window.autoplayDetector.waitForInteraction();
        }
    }

    const currentTrack = document.getElementById('currentTrack');
    const currentCategoryElem = document.getElementById('currentCategory');

    if (currentTrack) {
        currentTrack.textContent = track.name;
    }
    if (currentCategoryElem) {
        currentCategoryElem.textContent = category.name || currentCategory.key;
    }

    openPlayerModal(false);

    if (window.audioPreloader && window.audioPreloader.isCached(track.url)) {
        console.log('🎧 音频已缓存，使用浏览器缓存加速加载');
    }

    const sourceChanged = audio.src !== track.url;

    if (sourceChanged) {
        audio.src = track.url;
        audio.currentTime = 0;
    } else {
        audio.pause();
        audio.currentTime = 0;
    }

    try {
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
            await playPromise;
        }
        console.log('✅ 音频播放成功');
    } catch (error) {
        if (error?.name === 'AbortError') {
            console.warn('音频播放被中断（可能因快速切换）');
            return;
        }

        console.error('❌ 音频播放失败:', error);

        if (error?.name === 'NotAllowedError') {
            window.showNotification(
                '请点击播放按钮开始播放',
                'warning'
            );

            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.style.animation = 'pulse 1s infinite';
                playPauseBtn.style.boxShadow = '0 0 20px rgba(102, 126, 234, 0.8)';
            }
        } else {
            window.showNotification(
                getText('player.playError', '播放失败，请检查网络连接'),
                'error'
            );
        }

        return;
    }

    isPlaying = true;
    updatePlayPauseButton();

    const player = document.getElementById('audioPlayer');
    window.dispatchEvent(new CustomEvent('audioStateChange', {
        detail: { isPlaying: true, track: track }
    }));

    window.dispatchEvent(new CustomEvent('audio:trackChanged', {
        detail: {
            category: window.currentCategory?.key || null,
            fileName: track.fileName || track.url?.split('/').pop() || null,
            displayName: track.name || track.displayName || '',
            url: track.url || null
        }
    }));

    closePlaylist();
    window.showNotification(`${getText('player.nowPlaying', '正在播放')}: ${track.name}`, 'success');

    if (window.audioPreloader && tracks.length > 1) {
        window.audioPreloader.preloadNext(tracks, currentTrackIndex, isShuffleMode);
    }
}

function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play().catch(e => {
            window.showNotification('播放失败', 'error');
        });
        isPlaying = true;
    }
    updatePlayPauseButton();

    // 🎯 2.0 新增: 触发音频状态变化事件（用于专注模式）
    window.dispatchEvent(new CustomEvent('audioStateChange', {
        detail: { isPlaying: isPlaying }
    }));
}

function updatePlayPauseButton() {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.textContent = isPlaying ? '⏸️' : '▶️';
    }
}

function stopAudio() {
    audio.pause();
    audio.currentTime = 0;
    isPlaying = false;
    updatePlayPauseButton();
}

function previousTrack() {
    if (currentTrackIndex > 0) {
        playTrack(currentTrackIndex - 1);
    }
}

function nextTrack() {
    if (tracks.length === 0) {
        return;
    }

    if (isShuffleMode) {
        // Random playback
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * tracks.length);
        } while (nextIndex === currentTrackIndex && tracks.length > 1);
        playTrack(nextIndex);
    } else if (currentTrackIndex < tracks.length - 1) {
        playTrack(currentTrackIndex + 1);
    } else if (isRepeatMode) {
        // Loop back to first track
        playTrack(0);
    }
}

function handleTrackEnd() {
    if (isRepeatMode) {
        playTrack(currentTrackIndex);
    } else if (currentTrackIndex < tracks.length - 1) {
        nextTrack();
    } else {
        stopAudio();
    }
}

// ==========================================================================
// 进度控制
// ==========================================================================

function updateProgress() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;
        const progressFill = document.getElementById('progressFill');
        const currentTime = document.getElementById('currentTime');

        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (currentTime) {
            currentTime.textContent = formatTime(audio.currentTime);
        }
    }
}

function updateDuration() {
    const durationEl = document.getElementById('duration') || document.getElementById('totalDuration');
    if (durationEl) {
        durationEl.textContent = formatTime(audio.duration);
    }
}

function seekTo(event) {
    const progressBar = event.currentTarget;
    const clickX = event.offsetX;
    const width = progressBar.offsetWidth;
    const percentage = clickX / width;
    audio.currentTime = audio.duration * percentage;
}

function formatTime(seconds) {
    if (isNaN(seconds)) {
        return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ==========================================================================
// 播放器界面控制
// ==========================================================================

// ==========================================================================
// 通知系统
// ==========================================================================

// 通知函数由 notification-preferences.js 提供
// 使用 window.showNotification(message, type, category)

// ==========================================================================
// 背景场景管理
// ==========================================================================

function changeBackgroundScene(scene) {
    if (!canvas || !ctx) {
        console.warn('Canvas not initialized, skipping background scene');
        return;
    }
    currentScene = scene;

    // ❌ 移除视频事件触发，统一由 playTrack() 处理
    // 这里只处理Canvas粒子动画

    particles = [];

    // Scene configurations
    const sceneConfigs = {
        default: {
            particleCount: 30,
            colors: ['rgba(255,255,255,0.5)'],
            particleType: 'circle'
        },
        meditation: {
            particleCount: 40,
            colors: ['rgba(147,112,219,0.5)', 'rgba(138,43,226,0.3)'],
            particleType: 'energy'
        },
        nature: {
            particleCount: 50,
            colors: ['rgba(34,139,34,0.5)', 'rgba(50,205,50,0.3)'],
            particleType: 'leaf'
        },
        rain: {
            particleCount: 80,
            colors: ['rgba(173,216,230,0.6)', 'rgba(135,206,235,0.4)'],
            particleType: 'drop'
        },
        singing: {
            particleCount: 35,
            colors: ['rgba(255,215,0,0.5)', 'rgba(255,223,0,0.3)'],
            particleType: 'energy'
        }
    };

    const config = sceneConfigs[scene] || sceneConfigs.default;

    // Create particles
    for (let i = 0; i < config.particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 3 + 1,
            color: config.colors[Math.floor(Math.random() * config.colors.length)],
            type: config.particleType,
            angle: Math.random() * Math.PI * 2
        });
    }
}

/**
 * 优化的背景动画函数
 * - 帧率限制到30 FPS
 * - 页面不可见时自动暂停
 * - 批量渲染优化
 */
function animateBackground(currentTime = 0) {
    if (!ctx || !canvas) {
        return;
    }

    // Skip if page is not visible
    if (!isPageVisible) {
        return;
    }

    // Throttle to target frame rate (30 FPS)
    const elapsed = currentTime - lastFrameTime;

    if (elapsed < targetFrameTime) {
        animationId = requestAnimationFrame(animateBackground);
        return;
    }

    // Update last frame time
    lastFrameTime = currentTime - (elapsed % targetFrameTime);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Pre-calculate canvas dimensions for performance
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Set global alpha once for all particles
    ctx.globalAlpha = 0.6;

    // Update and render particles in a single loop
    for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges (optimized with fewer condition checks)
        if (particle.x < 0) particle.x = canvasWidth;
        else if (particle.x > canvasWidth) particle.x = 0;

        if (particle.y < 0) particle.y = canvasHeight;
        else if (particle.y > canvasHeight) particle.y = 0;

        // Draw particle based on type
        ctx.fillStyle = particle.color;

        switch (particle.type) {
        case 'leaf':
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);
            ctx.fillRect(-particle.size, -particle.size / 2, particle.size * 2, particle.size);
            ctx.restore();
            particle.angle += 0.01; // Slow rotation
            break;

        case 'energy':
            // Cache gradients or use simpler rendering
            ctx.save();
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 2
            );
            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.fillRect(
                particle.x - particle.size * 2,
                particle.y - particle.size * 2,
                particle.size * 4,
                particle.size * 4
            );
            ctx.restore();
            break;

        default:
            // Circle rendering (most common case)
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Reset global alpha
    ctx.globalAlpha = 1.0;

    // Track FPS for debugging
    frameCount++;
    if (frameCount % 60 === 0) {
        fps = Math.round(1000 / elapsed);
    }

    // Request next frame
    animationId = requestAnimationFrame(animateBackground);
}

// ==========================================================================
// 音量和播放控制
// ==========================================================================

function changeVolume(value) {
    audio.volume = value / 100;
    const volumeValue = document.getElementById('volumeValue');
    if (volumeValue) {
        volumeValue.textContent = value + '%';
    }
}

function toggleShuffle() {
    isShuffleMode = !isShuffleMode;
    const btn = document.getElementById('shuffleBtn');
    if (btn) {
        btn.classList.toggle('active', isShuffleMode);
    }
    window.showNotification(getText(isShuffleMode ? 'player.shuffleOn' : 'player.shuffleOff', isShuffleMode ? '随机播放已开启' : '随机播放已关闭'));
}

function toggleRepeat() {
    isRepeatMode = !isRepeatMode;
    const btn = document.getElementById('repeatBtn');
    if (btn) {
        btn.classList.toggle('active', isRepeatMode);
        btn.textContent = isRepeatMode ? '🔂' : '🔁';
    }
    window.showNotification(getText(isRepeatMode ? 'player.repeatSingle' : 'player.repeatAll', isRepeatMode ? '单曲循环已开启' : '循环播放已开启'));
}

function toggleSleepTimer() {
    const modal = document.getElementById('sleepTimerModal');
    if (!modal) {
        return;
    }

    if (modal.style.display === 'none') {
        modal.style.display = 'block';
    } else {
        modal.style.display = 'none';
    }
}

function setSleepTimer(minutes) {
    const modal = document.getElementById('sleepTimerModal');
    if (modal) {
        modal.style.display = 'none';
    }

    if (sleepTimer) {
        clearTimeout(sleepTimer);
        sleepTimer = null;
    }

    if (minutes > 0) {
        sleepTimer = setTimeout(() => {
            audio.pause();
            isPlaying = false;
            const playPauseBtn = document.getElementById('playPauseBtn');
            if (playPauseBtn) {
                playPauseBtn.textContent = '▶️';
            }

            window.showNotification(getText('timer.stopped', '睡眠定时器已停止播放'), 'success');

            const sleepTimerBtn = document.getElementById('sleepTimerBtn');
            if (sleepTimerBtn) {
                sleepTimerBtn.classList.remove('active');
            }
        }, minutes * 60 * 1000);

        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (sleepTimerBtn) {
            sleepTimerBtn.classList.add('active');
        }

        window.showNotification(`${getText('timer.set', '睡眠定时器已设置为')}${minutes}${getText('timer.minutes', '分钟')}`, 'success');
    } else {
        const sleepTimerBtn = document.getElementById('sleepTimerBtn');
        if (sleepTimerBtn) {
            sleepTimerBtn.classList.remove('active');
        }

        window.showNotification(getText('timer.closed', '睡眠定时器已关闭'), 'success');
    }
}

function changePlaybackRate(rate) {
    audio.playbackRate = parseFloat(rate);
    window.showNotification(`${getText('player.playbackRate', '播放速度')}: ${rate}x`, 'info');
}

// ==========================================================================
// 静态文本更新
// ==========================================================================

function updateStaticText() {
    // Update any static text that doesn't use data-i18n attributes
    console.log('Language changed, updating UI...');
}

// ==========================================================================
// 事件监听器
// ==========================================================================

// Close modals when clicking outside
window.onclick = function(event) {
    const playlistModal = document.getElementById('playlistModal');
    if (event.target === playlistModal) {
        closePlaylist();
    }
};

// ==========================================================================
// 页面加载初始化
// ==========================================================================

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initI18n();
        initializeApp();

        // ✅ 修复: 在Canvas初始化后才调用changeBackgroundScene
        if (canvas && ctx) {
            changeBackgroundScene('default');
        }

        // Listen for language change events
        document.addEventListener('languageChange', function() {
            loadCategories(); // 重新渲染导航卡片
            updateStaticText();
            prefillInstantPlayer();
        });
    });
} else {
    // Page already loaded
    initI18n();
    initializeApp();

    // ✅ 修复: 在Canvas初始化后才调用changeBackgroundScene
    if (canvas && ctx) {
        changeBackgroundScene('default');
    }

    // Listen for language change events
    document.addEventListener('languageChange', function() {
        loadCategories(); // 重新渲染导航卡片
        updateStaticText();
        scheduleRecommendationRefresh(true);
        prefillInstantPlayer();
    });
}


function getTrackMetaSummary(categoryKey, fileName) {
    if (!window.audioMetadata || typeof window.audioMetadata.getMetadata !== 'function') {
        return '';
    }
    const metadata = window.audioMetadata.getMetadata(categoryKey, fileName);
    if (!metadata) {
        return '';
    }
    const durationLabel = metadata.duration || (metadata.durationSeconds ? formatDurationFromSeconds(metadata.durationSeconds) : '');
    const tags = Array.isArray(metadata.tags) ? metadata.tags.slice(0, 2).join(' · ') : '';
    return [durationLabel, tags].filter(Boolean).join(' · ');
}

function formatDurationFromSeconds(seconds) {
    if (typeof seconds !== 'number') {
        return '';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.max(0, Math.floor(seconds % 60));
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function truncateText(text, maxLength = 80) {
    if (!text) {
        return '';
    }
    return text.length <= maxLength ? text : `${text.slice(0, maxLength - 1)}…`;
}

function initRecommendationRail(attempt = 0) {
    const grid = document.getElementById('recommendationsGrid');
    if (!grid) {
        return;
    }
    if (!window.recommendationEngine) {
        if (attempt > MAX_RECOMMENDATION_INIT_ATTEMPTS) {
            grid.innerHTML = `<p class="recommendations__empty">${getText('recommendations.loading', '正在准备你的疗愈推荐...')}</p>`;
            return;
        }
        setTimeout(() => initRecommendationRail(attempt + 1), 300);
        return;
    }
    renderPersonalizedRecommendations(true);
    if (!grid.dataset.listenersBound) {
        window.addEventListener('userData:historyUpdated', () => scheduleRecommendationRefresh(false));
        window.addEventListener('userData:favoritesUpdated', () => scheduleRecommendationRefresh(false));
        document.addEventListener('tutorialCompleted', () => scheduleRecommendationRefresh(true));
        grid.dataset.listenersBound = 'true';
    }
}

function scheduleRecommendationRefresh(force = false) {
    if (recommendationsRenderTimer) {
        clearTimeout(recommendationsRenderTimer);
    }
    recommendationsRenderTimer = setTimeout(() => {
        renderPersonalizedRecommendations(true);
    }, force ? 0 : 600);
}

function renderPersonalizedRecommendations(force = false) {
    const grid = document.getElementById('recommendationsGrid');
    if (!grid || !window.recommendationEngine) {
        return;
    }

    const recommendations = window.recommendationEngine.getRecommendations(6) || [];
    grid.innerHTML = '';

    if (!recommendations.length) {
        const empty = document.createElement('p');
        empty.className = 'recommendations__empty';
        empty.textContent = getText('recommendations.empty', '开始播放或收藏几首声音，我们将为你量身推荐疗愈路线。');
        grid.appendChild(empty);
        return;
    }

    recommendations.forEach(rec => {
        grid.appendChild(buildRecommendationCard(rec));
    });
}

function buildRecommendationCard(rec) {
    const card = document.createElement('article');
    card.className = 'recommendation-card';
    card.setAttribute('role', 'listitem');

    const metadata = window.audioMetadata ? window.audioMetadata.getMetadata(rec.category, rec.fileName) : null;
    const reasonText = (window.recommendationEngine && typeof window.recommendationEngine.getReasonText === 'function')
        ? window.recommendationEngine.getReasonText(rec.reason, rec)
        : getText('recommendations.reason.default', '为你推荐');
    const titleText = getLocalizedTrackTitle(rec.category, rec.fileName);
    const metaLine = getTrackMetaSummary(rec.category, rec.fileName);
    const description = metadata?.description
        ? truncateText(metadata.description, 110)
        : getText('recommendations.descriptionFallback', '精选音频，随时沉浸。');

    const reason = document.createElement('p');
    reason.className = 'recommendation-card__reason';
    reason.textContent = reasonText;

    const title = document.createElement('p');
    title.className = 'recommendation-card__title';
    title.textContent = titleText;

    let metaElement = null;
    if (metaLine) {
        metaElement = document.createElement('p');
        metaElement.className = 'recommendation-card__meta';
        metaElement.textContent = metaLine;
    }

    const desc = document.createElement('p');
    desc.className = 'recommendation-card__meta';
    desc.textContent = description;

    const button = document.createElement('button');
    button.className = 'recommendation-card__cta';
    button.type = 'button';
    button.textContent = getText('recommendations.play', '立即播放');
    button.addEventListener('click', () => playRecommendedTrack(rec.category, rec.fileName));

    card.appendChild(reason);
    card.appendChild(title);
    if (metaElement) {
        card.appendChild(metaElement);
    }
    card.appendChild(desc);
    card.appendChild(button);

    return card;
}

function playRecommendedTrack(categoryKey, fileName) {
    if (!categoryKey || !fileName || !AUDIO_CONFIG || !AUDIO_CONFIG.categories) {
        return;
    }

    const category = AUDIO_CONFIG.categories[categoryKey];
    if (!category || !category.files) {
        return;
    }

    openPlaylist(categoryKey, category);
    const trackIndex = tracks.findIndex(track => track.fileName === fileName);

    if (trackIndex >= 0) {
        playTrack(trackIndex);
        window.showNotification(getText('recommendations.nowPlaying', '已为你加载推荐音频'), 'info');
    }
}

window.refreshPersonalizedRecommendations = (force = false) => {
    if (force) {
        renderPersonalizedRecommendations(true);
    } else {
        scheduleRecommendationRefresh(true);
    }
};


