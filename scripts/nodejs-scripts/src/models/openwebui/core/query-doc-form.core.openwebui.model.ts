/* eslint-disable unicorn/prevent-abbreviations */
export interface QueryDocumentForm {
    collection_name: string;
    query: string;
    k?: number | null;
    k_reranker?: number | null;
    r?: number | null;
    hybrid?: boolean | null;
}
