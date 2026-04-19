import { POSTGRE_ERRORS } from "./PostgreErrorCodes.js"

export const isUniqueViolation = (err: any): boolean => err.code === POSTGRE_ERRORS.UNIQUE_VIOLATION;