import { write } from '../utils/fs-utils.js'
import { join } from 'node:path'


export function cspNginxMapPlugin(config, cspByRoute) {
	const out = join(config.outputDir, '.csp-map.nginx')
	write(out, cspByRoute.map(([route, csp]) =>
		`${route} "${csp}";`).join('\n'))
}
