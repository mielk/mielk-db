import { PostgreDbConfig } from './types/DbConfig.js'
import { QueryExecutor } from './types/Executor.js';
import { initDb, getQueryExecutor } from './connection/pool.js'
import { withTransaction } from './connection/transaction.js';
import { isUniqueViolation } from './errors/errorChecks.js';
import { UniqueKeyViolationError } from './errors/customErrors.js'

export { PostgreDbConfig, QueryExecutor }
export { initDb, getQueryExecutor }
export { withTransaction }
export { isUniqueViolation }
export { UniqueKeyViolationError }