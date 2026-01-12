/**
 * AudioManager - 遊戲音效管理器
 * 
 * 使用前提：
 * 音效文件必須放在 bundle 的以下目錄：
 *    - 音效：audio/sound/
 *    - 音樂：audio/music/
 * 
 * 基本用法：先加載音效資源才能播放音效
 *    await audioManager().loadBundleAudios('audio');
 */

import { _decorator, AudioSource, game, Game, tween, Component, assetManager, AudioClip, AssetManager, Tween, Node, director } from 'cc';

import { Logger } from 'db://assets/base/script/utils/Logger';

interface AudioInfo {
    startTime: number;//紀錄播放當下時間(讓後台來回切換時正常接續播放音效)
    duration: number;//音頻長度
    audioClip: AudioClip;//音效
    audioSource: AudioSource;//音效源
    musicPlaying?: boolean;//紀錄背景音樂播放狀態
}
const { ccclass } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    private static _instance: AudioManager | null = null;
    private soundMap: Map<string, AudioInfo> = new Map();//紀錄音效
    private musicMap: Map<string, AudioInfo> = new Map();//紀錄音樂
    private isAudioContextRunning: boolean = false;//等待AudioContext啟動
    // private isMuted: boolean = false;//所有音效設置
    private isSoundMuted: boolean = false;//音效靜音設置
    private isMusicMuted: boolean = false;//音樂靜音設置
    private isInBackground: boolean = false;//是否處於背景
    private setMusicVolume: number = 1;//音樂音量設置

    /**
     * 監聽遊戲隱藏和顯示
     */
    protected onEnable() {
        game.on(Game.EVENT_HIDE, this.onGameHide, this);
        game.on(Game.EVENT_SHOW, this.onGameShow, this);
    }

    /**
     * 釋放資源
     */
    protected onDestroy() {
        // 移除事件監聽
        game.off(Game.EVENT_HIDE, this.onGameHide, this);
        game.off(Game.EVENT_SHOW, this.onGameShow, this);
        if (this !== AudioManager._instance) {
            return;
        }
        // 釋放音效資源
        for (const [_name, audioInfo] of this.soundMap) {
            audioInfo.audioSource.stop();
            audioInfo.audioSource.destroy();
            if (audioInfo.audioClip) {
                assetManager.releaseAsset(audioInfo.audioClip);
            }
        }
        this.soundMap.clear();

        // 釋放音樂資源
        for (const [_name, audioInfo] of this.musicMap) {
            audioInfo.audioSource.stop();
            audioInfo.audioSource.destroy();
            if (audioInfo.audioClip) {
                assetManager.releaseAsset(audioInfo.audioClip);
            }
        }
        this.musicMap.clear();
        AudioManager._instance = null;// 清理單例實例
    }

    /**
     * 獲取實例
     * @returns 實例
     */
    public static getInstance(): AudioManager {
        if (!AudioManager._instance) {
            const node = new Node('AudioManager');
            director.getScene()!.addChild(node);
            // director.addPersistRootNode(node);
            AudioManager._instance = node.addComponent(AudioManager);
        }
        return AudioManager._instance!;
    }


    /**
     * 加載 bundle 內的音效
     * @param bundleName bundle名稱(預設為audio)
     */
    public async loadBundleAudios(bundleName: string = 'audio'): Promise<void> {
        const existingBundle = assetManager.getBundle(bundleName);
        if (existingBundle) {
            await this.loadAudio(existingBundle);
        } else {
            const bundle = await this.getBundle(bundleName);
            await this.loadAudio(bundle);
        }
        // this.updateAudioSetting();//更新音效狀態
        // this.watchAudioSetting();//監聽【公版】音效狀態
    }

    /**
     * 獲取 bundle
     * @param bundleName bundle名稱
     * @returns bundle
     */
    private getBundle(bundleName: string): Promise<AssetManager.Bundle> {
        return new Promise(resolve => {
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    Logger.error(`無法獲取${bundleName} bundle: ${err}`);
                    return;
                }
                resolve(bundle);
            });
        });
    }

    /**
     * 加載 bundle 內的音效
     * @param bundle 遊戲 bundle
     */
    private async loadAudio(bundle: AssetManager.Bundle): Promise<void> {
        return new Promise<void>(resolve => {
            let loadedCount = 0;
            const checkComplete = () => {
                loadedCount++;
                if (loadedCount === 2) resolve();
            };
            bundle?.loadDir('music', AudioClip, (err, audioClips: AudioClip[]) => {
                if (err) {
                    Logger.error('加載音樂失敗:', err);
                    return;
                }
                // 將音樂存入 Map
                audioClips.forEach(clip => {
                    // 檢查是否已存在相同名稱的音樂
                    if (this.musicMap.has(clip.name)) return; // 跳過已存在的音樂
                    const audioSource = this.addComponent(AudioSource)!;
                    audioSource.playOnAwake = false; // 避免自動播放
                    audioSource.clip = clip;
                    this.musicMap.set(clip.name, {
                        startTime: 0,
                        duration: audioSource.duration,
                        audioClip: clip,
                        audioSource,
                        musicPlaying: false
                    });
                });
                Logger.debug(`已加載 ${audioClips.length} 個音樂`);
                checkComplete();

            });
            bundle?.loadDir('sound', AudioClip, (err, audioClips: AudioClip[]) => {
                if (err) {
                    Logger.error('加載音效失敗:', err);
                    return;
                }
                // 將音效存入 Map
                audioClips.forEach(clip => {
                    if (this.soundMap.has(clip.name)) return; // 跳過已存在的音效
                    const audioSource = this.addComponent(AudioSource)!;
                    audioSource.playOnAwake = false; // 避免自動播放
                    audioSource.clip = clip;
                    this.soundMap.set(clip.name, {
                        startTime: 0,
                        duration: audioSource.duration,
                        audioClip: clip,
                        audioSource
                    });
                });
                Logger.debug(`已加載 ${audioClips.length} 個音效`);
                checkComplete();
            });
        });
    }

    /**
     * 檢查是否支持AudioContext
     * @returns 是否支持AudioContext
     */
    private async onUserInteraction() {
        try {
            if (this.isAudioContextRunning)
                return true;
            // 檢查瀏覽器是否支持 AudioContext
            const AudioContextClass = ((window as any).webkitAudioContext || window.AudioContext);
            if (!AudioContextClass) {
                Logger.debug('不支援AudioContext返回true');
                this.isAudioContextRunning = true;
                return true;
            }

            const audioContext = new AudioContextClass();
            // Safari需要特別處理
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }

            this.isAudioContextRunning = audioContext.state === 'running';
            return this.isAudioContextRunning;
        } catch (error) {
            Logger.debug('AudioContext 初始化失敗', error);
            this.isAudioContextRunning = true;
            return true;
        }
    }

    //=================================== Sound控制 ===================================
    /**
     * 播放音效
     * @param audioName 音效名稱
     * @param loop 是否循環
     */
    public async playSound(audioName: string, loop: boolean = false) {
        const audioInfo = this.soundMap.get(audioName)!;
        if (!audioInfo) return;
        audioInfo.startTime = Date.now(); // 更新開始時間(背景運行時也要記錄)
        audioInfo.audioSource.loop = loop;
        audioInfo.audioSource.currentTime = 0;
        if (!(await this.onUserInteraction()) || this.isSoundMuted || this.isInBackground) return;
        audioInfo.audioSource.volume = 1;
        audioInfo.audioSource.play();
    }

    /**
     * 播放獨立音效(重疊性音效使用)建議音效長度小於1秒
     * @param audioName 音效名稱
     */
    public async playOnceSound(audioName: string) {
        const audioInfo = this.soundMap.get(audioName)!;
        if (!audioInfo) return;
        const audioClip = audioInfo.audioClip;
        audioInfo.audioSource.currentTime = 0;
        if (!(await this.onUserInteraction()) || this.isSoundMuted || this.isInBackground) return; // 檢查音效開關和後台狀態
        audioInfo.audioSource.volume = 1;
        audioInfo.audioSource.playOneShot(audioClip);
    }

    /**
     * 停止指定音效(淡出)
     * @param audioName 音效名稱
     */
    public stopSound(audioName: string) {
        const audioInfo = this.soundMap.get(audioName)!;
        audioInfo.audioSource.loop = false;//停止循環
        audioInfo.startTime = Date.now() - audioInfo.duration * 1000;//代表音效播完(已超過音頻時間)
        tween(audioInfo.audioSource).to(0.3, { volume: 0 }).call(() => {
            audioInfo.audioSource.stop();
        }).start();
    }

    /**
     * 設定音效靜音
     * @param mute 是否靜音
     */
    public setSoundMute(mute: boolean) {
        this.isSoundMuted = mute;
        this.isSoundMuted ? this.offSound() : this.onSound();
    }
    //=================================== Sound控制 ===================================


    //=================================== Music控制 ===================================
    /**
     * 播放音樂(會自動恢復音樂音量)
     * @param audioName 音樂名稱(固定循環)
     */
    public async playMusic(audioName: string) {
        //如果背景音樂變小，則先恢復音樂
        if (this.setMusicVolume < 1) this.editMusicVolume(1);

        //判斷music的Map哪個聲音在播放
        for (const audioInfo of this.musicMap.values()) {
            if (!audioInfo) continue;
            if (audioInfo.musicPlaying && audioInfo.audioClip.name !== audioName) {
                audioInfo.musicPlaying = false;//設置為未播放
                //這邊的聲音淡出不會受Tween.stopAllByTag影響，避免切到後台時被停掉
                tween(audioInfo.audioSource).to(0.3, { volume: 0 }).call(() => {
                    audioInfo.audioSource.stop();//停止播放該音效
                }).start();
            }
        }
        const audioInfo = this.musicMap.get(audioName)!;
        if (!audioInfo) return;
        audioInfo.audioSource.loop = true;//循環播放
        audioInfo.musicPlaying = true;//設置為正在播放
        if (this.isMusicMuted) audioInfo.audioSource.volume = 0;
        audioInfo.audioSource.play();//重頭播放(背景運行時也要啟用播放)
        if (!(await this.onUserInteraction()) || this.isMusicMuted || this.isInBackground) return;
        this.audioTween(audioInfo.audioSource).to(0.3, { volume: 1 }).start();
    }

    /**
     * 音樂音量調整
     * @param volume 音量
     */
    public async editMusicVolume(volume: number) {
        this.setMusicVolume = volume;//紀錄背景音量
        if (!(await this.onUserInteraction()) || this.isMusicMuted || this.isInBackground) return;
        for (const audioInfo of this.musicMap.values()) {
            if (!audioInfo) continue;
            this.audioTween(audioInfo.audioSource).to(0.3, { volume }).start();
        }
    }

    /**
     * 停止指定音樂(淡出)
     * @param audioName 音樂名稱
     */
    public stopMusic(audioName: string) {
        const audioInfo = this.musicMap.get(audioName)!;
        tween(audioInfo.audioSource).to(0.3, { volume: 0 }).call(() => {
            audioInfo.audioSource.stop();
        }).start();
    }

    /**
     * 設定音樂靜音
     * @param mute 是否靜音
     */
    public setMusicMute(mute: boolean) {
        this.isMusicMuted = mute;
        this.isMusicMuted ? this.offMusic() : this.onMusic();
    }
    //=================================== Music控制 ===================================


    //=================================== Audio整體控制 ===================================
    /**
     * 隱藏遊戲時強制靜音
     */
    private onGameHide() {
        this.isInBackground = true;
        Tween.stopAllByTag('audio' as any);//停止所有聲音類的Tween
        this.offSound();
        this.offMusic();
    }

    /**
     * 顯示遊戲時恢復音效
     */
    private onGameShow() {
        this.isInBackground = false;
        this.isMusicMuted ? this.offMusic() : this.onMusic();
        this.isSoundMuted ? this.offSound() : this.onSound();
    }

    /**
     * 設定所有聲音狀態
     */
    // public setAudioMute(mute: boolean) {
    //     this.isSoundMuted = mute;
    //     this.isMusicMuted = mute;
    //     mute ? this.offSound() : this.onSound();
    //     mute ? this.offMusic() : this.onMusic();
    // }

    /**
     * 恢復音效(恢復靜音)
     */
    private onSound() {
        // this.isSoundMuted = false;
        const currentTime = Date.now();
        //音效接續播放
        for (const audioInfo of this.soundMap.values()) {
            const elapsedTime = (currentTime - audioInfo.startTime) / 1000;//距啟動的經過時間(秒)
            // 如果距啟動的經過時間已經超過音頻長度，則停止播放
            if (elapsedTime >= audioInfo.duration && !audioInfo.audioSource.loop) {
                audioInfo.audioSource.stop();
            } else {
                audioInfo.audioSource.volume = 0;
                audioInfo.audioSource.currentTime = elapsedTime;//設置播放時間點（秒）
                audioInfo.audioSource.play();
                this.audioTween(audioInfo.audioSource).to(0.2, { volume: 1 }).start();//聲音淡入
            }
        }
    }

    /**
     * 關閉音效(靜音)
     */
    private offSound() {
        for (const audioInfo of this.soundMap.values()) {
            audioInfo.audioSource.volume = 0;
        }
    }

    /**
     * 恢復音樂(恢復靜音)
     */
    private onMusic() {
        for (const audioInfo of this.musicMap.values()) {
            if (audioInfo.musicPlaying) {
                this.audioTween(audioInfo.audioSource).to(0.2, { volume: this.setMusicVolume }).start();//聲音淡入
            }
        }
    }

    /**
     * 關閉音樂(靜音)
     */
    private offMusic() {
        for (const audioInfo of this.musicMap.values()) {
            if (audioInfo && audioInfo.musicPlaying) {
                audioInfo.audioSource.volume = 0;//立即靜音
            }
        }
        // for (const audioInfo of this.musicMap.values()) {
        //     audioInfo.audioSource.volume = 0;
        // }
    }
    //=================================== Audio整體控制 ===================================

    /**
     * 音效Tweenc函數
     * @param target 目標
     * @returns 音效淡入淡出
     */
    private audioTween(target: any) {
        return tween(target).tag('audio' as any);
    }
}

export const audioManager = (): AudioManager => AudioManager.getInstance();