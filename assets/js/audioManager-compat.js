/**
 * AudioManager Compatibility Layer
 * 为依赖window.audioManager的旧模块提供兼容性
 *
 * @version 1.0.0
 * @date 2025-10-13
 */

// 创建兼容的audioManager对象
window.audioManager = {
    // 播放状态（从index-app.js同步）
    get isPlaying() {
        return window.isPlaying || false;
    },

    // 当前音频（从index-app.js同步）
    get currentTrack() {
        if (window.currentTrackIndex >= 0 && window.tracks && window.tracks[window.currentTrackIndex]) {
            return window.tracks[window.currentTrackIndex];
        }
        return null;
    },

    // 当前分类
    get currentCategory() {
        return window.currentCategory;
    },

    // 播放音频方法
    playTrack(categoryKey, fileName) {
        console.log(`🔄 audioManager.playTrack called: ${categoryKey}/${fileName}`);

        // 查找对应的track index
        if (window.tracks && window.tracks.length > 0) {
            const index = window.tracks.findIndex(t => t.fileName === fileName);
            if (index >= 0 && typeof window.playTrack === 'function') {
                window.playTrack(index);
                return true;
            }
        }

        console.warn('⚠️ Track not found or playTrack function unavailable');
        return false;
    },

    // 暂停
    pause() {
        if (window.audio && typeof window.audio.pause === 'function') {
            window.audio.pause();
            window.isPlaying = false;
            if (typeof window.updatePlayPauseButton === 'function') {
                window.updatePlayPauseButton();
            }
        }
    },

    // 播放/继续
    play() {
        if (window.audio && typeof window.audio.play === 'function') {
            window.audio.play().catch(err => {
                console.warn('⚠️ Play failed:', err);
            });
            window.isPlaying = true;
            if (typeof window.updatePlayPauseButton === 'function') {
                window.updatePlayPauseButton();
            }
        }
    },

    // 停止
    stop() {
        if (typeof window.stopAudio === 'function') {
            window.stopAudio();
        }
    },

    // 下一首
    next() {
        if (typeof window.nextTrack === 'function') {
            window.nextTrack();
        }
    },

    // 上一首
    previous() {
        if (typeof window.previousTrack === 'function') {
            window.previousTrack();
        }
    },

    // 音量控制
    setVolume(volume) {
        if (window.audio) {
            window.audio.volume = volume / 100;
            if (typeof window.changeVolume === 'function') {
                window.changeVolume(volume);
            }
        }
    }
};

console.log('✅ AudioManager兼容层已加载');
