export enum OperationType {
	Unknown = '',
	Select = 'SELECT',
	Insert = 'INSERT',
	Update = 'UPDATE',
	Delete = 'DELETE',
	Proc = 'PROC',
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

export type ConnectionData = {
	host: string;
	user: string;
	password: string;
	database: string;
};

export type WhereCondition = {
	field: string;
	operator: WhereOperator;
	value: string | number | boolean | null | (string | number | boolean | null)[];
};

export type OrderRule = {
	field: string;
	ascending: boolean;
};
