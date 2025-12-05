import { join } from 'node:path'
import { watch } from 'node:fs'
import { EventEmitter } from 'node:events'
import { docs } from './app.js'


export const devClientWatcher = new class extends EventEmitter {
	emit(file) { super.emit('RELOAD', file) }
	subscribe(listener) { this.once('RELOAD', listener) }
	unsubscribe(listener) { this.removeListener('RELOAD', listener) }
}

export function watchDev(rootPath) {
	watch(rootPath, { recursive: true }, (_, file) => {
		docs.onWatch(join(rootPath, file))
		devClientWatcher.emit(file)
	})
}
