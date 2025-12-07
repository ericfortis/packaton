import { join } from 'node:path'
import { write } from '../utils/fs-utils.js'


export function netiflyAndCloudflareHeadersPlugin(config, cspByRoute, MEDIA_URL) {
	const out = join(join(config.outputDir, config.staticDir), '_headers')

	const cspHeaders = cspByRoute.map(([route, csp]) => {
		const r = route === '/index'
			? '/'
			: route
		return `${r}\n  Content-Security-Policy: ${csp}`
	})
	cspHeaders.push(`${MEDIA_URL}/*`)
	cspHeaders.push('  Cache-Control: public,max-age=31536000,immutable')

	write(out, cspHeaders.join('\n'))
}

