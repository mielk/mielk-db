var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WhereOperator } from '../models/sql';
import { query } from '../mysql';
import sqlBuilder from '../sqlBuilder';
export class Update {
    constructor(connectionData, fieldsManager) {
        this._from = '';
        this._where = [];
        this._id = 0;
        this._object = {};
        this.execute = () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            this.validate();
            const fieldsMap = ((_a = this._fieldsManager) === null || _a === void 0 ? void 0 : _a.getPropertyToDbFieldMap(this._from)) || {};
            let sql = '';
            if (this._id) {
                sql = sqlBuilder.getUpdate(this._from, this._object, this._id, fieldsMap);
            }
            else {
                sql = sqlBuilder.getUpdate(this._from, this._object, this._where, fieldsMap);
            }
            const result = yield query(this._connectionData, sql);
            return {
                status: false,
                rows: result.rows,
                items: [],
            };
        });
        this.validate = () => {
            if (!this._from)
                throw new Error('UPDATE cannot be executed if [tableName] has not been set');
            if (!this._id && this._where.length === 0)
                throw new Error('UPDATE cannot be executed without any condition');
            if (Object.keys(this._object || {}).length === 0)
                throw new Error('UPDATE cannot be executed if [object] has not been set');
        };
        this._connectionData = connectionData;
        if (fieldsManager)
            this._fieldsManager = fieldsManager;
    }
    ___props() {
        return {
            from: this._from,
            id: this._id,
            where: this._where,
            object: this._object,
            fieldsManager: this._fieldsManager,
        };
    }
    from(value) {
        if (!value.trim().length)
            throw new Error('Table name cannot be empty');
        this._from = value;
        return this;
    }
    where(field, operator = WhereOperator.Equal, value = null) {
        const condition = { field, operator, value };
        this._where.push(condition);
        return this;
    }
    whereId(id) {
        if (typeof id === 'number' && id <= 0)
            throw new Error('Id must be greater than 0');
        if (id === '')
            throw new Error('Id cannot be empty string');
        this._id = id;
        return this;
    }
    object(object) {
        if (Object.keys(object).length === 0)
            throw new Error('Object cannot be empty');
        this._object = object;
        return this;
    }
}
