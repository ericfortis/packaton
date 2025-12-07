import { readdirSync } from 'node:fs'
import { basename, join, dirname } from 'node:path'

import { setup } from './config.js'
import { isFile } from './utils/fs-utils.js'
import { devStaticPages } from './app-dev.js'
import { buildStaticPages } from './app-prod.js'


/**
 * @param {Partial<Config>} opts
 * @returns {Promise<Server | undefined>}
 */
export function Packaton(opts) {
	const config = setup(opts)
	return config.mode === 'development'
		? devStaticPages(config)
		: buildStaticPages(config)
}


export const docs = new class {
	#srcPath = ''
	#ignore = /.*/
	#extensions = ['.html', '.html.js', '.html.ts']
	#delay = Number(process.env.PACKATON_WATCHER_DEBOUNCE_MS ?? 80)

	#routeToFileMap = new Map()
	init(srcPath, ignore) {
		this.#srcPath = srcPath
		this.#ignore = ignore
		this.#registerDocs()
	}

	get routes() { return Array.from(this.#routeToFileMap.keys()) }
	fileFor = url => this.#routeToFileMap.get(url)
	hasRoute = url => this.#routeToFileMap.has(url)

	onWatch = /** @type {function} */ this.#debounce(f => {
		if (this.#hasDocExt(f) && !this.hasRoute(this.#routeFor(f)) && isFile(f))
			this.#registerDocs()
	})

	#registerDocs() {
		const files = readdirSync(this.#srcPath, { recursive: true })
			.filter(f => this.#hasDocExt(f) && !this.#ignore.test(f))

		this.#routeToFileMap = new Map(files.map(f => [
			this.#routeFor(f),
			join(this.#srcPath, f)
		]))
	}

	#routeFor = f => '/' + join(dirname(f), this.#removeDocExt(f))
	#hasDocExt = f => this.#extensions.some(ext => f.endsWith(ext))
	#findDocExt = f => this.#extensions.find(ext => f.endsWith(ext))
	#removeDocExt = f => basename(f, this.#findDocExt(f))

	#debounce(fn) {
		let timer
		return arg => {
			clearTimeout(timer)
			timer = setTimeout(() => fn(arg), this.#delay)
		}
	}
}
