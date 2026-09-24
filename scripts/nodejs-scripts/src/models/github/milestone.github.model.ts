import type { GitHub } from '../index.model.ts';

export interface Milestone {
    url: string;
    html_url: string;
    labels_url: string;
    id: number;
    node_id: string;
    number: number;
    state: GitHub.Type.MilestoneState;
    title: string;
    description: string | null;
    creator: GitHub.Model.SimpleUser | null;
    open_issues: number;
    closed_issues: number;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
    due_on: string | null;
}
