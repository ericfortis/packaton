import http from 'node:http'

import { router } from './app-router.js'
import { watchDev } from './WatcherDevClient.js'


/**
 * @param {Partial<Config>} config
 * @returns {Promise<Server | undefined>}
 */
export function devStaticPages(config) {
	return new Promise((resolve, reject) => {
		if (config.hotReload)
			watchDev(config.srcPath)

		const server = http.createServer(router(config))
		server.on('error', reject)
		server.listen(config.port, config.host, () => {
			const addr = `http://${server.address().address}:${server.address().port}`
			config.onReady(addr)
			console.log(addr)
			resolve(server)
		})
	})
}

