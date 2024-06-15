import { RequestType } from './models/sql';

const getRequestTypeFromSql = (sql: string): RequestType => {
	for (const requestType of Object.values(RequestType)) {
		if (requestType.length && sql.toUpperCase().trim().startsWith(requestType)) return requestType;
	}
	return RequestType.Unknown;
};

export default { getRequestTypeFromSql };
