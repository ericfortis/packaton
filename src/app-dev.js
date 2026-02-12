import { register } from 'node:module'
import { createServer } from 'node:http'

import { router } from './router.js'
import { watchDev } from './plugins-dev/WatcherDevClient.js'


/**
 * @param {Partial<Config>} config
 * @returns {Promise<Server | undefined>}
 */
export function devStaticPages(config) {
	return new Promise((resolve, reject) => {
		register('./plugins-dev/cache-bust-resolver.js', import.meta.url)

		if (config.hotReload)
			watchDev(config.srcPath, config.watchIgnore)

		const server = createServer(router(config))
		server.on('error', reject)
		server.listen(config.port, config.host, () => {
			const addr = `http://${server.address().address}:${server.address().port}`
			config.onReady(addr)
			console.log(addr)
			resolve(server)
		})
	})
}

