/* eslint-disable @typescript-eslint/no-explicit-any */
import type { RawData, SqlClient, sqlQueryParamType } from 'msnodesqlv8/types';
import { MsSqlDbConfig } from '../types/DbConfig.js';
import { Msg } from '../../msg/messageTags.js';

let sql: SqlClient | null = null;
let connectionString = '';

export const getMsSql = async (): Promise<SqlClient> => {
  if (!sql) {
    try {
      sql = await import('msnodesqlv8');
    } catch (e) {
      throw new Error(Msg.mssql.connection.driverNotInstalled);
    }
  }
  return sql;
};

export const initDb = (dbConfig: MsSqlDbConfig): void => {
	const { host, database, user, password, driver} = dbConfig;
	connectionString = `Server=${host};Database=${database};UID=${user};PWD=${password};Driver=${driver}`;
  console.log(connectionString);
}


export const query = async (queryText: string): Promise<any[]> => {
  const sql: SqlClient = await getMsSql();
  return new Promise((resolve, reject) => {
    sql.query(connectionString, queryText, (err, rows) => {
      if (err) reject(err);
      if (rows === undefined) reject();
      else resolve(rows);
    });
  });
};

export const spExecute = async (
  sqlText: string,
  params: sqlQueryParamType[],
): Promise<RawData | undefined> => {
  const sql: SqlClient = await getMsSql();
  return new Promise((resolve, reject) => {
    sql.open(connectionString, (err, conn) => {
      if (err) return reject(err);

      conn.queryRaw(sqlText, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  });
};
