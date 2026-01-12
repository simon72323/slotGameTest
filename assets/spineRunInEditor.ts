import { sp } from 'cc';
import { EDITOR } from 'cc/env';

if (EDITOR) {
    Object.defineProperty(sp.Skeleton.prototype, 'updateAnimation', {
        value(_dt: number): void {
            this.markForUpdateRenderData();
            // if (EDITOR_NOT_IN_PREVIEW) return;
            // if (this.paused) return;
            if (this.isAnimationCached()) {
                // On realTime mode, dt is multiplied at native side.
                const dt = _dt * this._timeScale * 1.0;
                if (this._isAniComplete) {
                    if (this._animationQueue.length === 0 && !this._headAniInfo) {
                        const frameCache = this._animCache;
                        if (frameCache && frameCache.isInvalid()) {
                            frameCache.updateToFrame(0);
                            const frames = frameCache.frames;
                            this._curFrame = frames[frames.length - 1];
                        }
                        return;
                    }
                    if (!this._headAniInfo) {
                        this._headAniInfo = this._animationQueue.shift()!;
                    }
                    this._accTime += dt;
                    if (this._accTime > this._headAniInfo?.delay) {
                        const aniInfo = this._headAniInfo;
                        this._headAniInfo = null;
                        this.setAnimation(0, aniInfo?.animationName, aniInfo?.loop);
                    }
                    return;
                }
                this._updateCache(dt);
            } else {
                this._instance!.updateAnimation(_dt);
            }
        }
    });
}

