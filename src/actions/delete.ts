import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData } from '../models/sql.js';
import { WhereCondition, WhereOperator } from '../models/sql.js';
import { TableFieldsMap } from '../models/fields.js';
import sqlBuilder from '../sqlBuilder.js';
import { MySqlDeleteResponse } from '../models/responses.js';
import { Connection, ResultSetHeader } from 'mysql2/promise';
import { Validation } from '../models/generic.js';
import { SqlProcessingError } from '../errors/SqlProcessingError.js';
import { getConnection, getResultSetHeader, isResultSetHeader, query } from '../mysql.js';

export class Delete {
	private _connectionData: ConnectionData;
	//--------------------------------------
	private _from: string = '';
	private _where: WhereCondition[] = [];
	//--------------------------------------

	constructor(connectionData: ConnectionData) {
		this._connectionData = connectionData;
	}

	/* Only for testing purposes */
	___props(): ObjectOfAny {
		return {
			from: this._from,
			where: this._where,
		};
	}

	/* Assigns table/query name to private variable and returns the object itself. */
	from(value: string): Delete {
		if (!value.trim().length) throw new Error('Table name cannot be empty');
		this._from = value;
		return this;
	}

	/* Appends the given WhereCondition object to this objects' private array of WhereConditions and returns the object itself. */
	where(
		field: string,
		operator: WhereOperator = WhereOperator.Equal,
		value: number | string | boolean | null = null
	): Delete {
		const condition: WhereCondition = { field, operator, value };
		this._where.push(condition);
		return this;
	}

	/* Appends the given WhereCondition object to this objects' private array of WhereConditions and returns the object itself. */
	conditions(...conditions: (WhereCondition | WhereCondition[])[]): Delete {
		const flat: WhereCondition[] = [...conditions].flat();
		this._where.push(...flat);
		return this;
	}
	//: Promise<MySqlDeleteResponse>
	execute = async (fieldsMap?: TableFieldsMap) => {
		const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<MySqlDeleteResponse>((res, rej) => rej(new Error(validation.message)));
		} else {
			const sql: string = sqlBuilder.getDelete(this._from, this._where, fieldsMap || {});
			return new Promise<MySqlDeleteResponse>(async (resolve, reject) => {
				try {
					const response: ResultSetHeader = await getResultSetHeader(sql, this._connectionData);
					const { affectedRows } = response;
					resolve({ affectedRows });
				} catch (err: unknown) {
					reject(err);
				}
			});
		}
	};

	private validate = (): Validation => {
		const errors: string[] = [];
		if (!this._from) errors.push('DELETE cannot be executed if [tableName] has not been set');
		if (this._where.length === 0) errors.push('DELETE cannot be executed without any condition');
		return {
			status: errors.length === 0,
			message: errors.join(),
		};
	};
}
