class DbConnectionError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, DbConnectionError.prototype);
	}
}
