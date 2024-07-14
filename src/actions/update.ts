import { DbStructure, IFieldsManager } from '../models/fields';
import { ConnectionData } from '../models/sql';
import { MySqlResponse } from '../models/responses';
import { WhereCondition, WhereOperator } from '../models/sql';
import { query } from '../mysql';
import sqlBuilder from '../sqlBuilder';
import { DbFieldsMap } from '../models/fields';
import FieldsManagerFactory from '../factories/FieldsManagerFactory';
import { FieldsManager } from '../fieldsManager';

export class Update {
	private _connectionData: ConnectionData;
	private _fieldsManager?: IFieldsManager;
	//--------------------------------------
	private _from: string = '';
	private _where: WhereCondition[] = [];
	private _object: { [key: string]: string | number | boolean | null } = {};
	//--------------------------------------

	constructor(connectionData: ConnectionData, dbStructure?: DbStructure) {
		this._connectionData = connectionData;
		if (dbStructure) this._fieldsManager = FieldsManagerFactory.create(dbStructure);
	}

	___props(): { [key: string]: any } {
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

	execute = async (): Promise<MySqlResponse> => {
		this.validate();

		const fieldsMap: DbFieldsMap = this._fieldsManager?.getFieldsMap(this._from) || {};
		const sql: string = sqlBuilder.getUpdate(this._from, this._object, this._where, fieldsMap);
		const result = await query(this._connectionData, sql);

		return {
			status: false,
			rows: result.rows,
			items: [],
		};
	};

	private validate = (): void => {
		if (!this._from) throw new Error('UPDATE cannot be executed if [tableName] has not been set');
		if (this._where.length === 0) throw new Error('UPDATE cannot be executed without any condition');
		if (Object.keys(this._object || {}).length === 0)
			throw new Error('UPDATE cannot be executed if [object] has not been set');
	};
}
