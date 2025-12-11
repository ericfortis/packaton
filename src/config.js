import { resolve } from 'node:path'

import { isDirectory } from './utils/fs-utils.js'
import { openInBrowser } from './plugins-dev/openInBrowser.js'

import { minifyJS } from './plugins-prod/minifyJS.js'
import { minifyCSS } from './plugins-prod/minifyCSS.js'
import { minifyHTML } from './plugins-prod/minifyHTML.js'


/** @type {{
 * 	[K in keyof Config]-?: [
 * 		defaultVal: Config[K],
 * 		validator: (val: unknown) => boolean
 * 	]
 * }} */
const schema = {
	mode: ['development', val => ['development', 'production'].includes(val)],
	srcPath: [resolve('src'), isDirectory],
	assetsDir: ['assets', optional(String)],
	ignore: [/^_/, optional(RegExp)],

	// Development
	host: ['127.0.0.1', is(String)],
	port: [0, port => Number.isInteger(port) && port >= 0 && port < 2 ** 16], // 0 means auto-assigned
	onReady: [await openInBrowser, is(Function)],
	hotReload: [true, is(Boolean)],

	// Production
	outputExtension: ['.html', optional(String)],
	outputDir: ['dist', optional(String)], // TODO resolve
	minifyJS: [minifyJS, optional(Function)],
	minifyCSS: [minifyCSS, optional(Function)],
	minifyHTML: [minifyHTML, optional(Function)],
	sitemapDomain: ['', optional(String)],
	cspMapEnabled: [true, optional(Boolean)],
}
// TODO watch New Routes?


const defaults = {}
const validators = {}
for (const [k, [defaultVal, validator]] of Object.entries(schema)) {
	defaults[k] = defaultVal
	validators[k] = validator
}

/** @type Config */
const config = Object.seal(defaults)


/** @param {Partial<Config>} opts */
export function setup(opts) {
	Object.assign(config, opts)
	validate(config, validators)

	if (config.mode === 'production')
		config.hotReload = false

	return config
}


function validate(obj, shape) {
	for (const [field, value] of Object.entries(obj))
		if (!shape[field](value))
			throw new TypeError(`${field}=${JSON.stringify(value)} is invalid`)
}
function is(ctor) {
	return val => val.constructor === ctor
}
function optional(tester) {
	return val => !val || tester(val)
}
