export default {
	preset: 'ts-jest',
	testEnvironment: 'node',
	// roots: ['<rootDir>/tests'], // Specify the root directory for Jest to look for tests
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
		'^.+\\.(js|jsx|mjs)$': 'babel-jest',
	},
	globals: {
		'ts-jest': {
			tsconfig: '<rootDir>/tsconfig.json',
		},
	},
	// testMatch: [
	// 	'**/?(*.)+(spec|test).[jt]s?(x)', // Match test files with .spec.ts or .test.ts extensions
	// ],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'], // File extensions for modules
	transformIgnorePatterns: ['/node_modules/(?!mielk-fn|mielk-db).+\\.js$'],
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
};
