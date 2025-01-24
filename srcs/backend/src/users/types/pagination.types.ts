export interface PaginatedUsers {
    data: any[];
    meta: {
        total: number;
        page: number;
        lastPage: number;
    }
} 