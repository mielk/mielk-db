class SqlProcessingError extends Error {
	constructor(msg: string) {
		super(msg);
		Object.setPrototypeOf(this, SqlProcessingError.prototype);
	}
}
