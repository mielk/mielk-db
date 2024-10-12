import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData } from '../models/sql.js';
import { DbRecord } from '../models/records.js';
import { getConnection, getResultSetHeader, isResultSetHeader, query } from '../mysql.js';
import { TableFieldsMap } from '../models/fields.js';
import sqlBuilder from '../sqlBuilder.js';
import { Validation } from '../models/generic.js';
import { MySqlInsertResponse } from '../models/responses.js';
import { Connection, ResultSetHeader } from 'mysql2/promise';
import { SqlProcessingError } from '../errors/SqlProcessingError.js';
import { objects } from 'mielk-fn';

export class Insert {
	private _connectionData: ConnectionData;
	//--------------------------------------
	private _into: string = '';
	private _object: DbRecord = {};
	//--------------------------------------

	constructor(connectionData: ConnectionData) {
		this._connectionData = connectionData;
	}

	___props(): ObjectOfAny {
		return {
			into: this._into,
			object: this._object,
		};
	}

	into(value: string): Insert {
		if (!value.trim().length) throw new Error('Table name cannot be empty');
		this._into = value;
		return this;
	}

	object(object: DbRecord): Insert {
		if (Object.keys(object).length === 0) throw new Error('Object cannot be empty');
		this._object = object;
		return this;
	}

	execute = async (fieldsMap?: TableFieldsMap): Promise<MySqlInsertResponse> => {
		const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<MySqlInsertResponse>((res, rej) => rej(new Error(validation.message)));
		} else {
			const sql: string = sqlBuilder.getInsert(this._into, this._object, fieldsMap || {});
			return new Promise<MySqlInsertResponse>(async (resolve, reject) => {
				try {
					const response: ResultSetHeader = await getResultSetHeader(sql, this._connectionData);
					const { insertId, affectedRows } = response;
					//Info: "Records: 1  Duplicates: 0  Warnings: 0"
					resolve({ insertId, affectedRows });
				} catch (err: unknown) {
					reject(err);
				}
			});
		}
	};

	private validate = (): Validation => {
		const errors: string[] = [];
		if (!this._into) errors.push('INSERT cannot be executed if [tableName] has not been set');
		if (!objects.isNonEmptyObject(this._object)) errors.push('INSERT cannot be executed if [object] has not been set');
		return {
			status: errors.length === 0,
			message: errors.join(),
		};
	};
}
