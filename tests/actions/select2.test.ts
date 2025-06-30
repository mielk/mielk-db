import { ConnectionData, WhereCondition, WhereOperator, OrderRule, OperationType } from '../../src/models/sql';
import { TableFieldsMap } from '../../src/models/fields';
import { Select } from '../../src/actions/select';
import { getSelect } from '../../src/sqlBuilder';
import { SqlProcessingError } from '../../src/errors/SqlProcessingError';
import { DbConnectionError } from '../../src/errors/DbConnectionError';
import { createConnection } from 'mysql2/promise';
import { MySqlResponse, MySqlSelectResponse } from '../../src/models/responses';

const config: ConnectionData = {
	host: 'localhost',
	user: 'root',
	password: 'BQC_7XXzum_YQ46FuN',
	database: 'ling',
};

describe('constructor', () => {
	test('should create a new instance of Select class', async () => {
		const select: Select = new Select(config).from('view___languages');
		const fieldsMap: TableFieldsMap = {
			id: 'language_id',
			symbol: 'symbol',
			originalName: 'original_name',
			isActive: 'is_active',
			// id: 'user_id',
			// name: 'username',
			// password: 'password',
			// firstName: 'first_name',
			// lastName: 'last_name',
			// dateOfBirth: 'date_of_birth',
			// registrationUnix: 'registration_unix',
			// mail: 'mail',
			// mailVerified: 'mail_verified',
			// isActive: 'is_active',
		};
		const expectedResponse: MySqlResponse = {
			operationType: OperationType.Select,
			affectedRows: 1,
			changedRows: 2,
			insertId: 1,
			items: {},
		};

		await select.execute(fieldsMap).then((response: MySqlResponse) => {
			expect(true).toEqual(true);
		});
	});
});
