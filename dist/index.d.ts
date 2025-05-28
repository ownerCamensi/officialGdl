interface GDLMessages {
  waiting: string;
  ready: string;
}

interface GDLAnalytics {
  gaTrackingId?: string;
  customTracker?: (event: string) => void;
}

type GDLTheme = 'light' | 'dark' | 'auto';

interface GDLConfig {
  buttonId: string;
  url: string;
  waitTime?: number;
  messages?: GDLMessages;
  enableSound?: boolean;
  enableVibration?: boolean;
  theme?: GDLTheme;
  analytics?: GDLAnalytics;
}

declare class GameDownloadLib {
  static initDownload(config: GDLConfig): void;
  private static playSound(): void;
  private static vibrate(): void;
}

export { GameDownloadLib as GDL };
export default GameDownloadLib;
