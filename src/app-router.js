import { join } from 'node:path'
import { readFile } from 'node:fs/promises'

import { docs } from './app.js'
import { mimeFor } from './mimes.js'
import { devClientWatcher } from './WatcherDevClient.js'
import { sendError, sendJSON, servePartialContent, serveStaticAsset } from './http-response.js'


const API = {
	watchDev: '/packaton/watch-dev'
}

const WATCHER_DEV = '/watcherDev.js'


/** @param {Config} config */
export function router({ srcPath, ignore, mode }) {
	docs.init(srcPath, ignore)
	return async function (req, response) {
		let url = new URL(req.url, 'http://_').pathname
		try {
			if (url === API.watchDev) {
				longPollDevHotReload(req, response)
				return
			}
			if (url === WATCHER_DEV) {
				serveStaticAsset(response, join(import.meta.dirname, url))
				return
			}

			if (url === '/')
				url = '/index'

			const file = join(srcPath, url)
			if (docs.hasRoute(url))
				await serveDocument(response, docs.fileFor(url), mode === 'development')
			else if (req.headers.range)
				await servePartialContent(response, req.headers, file)
			else
				serveStaticAsset(response, file)
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


