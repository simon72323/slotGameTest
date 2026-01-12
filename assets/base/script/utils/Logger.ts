
export class Logger {
    private static _debugSwitch: boolean = false;

    public static get debugSwitch(): boolean {
        return this._debugSwitch;
    }

    public static set debugSwitch(status: boolean) {
        this._debugSwitch = status;
    }

    public static trace(): string | undefined {
        return new Error().stack;
    }

    public static debug(debugMessage: any): void;
    public static debug(componentName: any, ...param: any[]): void;
    public static debug(debugMessage: any, ...param: any[]): void {
        if (this._debugSwitch) {
            if (param.length > 0) {
                console.debug(`[DEBUG] ${debugMessage}`, ...param);
            } else {
                console.debug(`[DEBUG] ${debugMessage}`);
            }
        }
    }

    public static log(...param: any[]): void {
        console.log('[LOG]', ...param);
    }

    public static warn(...params: any[]): void {
        console.warn('[WARN]', ...params);
    }

    public static error(...params: any[]): void {
        console.error('[ERROR]', ...params);
    }

    public static getAt(): string {
        const stack = new Error().stack;
        const callerLine = stack?.split('\n')[2];
        return callerLine || 'unknown location';
    }
}