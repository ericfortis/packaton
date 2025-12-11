import { cpSync } from 'node:fs'
import { createServer } from 'node:http'
import { basename, join, dirname } from 'node:path'

import { docs } from './app.js'
import { router } from './router.js'
import { HtmlCompiler } from './plugins-prod/HtmlCompiler.js'
import { sitemapPlugin } from './plugins-prod/sitemapPlugin.js'
import { reportSizesPlugin } from './plugins-prod/reportSizesPlugin.js'
import { write, removeDir, } from './utils/fs-utils.js'
import { cspNginxMapPlugin } from './plugins-prod/cspNginxMapPlugin.js'
import { renameMediaWithHashes } from './plugins-prod/media-remaper.js'
import { netiflyAndCloudflareHeadersPlugin } from './plugins-prod/netiflyAndCloudflareHeadersPlugin.js'


/**
 * @param {Partial<Config>} opts
 * @returns {Promise<unknown>}
 */
export async function buildStaticPages(config) {
	return new Promise((resolve, reject) => {
		const MEDIA_REL_URL = join(config.staticDir, 'media')

		const pSource = config.srcPath
		const pDist = config.outputDir
		const pDistStatic = join(config.outputDir, config.staticDir)
		const pDistMedia = join(pDist, MEDIA_REL_URL)

		const server = createServer(router(config))
		server.on('error', reject)
		server.listen(0, '127.0.0.1', async () => {
			docs.init(config.srcPath, config.ignore)
			try {
				removeDir(pDist)
				cpSync(join(pSource, config.staticDir), pDistStatic, {
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
					const doc = new HtmlCompiler(rawHtml, join(pSource, dirname(route)), {
						minifyJS: config.minifyJS,
						minifyCSS: config.minifyCSS,
						minifyHTML: config.minifyHTML,
						mediaRelUrl: MEDIA_REL_URL
					})
					await doc.minifyHTML()
					doc.remapMedia(mediaHashes)
					// TODO remap media in css and js
					await doc.inlineMinifiedCSS()
					await doc.inlineMinifiedJS()
					write(join(pDist, route + config.outputExtension), doc.html)
					cspByRoute.push([route, doc.csp()])
				}

				sitemapPlugin(config, docs.routes)
				reportSizesPlugin(config, docs.routes)
				cspNginxMapPlugin(config, cspByRoute)
				netiflyAndCloudflareHeadersPlugin(config, cspByRoute, MEDIA_REL_URL)
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
