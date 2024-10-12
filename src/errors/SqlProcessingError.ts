export class SqlProcessingError extends Error {
	public statusCode: number;

	constructor(message: string, statusCode?: number) {
		super(message); // Call the Error constructor with the message
		this.name = this.constructor.name; // Set the error name to the class name
		this.statusCode = statusCode || 400;

		// Maintains proper stack trace (only available in V8 environments, like Node.js)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}
	// constructor(message: string) {
	// 	super(message);
	// 	this.name = 'DbConnectionError';
	// 	Error.captureStackTrace(this, SqlProcessingError);
	// 	SqlProcessingError.prototype = Object.create(Error.prototype);
	// 	SqlProcessingError.prototype.constructor = SqlProcessingError;
	// }
}
