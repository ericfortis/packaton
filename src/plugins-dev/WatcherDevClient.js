import { join } from 'node:path'
import { watch } from 'node:fs'
import { EventEmitter } from 'node:events'
import { docs } from '../app.js'


export const devClientWatcher = new class extends EventEmitter {
	emit(file) { super.emit('RELOAD', file) }
	subscribe(listener) { this.on('RELOAD', listener) }
	unsubscribe(listener) { this.removeListener('RELOAD', listener) }
}

export function watchDev(rootPath, watchIgnore) {
	watch(rootPath, { recursive: true }, (_, file) => {
		if (watchIgnore.some(f => f === file)) // TODO handle regexes
			return
		docs.onWatch(join(rootPath, file))
		devClientWatcher.emit(file)
	})
}

export function sseDevHotReload(req, response) {
	response.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-cache',
		'Connection': 'keep-alive',
	})
	response.flushHeaders()

	function onDevChange(file = '') {
		response.write(`data: ${file}\n\n`)
	}

	devClientWatcher.subscribe(onDevChange)

	const keepAlive = setInterval(() => {
		response.write(': ping\n\n')
	}, 10_000)

	req.on('close', cleanup)
	req.on('error', cleanup)
	function cleanup() {
		clearInterval(keepAlive)
		devClientWatcher.unsubscribe(onDevChange)
	}
}
