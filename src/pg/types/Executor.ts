import { QueryResult, QueryResultRow } from "pg";

export interface QueryExecutor {
    query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
};