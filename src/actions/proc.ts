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
	private _pool: Pool;
	private _name: string = '';
	private _params: (string | number | boolean | null)[] = [];

	constructor(pool: Pool) {
		this._pool = pool;
	}

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

	execute = (): Promise<any> => {
		const sql: string = sqlBuilder.getCallProc(this._name, this._params);
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<JsonRecordSet>((res, rej) => rej(new Error(validation.message)));
		} else {
			return this._pool.query(sql);
		}
	};

	private validate = (): Validation => {
		const errors: string[] = [];
		if (!this._name) errors.push('PROC cannot be executed if [name] has not been set');
		return {
			status: errors.length === 0,
			message: errors.join(),
		};
	};
}
