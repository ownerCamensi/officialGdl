type InitOptions = {
    buttonId: string;
    url: string;
    fallbackUrl?: string;
    waitTime?: number;
    trackClicks?: boolean;
    accessProtection?: "none" | "scroll" | "timer";
    messages?: {
        waiting?: string;
        ready?: string;
        failed?: string;
    };
    theme?: "light" | "dark" | string;
};
export declare const GDL: {
    init(options: InitOptions): void;
};
export {};
