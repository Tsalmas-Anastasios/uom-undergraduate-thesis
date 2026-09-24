import type { GitHub } from '../index.model.ts';

export interface GitHubApp {
    id: number;
    slug?: string;
    node_id: string;
    client_id?: string;
    owner: GitHub.Type.GitHubAppOwner;
    name: string;
    description: string | null;
    external_url: string;
    html_url: string;
    created_at: string;
    updated_at: string;
    permissions: GitHub.Model.GitHubAppPermissions;
    events: string[];
    installations_count?: number;
}
