import http from 'node:http'
import { cpSync } from 'node:fs'
import { basename, join, dirname } from 'node:path'

import { docs } from './app.js'
import { router } from './app-router.js'
import { reportSizes } from './reportSizes.js'
import { HtmlCompiler } from './HtmlCompiler.js'
import { write, removeDir } from './fs-utils.js'
import { renameMediaWithHashes } from './media-remaper.js'


/**
 * @param {Partial<Config>} opts
 * @returns {Promise<unknown>}
 */
export async function buildStaticPages(config) {
	return new Promise((resolve, reject) => {
		const pSource = config.srcPath
		const pDist = config.outputPath
		const pDistMedia = join(config.outputPath, 'static', 'media')
		const pDistSitemap = join(pDist, 'sitemap.txt')
		const pDistCspNginxMap = join(pDist, '.csp-map.nginx')
		const pSizesReport = 'packed-sizes.json'

		const server = http.createServer(router(config))
		server.listen(0, '127.0.0.1', async error => {
			docs.init(config.srcPath, config.ignore)
			try {
				if (error) {
					reject(error)
					return
				}

				removeDir(pDist)
				cpSync(join(pSource, 'static'), join(pDist, 'static'), {
					recursive: true,
					dereference: true,
					filter(src) {
						const f = basename(src)
						return f !== '.DS_Store' && !f.startsWith('_')
						// TODO 
					}
				})

				const mediaHashes = await renameMediaWithHashes(pDistMedia) // only on top dir
				const pages = await crawlRoutes(server.address(), docs.routes)

				const cspByRoute = []
				for (const [route, rawHtml] of pages) {
					const doc = new HtmlCompiler(rawHtml, join(pSource, dirname(route)), config)
					await doc.minifyHTML()
					doc.remapMedia(mediaHashes)
					// TODO remap media in css and js
					await doc.inlineMinifiedCSS()
					await doc.inlineMinifiedJS()
					write(pDist + route + config.outputExtension, doc.html)
					cspByRoute.push([route, doc.csp()])
				}

				if (config.sitemapDomain)
					write(pDistSitemap, docs.routes
						.filter(r => r !== '/index')
						.map(r => `https://${config.sitemapDomain + r}`)
						.join('\n'))

				if (config.cspMapEnabled) {
					write(pDistCspNginxMap, cspByRoute.map(([route, csp]) =>
						`${route} "${csp}";`).join('\n'))

					// cloudflare 
					write(join(pDist, 'static', '_headers'), cspByRoute.map(([route, csp]) => {
						const r = route === '/index' ? '/' : route
						return `${r}\n  Content-Security-Policy: ${csp}`
					}).join('\n'))
				}

				reportSizes(pSizesReport, pDist, docs.routes.map(f => f + config.outputExtension))
			}
			catch (error) {
				reject(error)
				console.error(error)
				process.exitCode = 1
			}
			finally {
				server.close()
				resolve()
			}
		})
	})
}


async function crawlRoutes({ address, port }, routes) {
	const pages = []
	for (const route of routes)
		try {
			const resp = await fetch(`http://${address}:${port}` + route)
			if (!resp.ok) throw resp.statusText
			pages.push([route, await resp.text()])
		}
		catch (error) {
			pages.push([route, ''])
			console.warn(`Route: ${route} ${error?.message || error}`)
		}
	return pages
}
