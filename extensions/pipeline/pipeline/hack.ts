import { clamp, RenderTexture } from "cc";

RenderTexture.prototype.resize = function resize (width: number, height: number) {
    this._width = Math.floor(clamp(width, 1, 4096));
    this._height = Math.floor(clamp(height, 1, 4096));
    if (this._window) {
        this._window.resize(this._width, this._height);
    }
    this.emit('resize', this._window);
}
