export enum RequestType {
	Unknown = '',
	Select = 'SELECT',
	Insert = 'INSERT',
	Update = 'UPDATE',
	Delete = 'DELETE',
}

export enum WhereOperator {
	GreaterThan = '>',
	LessThan = '<',
	GreaterEqualThan = '>=',
	LessEqualThan = '<=',
	Equal = '=',
	NotEqual = '<>',
	In = 'IN',
	NotIn = 'NOT IN',
	Like = 'LIKE',
	NotLike = 'NOT LIKE',
}

export interface ConnectionData {
	host: string;
	user: string;
	password: string;
	database: string;
}

export interface WhereCondition {
	field: string;
	operator: WhereOperator;
	value: string | number | boolean | null | (string | number | boolean | null)[];
}

export interface OrderRule {
	field: string;
	ascending: boolean;
}
