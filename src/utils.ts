import { RequestType } from './models/statement';

const getRequestTypeFromSql = (sql: string): RequestType => {
	for (const requestType of Object.values(RequestType)) {
		if (requestType.length && sql.toUpperCase().includes(requestType)) return requestType;
	}
	return RequestType.Unknown;
};

export default { getRequestTypeFromSql };
