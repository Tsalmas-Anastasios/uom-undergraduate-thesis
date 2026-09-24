import axios, { AxiosInstance } from 'axios';

import { AxiosConfig } from '../config/axios.config.ts';
import { appConfig } from '../config/index.config.ts';

class AxiosHttpClient {
    public readonly client: AxiosInstance;

    constructor(data: AxiosConfig) {
        let authorizationHeader = {};
        if (data?.authorizationToken !== 'no-value')
            authorizationHeader = {
                Authorization: `Bearer ${data.authorizationToken}`,
            };

        this.client = axios.create({
            baseURL: data.baseURL,
            timeout: data.timeout,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...authorizationHeader,
            },
        });

        this.client.interceptors.request.use((config) => {
            const normalizedHeaders: Record<string, string> = {
                ...(config.headers as Record<string, string> | undefined),
            };

            normalizedHeaders.Accept = normalizedHeaders.Accept ?? 'application/json';
            normalizedHeaders['Content-Type'] =
                normalizedHeaders['Content-Type'] ?? 'application/json';

            if (data?.authorizationToken !== 'no-value')
                normalizedHeaders.Authorization = `Bearer ${data.authorizationToken}`;

            config.headers = normalizedHeaders as typeof config.headers;

            return config;
        });

        this.client.interceptors.response.use(
            (response) => response,
            (error) => Promise.reject(error)
        );
    }
}

export class HttpClient {
    public readonly github: AxiosHttpClient;
    public readonly openwebui: Record<string, AxiosHttpClient>;

    constructor() {
        this.github = new AxiosHttpClient(appConfig.apis.external.github);
        this.openwebui = {
            core: new AxiosHttpClient(appConfig.apis.external.openwebui.core),
        };
    }
}

export const httpClient = new HttpClient();
