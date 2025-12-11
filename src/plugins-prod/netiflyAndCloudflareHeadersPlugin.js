import { join } from 'node:path'
import { write } from '../utils/fs-utils.js'


/**
 * @param {Config} config
 * @param {string} cspByRoute
 * @param {string} relMediaURL
 */
export function netiflyAndCloudflareHeadersPlugin(config, cspByRoute, relMediaURL) {
	const out = join(join(config.outputDir, config.assetsDir), '_headers')

	const cspHeaders = cspByRoute.map(([route, csp]) => {
		const r = route === '/index'
			? '/'
			: route
		return [
			r,
			`  Content-Security-Policy: ${csp}`,
			`  Cache-Control: public,max-age=60`
		].join('\n')
	})
	cspHeaders.push(`/${relMediaURL}/*`)
	cspHeaders.push('  Cache-Control: public,max-age=31536000,immutable')

	write(out, cspHeaders.join('\n'))
}

