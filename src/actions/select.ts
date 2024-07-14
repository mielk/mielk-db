import { IFieldsManager } from '../models/fields';
import { ConnectionData, OrderRule } from '../models/sql';
import { MySqlResponse } from '../models/responses';
import { WhereCondition, WhereOperator } from '../models/sql';
import { query } from '../mysql';
import sqlBuilder from '../sqlBuilder';
import { FieldsMap } from '../models/fields';

export class Select {
	private _connectionData: ConnectionData;
	private _fieldsManager?: IFieldsManager;
	//--------------------------------------
	private _from: string = '';
	private _where: WhereCondition[] = [];
	private _fields: string[] = [];
	private _order: OrderRule[] = [];
	//--------------------------------------

	constructor(connectionData: ConnectionData, fieldsManager?: IFieldsManager) {
		this._connectionData = connectionData;
		if (fieldsManager) this._fieldsManager = fieldsManager;
	}

	/* Only for testing purposes */
	___props(): { [key: string]: any } {
		return {
			from: this._from,
			where: this._where,
			fields: this._fields,
			order: this._order,
			fieldsManager: this._fieldsManager,
		};
	}

	/* Assigns table/query name to private variable and returns the object itself. */
	from(value: string): Select {
		if (!value.trim().length) throw new Error('Table name cannot be empty');
		this._from = value;
		return this;
	}

	/* Appends the given WhereCondition object to this objects' private array of WhereConditions and returns the object itself. */
	where(
		field: string,
		operator: WhereOperator = WhereOperator.Equal,
		value: number | string | boolean | null = null
	): Select {
		const condition: WhereCondition = { field, operator, value };
		this._where.push(condition);
		return this;
	}

	/* Appends the given field to this objects' private array of fields and returns the object itself. */
	field(value: string): Select {
		const _value = value.trim().toLowerCase();
		if (!_value.length) {
			// skip - empty field name
		} else if (this._fields.includes(_value)) {
			// skip - such field is already appended
		} else {
			this._fields.push(_value);
		}
		return this;
	}

	/* Appends the given array of fields to this objects' private array of fields and returns the object itself. */
	fields(...value: (string | string[])[]): Select {
		// const _value = value.trim().toLowerCase();
		// if (!_value.length) {
		// 	// skip - empty field name
		// } else if (this._fields.includes(_value)) {
		// 	// skip - such field is already appended
		// } else {
		// 	this._fields.push(_value);
		// }
		return this;
	}

	execute = async (): Promise<MySqlResponse> => {
		this.validate();

		const fieldsMap: FieldsMap = this._fieldsManager?.getPropertyToDbFieldMap(this._from) || {};
		let sql = '';
		sql = sqlBuilder.getSelect(this._fields, this._from, this._where, this._order, fieldsMap);
		const result = await query(this._connectionData, sql);

		return {
			status: false,
			rows: result.rows,
			items: [],
		};
	};

	private validate = (): void => {
		if (!this._from) throw new Error('SELECT cannot be executed if [tableName] has not been set');
	};
}
