import { createServer } from 'node:http'
import { basename, join } from 'node:path'
import { cpSync, existsSync } from 'node:fs'

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
		const MEDIA_REL_URL = join(config.assetsDir, 'media')

		const pSource = config.srcPath
		const pDist = config.outputDir
		const pDistAssets = join(pDist, config.assetsDir)

		const server = createServer(router(config))
		server.on('error', reject)
		server.listen(0, '127.0.0.1', async () => {
			docs.init(config.srcPath, config.ignore)
			try {
				removeDir(pDist)
				cpSync(join(pSource, config.assetsDir), pDistAssets, {
					recursive: true,
					dereference: true,
					filter(src) {
						const f = basename(src)
						return f !== '.DS_Store' && !f.startsWith('_')
						// TODO 
					}
				})


				const wellKnownDir = join(pSource, '.well-known')
				if (existsSync(wellKnownDir))
					cpSync(wellKnownDir, join(pDist, '.well-known'), {
						recursive: true,
						dereference: true,
						filter(src) {
							return basename(src) !== '.DS_Store'
						}
					})

				const pages = await crawlRoutes(server.address(), docs.routes)
				const mediaHashes = await renameMediaWithHashes(pDist, MEDIA_REL_URL)

				const headers = {
					['/' + MEDIA_REL_URL + '/*']: [
						['Cache-Control', 'public,max-age=31536000,immutable']
					]
				}
				const cspByRoute = []
				for (const [route, rawHtml] of pages) {
					const doc = new HtmlCompiler(rawHtml, pSource, {
						minifyJS: config.minifyJS,
						minifyCSS: config.minifyCSS,
						minifyHTML: config.minifyHTML,
						mediaRelUrl: MEDIA_REL_URL,
						mediaHashes

					})
					await doc.minifyHTML()
					doc.remapMedia()
					// TODO remap media in css and js
					await doc.inlineMinifiedCSS()
					await doc.inlineMinifiedJS()
					write(join(pDist, route + config.outputExtension), doc.html)
					const r = route === '/index' ? '/' : route
					headers[r] ??= []
					headers[r].push(['Content-Security-Policy', doc.csp()])
					headers[r].push(['Cache-Control', 'public,max-age=60'])
				}

				sitemapPlugin(config, docs.routes)
				reportSizesPlugin(config, docs.routes)
				cspNginxMapPlugin(config, cspByRoute)
				write(join(config.outputDir, '_headers'), netiflyAndCloudflareHeadersPlugin(headers))
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
