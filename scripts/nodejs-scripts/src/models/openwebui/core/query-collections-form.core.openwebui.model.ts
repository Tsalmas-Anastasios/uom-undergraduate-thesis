export interface QueryCollectionsForm {
    collection_names: string[];
    query: string;
    k?: number | null;
    k_reranker?: number | null;
    r?: number | null;
    hybrid?: boolean | null;
    hybrid_bm25_weight?: number | null;
}
