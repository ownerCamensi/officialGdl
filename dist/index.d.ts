type GDLConfig = {
    buttonId: string;
    url: string;
    waitTime?: number;
    messages?: {
        waiting: string;
        ready: string;
    };
    enableSound?: boolean;
    enableVibration?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    analytics?: {
        gaTrackingId?: string;
        customTracker?: (event: string) => void;
    };
};
declare class GameDownloadLib {
    private static playSound;
    private static vibrate;
    static initDownload(config: GDLConfig): void;
}
export { GameDownloadLib as GDL };
export default GameDownloadLib;
declare global {
    interface Window {
        GDL: typeof GameDownloadLib;
    }
}
