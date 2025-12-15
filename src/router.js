import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

import { docs } from './app.js'
import { mimeFor } from './utils/mimes.js'
import { devClientWatcher } from './plugins-dev/WatcherDevClient.js'
import { sendError, sendJSON, servePartialContent, serveAsset } from './utils/http-response.js'


const WATCHER_DEV = '/plugins-dev/watcherDev.js'

const API = {
	watchDev: '/packaton/watch-dev'
}


/** @param {Config} config */
export function router({ srcPath, ignore, mode }) {
	docs.init(srcPath, ignore)
	const isDev = mode === 'development'
	return async function (req, response) {
		let url = new URL(req.url, 'http://_').pathname
		try {
			if (url === API.watchDev)
				longPollDevHotReload(req, response)

			else if (url === WATCHER_DEV)
				serveAsset(response, join(import.meta.dirname, url))

			else if (docs.hasRoute(url))
				await serveDocument(response, docs.fileFor(url), isDev)

			else if (docs.hasRoute(join(url, 'index')))
				await serveDocument(response, docs.fileFor(join(url, 'index')), isDev)

			else if (req.headers.range)
				await servePartialContent(response, req.headers, join(srcPath, url))

			else
				serveAsset(response, join(srcPath, url))
		}
		catch (error) {
			sendError(response, error)
		}
	}
}

async function serveDocument(response, file, isDev) {
	let html = file.endsWith('.html')
		? await readFile(file, 'utf8')
		: (await import(file + '?' + Date.now())).default()
	if (isDev)
		html += `<script type="module" src="${WATCHER_DEV}"></script>`
	response.setHeader('Content-Type', mimeFor('html'))
	response.end(html)
}


const LONG_POLL_SERVER_TIMEOUT = 8000

function longPollDevHotReload(req, response) {
	function onDevChange(file) {
		devClientWatcher.unsubscribe(onDevChange)
		sendJSON(response, file)
	}
	response.setTimeout(LONG_POLL_SERVER_TIMEOUT, () => {
		devClientWatcher.unsubscribe(onDevChange)
		sendJSON(response, '')
	})
	req.on('error', () => {
		devClientWatcher.unsubscribe(onDevChange)
		response.destroy()
	})
	devClientWatcher.subscribe(onDevChange)
}


