import { GitHub } from '../index.model.ts';

export interface SearchIssuesResponse {
    total_count: number;
    incomplete_results: boolean;
    items: GitHub.Model.GithubSearchResultItem[];
}
