import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { DbStructure, IFieldsManager } from '../models/fields.js';
import { ConnectionData } from '../models/sql.js';
import { MySqlResponse, QueryResponse } from '../models/responses.js';
import { WhereCondition, WhereOperator } from '../models/sql.js';
import { DbRecord, DbRecordSet } from '../models/records.js';
import { query } from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import { DbFieldsMap } from '../models/fields.js';
import FieldsManagerFactory from '../factories/FieldsManagerFactory.js';

export class Update {
	private _connectionData: ConnectionData;
	private _fieldsManager?: IFieldsManager;
	//--------------------------------------
	private _from: string = '';
	private _where: WhereCondition[] = [];
	private _object: DbRecord = {};
	//--------------------------------------

	constructor(connectionData: ConnectionData, dbStructure?: DbStructure) {
		this._connectionData = connectionData;
		if (dbStructure) this._fieldsManager = FieldsManagerFactory.create(dbStructure);
	}

	___props(): ObjectOfAny {
		return {
			from: this._from,
			where: this._where,
			object: this._object,
			fieldsManager: this._fieldsManager,
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

	execute = async (): Promise<MySqlResponse> => {
		this.validate();

		const fieldsMap: DbFieldsMap = this._fieldsManager?.getFieldsMap(this._from) || {};
		const sql: string = sqlBuilder.getUpdate(this._from, this._object, this._where, fieldsMap);

		try {
			const result: QueryResponse = await query(this._connectionData, sql);
			const items: DbRecordSet = this._fieldsManager
				? this._fieldsManager.convertRecordset(this._from, result.items)
				: result.items;
			return {
				status: true,
				rows: result.rows,
				items,
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
		if (!this._from) throw new Error('UPDATE cannot be executed if [tableName] has not been set');
		if (this._where.length === 0) throw new Error('UPDATE cannot be executed without any condition');
		if (Object.keys(this._object || {}).length === 0)
			throw new Error('UPDATE cannot be executed if [object] has not been set');
	};
}
