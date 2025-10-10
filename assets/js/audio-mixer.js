/**
 * AudioMixer - 音频混音器
 *
 * 支持同时播放多个音频轨道，每个轨道独立音量控制
 * 使用Web Audio API实现专业级混音效果
 *
 * @class
 * @author Sound Healing Team
 * @version 1.0.0
 */

class AudioMixer {
    constructor() {
        // 初始化Web Audio API
        this.audioContext = null;
        this.masterGain = null;
        this.tracks = new Map(); // trackId -> { audio, source, gainNode, category, fileName }
        this.maxTracks = 5; // 最多同时播放5个音轨
        this.isInitialized = false;

        // 预设混音组合
        this.presets = {
            'sleep': ['Rain', 'meditation'],
            'focus': ['running water', 'meditation'],
            'relax': ['Animal sounds', 'Singing bowl sound'],
            'deep-meditation': ['Chakra', 'Singing bowl sound']
        };
    }

    /**
     * 初始化Web Audio API
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }

        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // 创建主增益节点（总音量控制）
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.8;

            this.isInitialized = true;
            console.log('✅ AudioMixer 初始化成功');
            return true;
        } catch (error) {
            console.error('❌ AudioMixer 初始化失败:', error);
            return false;
        }
    }

    /**
     * 添加音轨到混音器
     * @param {string} trackId - 轨道ID
     * @param {string} category - 音频分类
     * @param {string} fileName - 文件名
     * @param {number} volume - 初始音量 (0-1)
     */
    async addTrack(trackId, category, fileName, volume = 0.5) {
        // 检查是否已达到最大轨道数
        if (this.tracks.size >= this.maxTracks) {
            throw new Error(`最多只能同时播放 ${this.maxTracks} 个音轨`);
        }

        // 检查轨道是否已存在
        if (this.tracks.has(trackId)) {
            console.warn(`轨道 ${trackId} 已存在`);
            return this.tracks.get(trackId);
        }

        // 确保AudioContext已初始化
        if (!this.isInitialized) {
            await this.initialize();
        }

        // 恢复AudioContext（处理浏览器自动暂停）
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        try {
            // 创建音频元素
            const audio = new Audio();
            const audioUrl = this.getAudioUrl(category, fileName);
            audio.src = audioUrl;
            audio.crossOrigin = 'anonymous';
            audio.loop = true; // 混音默认循环播放

            // 创建Web Audio节点
            const source = this.audioContext.createMediaElementSource(audio);
            const gainNode = this.audioContext.createGain();

            // 连接音频图
            source.connect(gainNode);
            gainNode.connect(this.masterGain);

            // 设置初始音量
            gainNode.gain.value = volume;

            // 保存轨道信息
            const track = {
                audio,
                source,
                gainNode,
                category,
                fileName,
                volume,
                isPlaying: false
            };

            this.tracks.set(trackId, track);

            // 监听音频结束事件（如果不循环）
            audio.addEventListener('ended', () => {
                track.isPlaying = false;
                this.triggerEvent('trackEnded', { trackId });
            });

            console.log(`✅ 添加混音轨道: ${fileName}`);
            this.triggerEvent('trackAdded', { trackId, category, fileName });

            return track;
        } catch (error) {
            console.error('添加轨道失败:', error);
            throw error;
        }
    }

    /**
     * 播放指定轨道
     */
    async playTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) {
            throw new Error(`轨道 ${trackId} 不存在`);
        }

        try {
            await track.audio.play();
            track.isPlaying = true;
            console.log(`▶️ 播放混音轨道: ${track.fileName}`);
            this.triggerEvent('trackPlay', { trackId });
        } catch (error) {
            console.error('播放轨道失败:', error);
            throw error;
        }
    }

    /**
     * 暂停指定轨道
     */
    pauseTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) {
            return;
        }

        track.audio.pause();
        track.isPlaying = false;
        console.log(`⏸️ 暂停混音轨道: ${track.fileName}`);
        this.triggerEvent('trackPause', { trackId });
    }

    /**
     * 移除轨道
     */
    removeTrack(trackId) {
        const track = this.tracks.get(trackId);
        if (!track) {
            return false;
        }

        // 停止播放
        track.audio.pause();
        track.audio.src = '';

        // 断开音频节点
        track.source.disconnect();
        track.gainNode.disconnect();

        // 从Map中删除
        this.tracks.delete(trackId);

        console.log(`🗑️ 移除混音轨道: ${track.fileName}`);
        this.triggerEvent('trackRemoved', { trackId });

        return true;
    }

    /**
     * 设置轨道音量
     */
    setTrackVolume(trackId, volume) {
        const track = this.tracks.get(trackId);
        if (!track) {
            return;
        }

        // 限制音量范围 0-1
        volume = Math.max(0, Math.min(1, volume));

        // 使用平滑过渡
        const currentTime = this.audioContext.currentTime;
        track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, currentTime);
        track.gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.1);

        track.volume = volume;
        this.triggerEvent('trackVolumeChange', { trackId, volume });
    }

    /**
     * 设置主音量
     */
    setMasterVolume(volume) {
        if (!this.masterGain) {
            return;
        }

        volume = Math.max(0, Math.min(1, volume));

        const currentTime = this.audioContext.currentTime;
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
        this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + 0.1);

        this.triggerEvent('masterVolumeChange', { volume });
    }

    /**
     * 播放所有轨道
     */
    async playAll() {
        const promises = [];
        for (const [trackId, track] of this.tracks) {
            if (!track.isPlaying) {
                promises.push(this.playTrack(trackId));
            }
        }
        await Promise.all(promises);
    }

    /**
     * 暂停所有轨道
     */
    pauseAll() {
        for (const [trackId] of this.tracks) {
            this.pauseTrack(trackId);
        }
    }

    /**
     * 停止并清空所有轨道
     */
    stopAll() {
        const trackIds = Array.from(this.tracks.keys());
        trackIds.forEach(trackId => this.removeTrack(trackId));
    }

    /**
     * 获取所有轨道信息
     */
    getTracks() {
        const tracks = [];
        for (const [trackId, track] of this.tracks) {
            tracks.push({
                trackId,
                category: track.category,
                fileName: track.fileName,
                volume: track.volume,
                isPlaying: track.isPlaying
            });
        }
        return tracks;
    }

    /**
     * 加载预设混音组合
     */
    async loadPreset(presetName) {
        const preset = this.presets[presetName];
        if (!preset) {
            throw new Error(`预设 ${presetName} 不存在`);
        }

        // 清空当前混音
        this.stopAll();

        // 加载预设中的分类（需要配合audioManager）
        console.log(`🎵 加载混音预设: ${presetName}`, preset);
        this.triggerEvent('presetLoaded', { presetName, categories: preset });

        return preset;
    }

    /**
     * 保存当前混音为预设
     */
    saveAsPreset(presetName) {
        const tracks = this.getTracks();
        const categories = tracks.map(t => t.category);

        this.presets[presetName] = categories;

        // 保存到localStorage
        this.savePresetsToStorage();

        console.log(`💾 保存混音预设: ${presetName}`);
        this.triggerEvent('presetSaved', { presetName, categories });
    }

    /**
     * 获取所有预设
     */
    getPresets() {
        return Object.keys(this.presets);
    }

    /**
     * 从localStorage加载预设
     */
    loadPresetsFromStorage() {
        try {
            const stored = localStorage.getItem('soundHealing_mixerPresets');
            if (stored) {
                const customPresets = JSON.parse(stored);
                this.presets = { ...this.presets, ...customPresets };
            }
        } catch (error) {
            console.error('加载混音预设失败:', error);
        }
    }

    /**
     * 保存预设到localStorage
     */
    savePresetsToStorage() {
        try {
            // 只保存自定义预设（排除内置预设）
            const builtInPresets = ['sleep', 'focus', 'relax', 'deep-meditation'];
            const customPresets = {};

            for (const [name, value] of Object.entries(this.presets)) {
                if (!builtInPresets.includes(name)) {
                    customPresets[name] = value;
                }
            }

            localStorage.setItem('soundHealing_mixerPresets', JSON.stringify(customPresets));
        } catch (error) {
            console.error('保存混音预设失败:', error);
        }
    }

    /**
     * 获取音频URL
     */
    getAudioUrl(categoryName, fileName) {
        if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
            return fileName;
        }

        // 使用全局配置
        if (typeof AUDIO_CONFIG !== 'undefined') {
            const category = AUDIO_CONFIG.categories[categoryName];
            if (category) {
                const folderName = category.folder || categoryName.toLowerCase().replace(/\s+/g, '-');
                return `${AUDIO_CONFIG.baseUrl}${folderName}/${encodeURIComponent(fileName)}`;
            }
        }

        return fileName;
    }

    /**
     * 触发自定义事件
     */
    triggerEvent(eventName, data) {
        const event = new CustomEvent(`mixer:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * 清理资源
     */
    cleanup() {
        this.stopAll();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.masterGain = null;
        this.isInitialized = false;
    }
}

// 创建全局实例
if (typeof window !== 'undefined') {
    window.AudioMixer = AudioMixer;
    window.audioMixer = new AudioMixer();

    // 加载自定义预设
    window.audioMixer.loadPresetsFromStorage();

    console.log('✅ AudioMixer 已创建');
}
