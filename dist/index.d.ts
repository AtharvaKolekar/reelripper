declare class ReelRipper {
    constructor();
    private encodedBaseUrl;
    private getUsername;
    private getShortcode;
    getProfileId(a: string | null): Promise<string | null>;
    getMediaURL(src: string): Promise<string[]>;
    getProfileInfo(a: string): Promise<any>;
    getMediaInfo(src: string, comment?: boolean): Promise<any>;
    downloadMedia(src: string, basePath?: string): Promise<any>;
}

export { ReelRipper };
