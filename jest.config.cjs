module.exports = {
	roots: ['<rootDir>/tests'], // Specify the root directory for Jest to look for tests
	transform: {
		'^.+\\.tsx?$': 'ts-jest', // Adjust based on your TypeScript setup
	},
	testMatch: [
		'**/?(*.)+(spec|test).ts?(x)', // Match test files with .spec.ts or .test.ts extensions
	],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // File extensions for modules
	moduleNameMapper: {
		'^mielk-fn$': '<rootDir>/node_modules/mielk-fn/lib/index.js', // Adjust the path if necessary
	},
	globals: {
		'ts-jest': {
			tsconfig: './tsconfig.json', // Adjust the path to your tsconfig.json
		},
	},
	preset: 'ts-jest',
	testEnvironment: 'node',
	transformIgnorePatterns: ['/node_modules/(?!mielk-fn|mielk-db)'],
	reporters: [
		'default',
		[
			'jest-html-reporters',
			{
				publicPath: './reports/html-report',
				filename: 'report.html',
				pageTitle: 'My Project - Test Report',
				expand: true,
				openReport: true,
				groupBy: ['describe'],
			},
		],
	],
	// Other Jest configurations you might have
};
