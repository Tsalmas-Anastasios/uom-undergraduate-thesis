import type { GitHub } from '../index.model.ts';

export interface SearchResultTextMatch {
    object_url?: string;
    object_type?: string | null;
    property?: string;
    fragment?: string;
    matches?: GitHub.Model.TextMatchFragment[];
}
