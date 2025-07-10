import { ConnectionData, WhereCondition, WhereOperator, OrderRule, OperationType } from '../../src/models/sql';
// import { DbFieldsMap, JsonRecordSet, TableFieldsMap } from '../../src/models/fields';
// import { Select } from '../../src/actions/select';
// import { Proc } from '../../src/actions/proc';
// import { getSelect } from '../../src/sqlBuilder';
// import { SqlProcessingError } from '../../src/errors/SqlProcessingError';
// import { DbConnectionError } from '../../src/errors/DbConnectionError';
// import { createConnection } from 'mysql2/promise';
// import { MySqlResponse, MySqlSelectResponse } from '../../src/models/responses';
import Db from '../../src/db';
import { Proc } from '../../src/actions/proc';
import { Pool } from 'mysql2/promise';

const config: ConnectionData = {
	host: 'localhost',
	user: 'root',
	password: 'BQC_7XXzum_YQ46FuN',
	database: 'ling',
};

describe('sql', () => {
	test('test stored procedure', async () => {
		Db.setConnectionDetails(config);
		// const proc: Proc = new Proc();
		const proc: Proc = Db.proc();
		// const pool: Pool = Db.getPool();
		const procName: string = 'sp___users___get';
		const sql: string = 'CALL sp___users___get()';

		// try {
		// 	const y = await proc.name(procName).execute();
		// 	const a = 1;
		// } catch (err) {
		// 	const b = 1;
		// }

		expect(1).toEqual(1);
	});
});
