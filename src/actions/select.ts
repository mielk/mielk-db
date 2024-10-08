import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData, OrderRule } from '../models/sql.js';
import { MySqlResponse, QueryResponse } from '../models/responses.js';
import { WhereCondition, WhereOperator } from '../models/sql.js';
import { query } from '../mysql.js';
import { TableFieldsMap } from '../models/fields.js';
import sqlBuilder from '../sqlBuilder.js';
import FieldsMapperFactory from '../factories/FieldsMapperFactory.js';
import { DbRecordSet } from '../models/records.js';

export class Select {
	private _connectionData: ConnectionData;
	//--------------------------------------
	private _from: string = '';
	private _where: WhereCondition[] = [];
	private _fields: string[] = [];
	private _order: OrderRule[] = [];
	//--------------------------------------

	constructor(connectionData: ConnectionData) {
		this._connectionData = connectionData;
	}

	/* Only for testing purposes */
	___props(): ObjectOfAny {
		return {
			from: this._from,
			where: this._where,
			fields: this._fields,
			order: this._order,
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

	/* Appends the given WhereCondition object to this objects' private array of WhereConditions and returns the object itself. */
	conditions(...conditions: (WhereCondition | WhereCondition[])[]): Select {
		const flat: WhereCondition[] = [...conditions].flat();
		this._where.push(...flat);
		return this;
	}

	/* Appends the given field to this objects' private array of fields and returns the object itself. */
	fields(...items: (string | string[])[]): Select {
		const flat: string[] = [...items].flat();
		flat.forEach((item) => {
			const trimmed = item.trim();
			if (trimmed.length && this._fields.every((a) => a.toLowerCase() !== trimmed.toLowerCase())) {
				this._fields.push(trimmed);
			}
		});
		return this;
	}

	/* Appends the given field to this objects' private array of fields and returns the object itself. */
	order(...orders: (OrderRule | OrderRule[])[]): Select {
		const flat: OrderRule[] = [...orders].flat();
		this._order.push(...flat);
		return this;
	}

	execute = async (fieldsMap?: TableFieldsMap): Promise<MySqlResponse> => {
		this.validate();

		const sql: string = sqlBuilder.getSelect(this._fields, this._from, this._where, this._order, fieldsMap || {});

		try {
			const result: QueryResponse = await query(this._connectionData, sql);
			const items: DbRecordSet = fieldsMap
				? FieldsMapperFactory.create().convertRecordset(result.items, fieldsMap)
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
		if (!this._from) throw new Error('SELECT cannot be executed if [tableName] has not been set');
	};
}
