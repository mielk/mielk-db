import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData, OperationType } from '../models/sql.js';
import { WhereCondition, WhereOperator } from '../models/sql.js';
import { DbRecord, DbRecordSet } from '../models/records.js';
import {
	getChangedRowsFromInfo,
	getConnection,
	getResultSetHeader,
	isResultSetHeader,
	query,
	toMySqlResponse,
} from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import { TableFieldsMap } from '../models/fields.js';
import FieldsMapperFactory from '../factories/FieldsMapperFactory.js';
import { Validation } from '../models/generic.js';
import { MySqlResponse, MySqlUpdateResponse } from '../models/responses.js';
import { SqlProcessingError } from '../errors/SqlProcessingError.js';
import { Connection, ResultSetHeader } from 'mysql2/promise';

export class Update {
	private _connectionData: ConnectionData;
	//--------------------------------------
	private _from: string = '';
	private _where: WhereCondition[] = [];
	private _object: DbRecord = {};
	//--------------------------------------

	constructor(connectionData: ConnectionData) {
		this._connectionData = connectionData;
	}

	___props(): ObjectOfAny {
		return {
			from: this._from,
			where: this._where,
			object: this._object,
		};
	}

	from(value: string): Update {
		if (!value.trim().length) throw new Error('Table name cannot be empty');
		this._from = value;
		return this;
	}

	where(
		field: string,
		operator: WhereOperator = WhereOperator.Equal,
		value: number | string | boolean | null = null
	): Update {
		const condition: WhereCondition = { field, operator, value };
		this._where.push(condition);
		return this;
	}

	object(object: { [key: string]: string | number | boolean | null }): Update {
		if (Object.keys(object).length === 0) throw new Error('Object cannot be empty');
		this._object = object;
		return this;
	}

	/* Appends the given WhereCondition object to this objects' private array of WhereConditions and returns the object itself. */
	conditions(...conditions: (WhereCondition | WhereCondition[])[]): Update {
		const flat: WhereCondition[] = [...conditions].flat();
		this._where.push(...flat);
		return this;
	}

	execute = async (fieldsMap?: TableFieldsMap): Promise<MySqlResponse> => {
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<MySqlResponse>((res, rej) => rej(new Error(validation.message)));
		} else {
			const sql: string = sqlBuilder.getUpdate(this._from, this._object, this._where, fieldsMap || {});
			return new Promise<MySqlResponse>(async (resolve, reject) => {
				try {
					const response: ResultSetHeader = await getResultSetHeader(sql, this._connectionData);
					const { affectedRows, info } = response;
					const changedRows = getChangedRowsFromInfo(info);
					resolve(toMySqlResponse({ operationType: OperationType.Update, affectedRows, changedRows }));
				} catch (err: unknown) {
					reject(err);
				}
			});
		}
	};

	private validate = (): Validation => {
		const errors: string[] = [];
		if (!this._from) errors.push('UPDATE cannot be executed if [tableName] has not been set');
		if (this._where.length === 0) errors.push('UPDATE cannot be executed without any condition');
		if (Object.keys(this._object || {}).length === 0)
			errors.push('UPDATE cannot be executed if [object] has not been set');
		return {
			status: errors.length === 0,
			message: errors.join(),
		};
	};
}
