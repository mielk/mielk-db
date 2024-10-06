import { ObjectOfAny, ObjectOfPrimitives } from 'mielk-fn/lib/models/common.js';
import { DbStructure, IFieldsManager } from '../models/fields.js';
import { ConnectionData, WhereOperator } from '../models/sql.js';
import { MySqlResponse, QueryResponse } from '../models/responses.js';
import { DbRecord, DbRecordSet } from '../models/records.js';
import { query } from '../mysql.js';
import { DbFieldsMap } from '../models/fields.js';
import sqlBuilder from '../sqlBuilder.js';
import FieldsManagerFactory from '../factories/FieldsManagerFactory.js';

export class Insert {
	private _connectionData: ConnectionData;
	private _fieldsManager?: IFieldsManager;
	//--------------------------------------
	private _into: string = '';
	private _object: DbRecord = {};
	//--------------------------------------

	constructor(connectionData: ConnectionData, dbStructure?: DbStructure) {
		this._connectionData = connectionData;
		if (dbStructure) this._fieldsManager = FieldsManagerFactory.create(dbStructure);
	}

	___props(): ObjectOfAny {
		return {
			into: this._into,
			object: this._object,
			fieldsManager: this._fieldsManager,
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

	execute = async (): Promise<MySqlResponse> => {
		this.validate();

		const fieldsMap: DbFieldsMap = this._fieldsManager?.getFieldsMap(this._into) || {};
		const sqlInsert: string = sqlBuilder.getInsert(this._into, this._object, fieldsMap);

		try {
			const result: QueryResponse = await query(this._connectionData, sqlInsert);
			const insertId: number = result.insertId || -1;
			const sqlSelect: string = sqlBuilder.getSelect(
				undefined,
				this._into,
				[{ field: 'id', operator: WhereOperator.Equal, value: insertId }],
				undefined,
				fieldsMap
			);

			const postCheck: QueryResponse = await query(this._connectionData, sqlSelect);
			const items: DbRecordSet = this._fieldsManager
				? this._fieldsManager.convertRecordset(this._into, postCheck.items)
				: postCheck.items;
			return {
				status: true,
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
		if (!this._into) throw new Error('INSERT cannot be executed if [tableName] has not been set');
		if (Object.keys(this._object || {}).length === 0)
			throw new Error('INSERT cannot be executed if [object] has not been set');
	};
}
