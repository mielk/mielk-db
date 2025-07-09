import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData, OperationType } from '../models/sql.js';
import { MySqlProcResponse, MySqlResponse } from '../models/responses.js';
import {
	getChangedRowsFromInfo,
	getConnection,
	getProcCallPacket,
	query,
	query2,
	toDbFieldsMap,
	toMultiRecordSet,
	toMySqlResponse,
} from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import { DbFieldsMap, JsonRecordSet, JsonValue, TableFieldsMap } from '../models/fields.js';
import { Validation } from '../models/generic.js';
import { Connection, Query, QueryResult, RowDataPacket } from 'mysql2/promise';
import { SqlProcessingError } from '../errors/SqlProcessingError.js';
import { MultiRecordSet, ProcCallPacket } from '../models/records.js';
import FieldsMapperFactory from '../factories/FieldsMapperFactory.js';
import { Pool } from 'mysql2/promise';
import Db from '../db.js';

export class Proc {
	private _name: string = '';
	private _params: (string | number | boolean | null)[] = [];

	___props(): ObjectOfAny {
		return {
			name: this._name,
			params: this._params,
		};
	}

	name(value: string): Proc {
		if (!value.trim().length) throw new Error('Procedure name cannot be empty');
		this._name = value;
		return this;
	}

	params(...values: (string | number | boolean | null)[]): Proc {
		this._params.push(...values);
		return this;
	}

	execute = (pool: Pool): Promise<any> => {
		const sql: string = sqlBuilder.getCallProc(this._name, this._params);
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<JsonRecordSet>((res, rej) => rej(new Error(validation.message)));
		} else {
			return pool.query(sql);
		}
	};

	// execute2 = async (pool: Pool): Promise<JsonRecordSet> => {
	// 	const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
	// 	const validation: Validation = this.validate();
	// 	if (!validation.status) {
	// 		return new Promise<JsonRecordSet>((res, rej) => rej(new Error(validation.message)));
	// 	} else {
	// 		const sql: string = 'SELECT * FROM users';
	// 		// return pool.query(sql);
	// 		// const sql: string = sqlBuilder.getCallProc(this._name, this._params);

	// 		// const pool: Pool = Db.getPool();
	// 		// const sql: string = 'CALL sp___users___get()';

	// 		// const z = await pool.query('CALL sp___users___get()');

	// 		// return new Promise<JsonRecordSet>((res, rej) => {
	// 		// 	try {
	// 		// 		pool.query(sql).then((result) => {
	// 		// 			const x = 1;
	// 		// 		});
	// 		// 	} catch (err) {
	// 		// 		console.error('Database error:', err);
	// 		// 		const x = 1;
	// 		// 	}
	// 		// });
	// 	}
	// };

	private validate = (): Validation => {
		const errors: string[] = [];
		if (!this._name) errors.push('PROC cannot be executed if [name] has not been set');
		return {
			status: errors.length === 0,
			message: errors.join(),
		};
	};
}
