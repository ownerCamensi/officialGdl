type GDLConfig = {
    buttonId: string;
    url?: string;
    urls?: string[];
    waitTime?: number;
    messages?: {
        waiting: string;
        ready: string;
        downloading?: string;
    };
    enableSound?: boolean;
    enableVibration?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    analytics?: {
        gaTrackingId?: string;
        customTracker?: (event: string, data?: any) => void;
    };
    showProgress?: boolean;
    progressCallback?: (progress: DownloadProgress) => void;
    showFileSize?: boolean;
    showDownloadSpeed?: boolean;
};
type DownloadProgress = {
    total: number;
    loaded: number;
    percentage: number;
    speed: string;
};
type Plugin = {
    name: string;
    init: (gdl: GameDownloadLib) => void;
};
declare class EventEmitter {
    private events;
    on(event: string, listener: (...args: any[]) => void): void;
    off(event: string, listener: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
}
declare class GameDownloadLib extends EventEmitter {
    private static playSound;
    private static vibrate;
    private static formatSize;
    private static formatSpeed;
    private static getFileSize;
    private static downloadWithProgress;
    plugins: Plugin[];
    registerPlugin(plugin: Plugin): void;
    initDownload(config: GDLConfig): Promise<void>;
}
export { GameDownloadLib as GDL };
export default GameDownloadLib;
declare global {
    interface Window {
        GDL: typeof GameDownloadLib;
    }
}
