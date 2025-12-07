import { join } from 'node:path'
import { write, isFile } from '../utils/fs-utils.js'


export function sitemapPlugin(config, routes) {
	if (!config.sitemapDomain) 
		return
	
	const outMap = join(config.outputDir, 'sitemap.txt')
	const outRobots = join(config.outputDir, 'robots.txt')
	
	write(outMap, routes
		.filter(r => r !== '/index')
		.map(r => `https://${config.sitemapDomain + r}`)
		.join('\n'))

	if (!isFile(outRobots))
		write(outRobots,
			`Sitemap: https://${config.sitemapDomain}/sitemap.txt`)
}
