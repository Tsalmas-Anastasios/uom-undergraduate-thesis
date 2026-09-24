export class AxiosConfig {
    public readonly baseURL: string;
    public readonly timeout: number;
    public readonly authorizationToken: string;

    constructor(data?: { baseUrl?: string; timeout?: number; authorizationToken?: string }) {
        this.baseURL = data?.baseUrl || 'https://localhost:8080';
        this.timeout = data?.timeout ?? 5000;
        this.authorizationToken = data?.authorizationToken || 'no-value';
    }
}
