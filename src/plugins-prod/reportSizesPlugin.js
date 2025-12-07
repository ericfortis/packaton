import { join } from 'node:path'
import { read, sizeOf, sha1, saveAsJSON, isFile } from '../utils/fs-utils.js'


export function reportSizesPlugin(config, routes) {
	const files = routes.map(f => f + config.outputExtension)
	const baseDir = config.outputDir
	const reportFilename = 'packed-sizes.json'
	const oldReport = isFile(reportFilename)
		? JSON.parse(read(reportFilename))
		: {}
	const newReport = {}

	for (const f of files) {
		const fPath = join(baseDir, f)
		const size = sizeOf(fPath)
		newReport[f] = {
			hash: sha1(fPath),
			delta: size - (oldReport[f]?.size || 0),
			size
		}
	}

	console.table(newReport)
	saveAsJSON(reportFilename, newReport)
}
