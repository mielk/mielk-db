import { OperationType } from './models/sql.js';

const getOperationTypeFromSql = (sql: string): OperationType => {
	for (const requestType of Object.values(OperationType)) {
		if (requestType.length && sql.toUpperCase().trim().startsWith(requestType)) return requestType;
	}
	return OperationType.Unknown;
};

export default { getOperationTypeFromSql };
