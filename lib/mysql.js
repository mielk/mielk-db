var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createConnection } from 'mysql2/promise';
const query = (config, sql) => __awaiter(void 0, void 0, void 0, function* () {
    const connection = yield createConnection(config);
    const [data, fields] = yield connection.execute(sql);
    const result = createQueryResponse(data, fields);
    return result;
});
const createQueryResponse = (data, fieldPackets) => {
    const fields = createFieldsArray(fieldPackets);
    if (Array.isArray(data)) {
        if (data.length === 0) {
            return { items: [], rows: 0, insertId: 0, fields };
        }
        else {
            return { items: data, rows: data.length, insertId: 0, fields };
        }
    }
    else if (isResultSetHeader(data)) {
        return { items: [], rows: data.affectedRows, insertId: data.insertId, fields };
    }
    else {
        throw new Error('Unknown result from MySql');
    }
};
const isResultSetHeader = (value) => value && typeof value === 'object' && 'affectedRows' in value;
const createFieldsArray = (fields) => (fields || []).map((field) => toDbFieldObject(field));
const toDbFieldObject = (field) => ({
    name: field.name,
    type: field.type,
});
export { query };
export default { query };
