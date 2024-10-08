import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData } from '../models/sql.js';
import { MySqlResponse, QueryResponse } from '../models/responses.js';
import { WhereCondition, WhereOperator } from '../models/sql.js';
import { query } from '../mysql.js';
import { TableFieldsMap } from '../models/fields.js';
import sqlBuilder from '../sqlBuilder.js';

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

	execute = async (fieldsMap?: TableFieldsMap): Promise<MySqlResponse> => {
		this.validate();

		const sql: string = sqlBuilder.getDelete(this._from, this._where, fieldsMap || {});

		try {
			const result: QueryResponse = await query(this._connectionData, sql);
			return {
				status: true,
			};
		} catch (err) {
			const message: string = err instanceof Error ? err.message : 'An unknown error occurred';
			return {
				status: false,
				message,
			};
		}
	};

	private validate = (): void => {
		if (!this._from) throw new Error('DELETE cannot be executed if [tableName] has not been set');
		if (this._where.length === 0) throw new Error('DELETE cannot be executed without any condition');
	};
}
