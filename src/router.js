import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { pathToFileURL } from 'node:url'

import { docs } from './app.js'
import { mimeFor } from './utils/mime.js'
import { sseDevHotReload } from './plugins-dev/WatcherDevClient.js'

import pkgJSON from '../package.json' with { type: 'json' }
import { resolveIn } from './utils/fs.js'
import { hasControlChars, removeQueryStringAndFragment } from './utils/HttpIncomingMessage.js'


const rel = f => join(import.meta.dirname, f)

const API = {
	watchHotReload: '/packaton/watch-hot-reload',
	devToolsJson: '/.well-known/appspecific/com.chrome.devtools.json'
}
const WATCHER_DEV = `/plugins-dev/watcherDev.js`

/** @param {Config} config */
export function router({ srcPath, ignore, mode }) {
	const DEV = mode === 'development'
	const WORKSPACE_ID = randomUUID()
	docs.init(srcPath, ignore)

	return async function (req, response) {
		response.setHeader('Server', `Packaton ${pkgJSON.version}`)

		let url = req.url || ''
		if (url.length > 2048) {
			response.uriTooLong()
			return
		}
		if (hasControlChars(url)) {
			response.badRequest()
			return
		}
		if (req.method !== 'GET') {
			response.notFound()
			return
		}

		url = removeQueryStringAndFragment(url)
		try {
			if (url === WATCHER_DEV)
				response.file(rel(WATCHER_DEV))

			else if (url === API.watchHotReload)
				sseDevHotReload(req, response)

			else if (url === API.devToolsJson)
				response.json({
					workspace: {
						root: srcPath,
						uuid: WORKSPACE_ID
					}
				})

			else if (docs.hasRoute(url))
				await serveDocument(response, docs.fileFor(url), url, DEV)
			else if (docs.hasRoute(join(url, 'index')))
				await serveDocument(response, docs.fileFor(join(url, 'index')), '', DEV)

			else {
				const f = await resolveIn(srcPath, url)
				if (!f)
					response.forbidden('Filename path resolves outside config.srcPath')
				else if (req.headers.range)
					response.partialContent(f)
				else
					response.file(f)
			}
		}
		catch (err) {
			console.error(err)
			response.internalServerError()
		}
	}
}

async function serveDocument(response, file, url, isDev) {
	let html = file.endsWith('.html')
		? await readFile(file, 'utf8')
		: (await import(pathToFileURL(file))).default(url)
	if (isDev)
		html += `<script type="module" src="${WATCHER_DEV}?url=${API.watchHotReload}"></script>`
	response.setHeader('Content-Type', mimeFor('.html'))
	response.end(html)
}
