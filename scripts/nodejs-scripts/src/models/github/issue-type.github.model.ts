import type { GitHub } from '../index.model.ts';

export interface IssueType {
    id: number;
    node_id: string;
    name: string;
    description: string | null;
    color?: GitHub.Type.IssueTypeColor;
    created_at?: string;
    updated_at?: string;
    is_enabled?: boolean;
}
