import { ObjectOfAny } from 'mielk-fn/lib/models/common.js';
import { ConnectionData, OperationType } from '../models/sql.js';
import { MySqlProcResponse, MySqlResponse } from '../models/responses.js';
import {
	getChangedRowsFromInfo,
	getConnection,
	getProcCallPacket,
	query,
	toDbFieldsMap,
	toMultiRecordSet,
	toMySqlResponse,
} from '../mysql.js';
import sqlBuilder from '../sqlBuilder.js';
import { DbFieldsMap, TableFieldsMap } from '../models/fields.js';
import { Validation } from '../models/generic.js';
import { Connection, QueryResult } from 'mysql2/promise';
import { SqlProcessingError } from '../errors/SqlProcessingError.js';
import { MultiRecordSet, ProcCallPacket } from '../models/records.js';
import FieldsMapperFactory from '../factories/FieldsMapperFactory.js';

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

	execute = async (fieldsMap?: DbFieldsMap | TableFieldsMap): Promise<MySqlResponse> => {
		const ERR_INVALID_RESPONSE: string = 'Invalid response from mysql2/promise';
		const validation: Validation = this.validate();
		if (!validation.status) {
			return new Promise<MySqlResponse>((res, rej) => rej(new Error(validation.message)));
		} else {
			const sql: string = sqlBuilder.getCallProc(this._name, this._params);

			return new Promise<MySqlResponse>(async (resolve, reject) => {
				try {
					const connection: Connection = await getConnection(this._connectionData);
					const response: QueryResult = await query(sql, connection);
					const packet: ProcCallPacket | undefined = getProcCallPacket(response);
					if (packet) {
						const { affectedRows, info } = packet.header;
						const changedRows: number = getChangedRowsFromInfo(info);
						const items: MultiRecordSet = toMultiRecordSet(packet.items);
						const fields: DbFieldsMap = toDbFieldsMap(fieldsMap);
						const converted: MultiRecordSet = fieldsMap
							? FieldsMapperFactory.create().convertMultiRecordset(items, fields)
							: items;
						const response: MySqlProcResponse = {
							operationType: OperationType.Proc,
							affectedRows,
							changedRows,
							items: converted,
						};
						resolve(toMySqlResponse(response));
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
