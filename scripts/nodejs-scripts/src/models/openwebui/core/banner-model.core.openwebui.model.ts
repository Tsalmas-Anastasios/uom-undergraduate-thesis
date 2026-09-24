export interface BannerModel {
    id: string;
    type: string;
    title?: string | null;
    content: string;
    dismissible: boolean;
    timestamp: number;
}
