import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData } from '../models/sql.js';
import { MySqlProcResponse } from '../models/responses.js';
import { getConnection, isResultSetHeader, query } from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import { TableFieldsMap } from '../models/fields.js';
import { Validation } from '../models/generic.js';
import { Connection } from 'mysql2/promise';
import { SqlProcessingError } from '../errors/SqlProcessingError.js';

export class Proc {
	private _connectionData: ConnectionData;
	//--------------------------------------
	private _name: string = '';
	private _params: (string | number | boolean | null)[] = [];
	//--------------------------------------

	constructor(connectionData: ConnectionData) {
		this._connectionData = connectionData;
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

	execute = async (fieldsMap?: TableFieldsMap): Promise<MySqlProcResponse> => {
		const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<MySqlProcResponse>((res, rej) => rej(new Error(validation.message)));
		} else {
			const sql: string = sqlBuilder.getCallProc(this._name, this._params);

			return new Promise<MySqlProcResponse>(async (resolve, reject) => {
				try {
					const connection: Connection = await getConnection(this._connectionData);
					const response = await query(sql, connection);
					if (isResultSetHeader(response)) {
						const { insertId, affectedRows } = response;
						//Info: "Records: 1  Duplicates: 0  Warnings: 0"
						// resolve({ insertId, affectedRows });
					} else {
						reject(new SqlProcessingError(ERR_INVALID_RESPONSE));
					}
				} catch (err: unknown) {
					reject(err);
				}
			});
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
