const PARENT_FOLDER: string = 'db/';

const ___MSSQL___: string = `${PARENT_FOLDER}/mssql`;
const ___MSSQL_CONNECTION___: string = `${___MSSQL___}/connection`;
const ___PG___: string = `${PARENT_FOLDER}/pg`;
const ___PG_CONNECTION___: string = `${___PG___}/connection`;
const ___PG_TRANSACTIONS___: string = `${___PG___}/transactions`;
const ___SSH___: string = `${PARENT_FOLDER}/ssh`;

export const Msg = {
    mssql: {
        connection: {
            driverNotInstalled: `${___MSSQL_CONNECTION___}:driverNotInstalled`, //'MSSQL driver not installed'
        }
    },
    pg: {
        connection: {
            corsBlocked: `${___PG_CONNECTION___}:corsBlocked`,
            notInitialized: `${___PG_CONNECTION___}:notInitialized`,
            postgreConnectionError: `${___PG_CONNECTION___}:postgreConnectionError`, // Unexpected PostgreSQL error
            unauthorizedRequest: `${___PG_CONNECTION___}:unauthorizedRequest`
        },
        transactions: {
            alreadyActive: `${___PG_TRANSACTIONS___}:alreadyActive`,
            noActiveTransactionToCommit: `${___PG_TRANSACTIONS___}:noActiveTransactionToCommit`,
            noActiveTransactionToRollback: `${___PG_TRANSACTIONS___}:noActiveTransactionToRollback`
        }
    },
    ssh: {
            optionsNotSpecified: `${___SSH___}:optionsNotSpecified`,
            tunnelFailed: `${___SSH___}:tunnelFailed`, // ❌ SSH tunnel failed
    }
}