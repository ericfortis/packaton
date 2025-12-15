const WATCH_API = '/packaton/watch-dev'

longPollDevChanges()
async function longPollDevChanges() {
	try {
		const response = await fetch(WATCH_API)
		if (!response.ok)
			throw response.statusText

		const file = await response.json() || ''
		if (file.endsWith('.css')) {
			hotReloadCSS(file)
			longPollDevChanges()
		}
		else if (file)
			location.reload()
		else // server timeout
			longPollDevChanges()
	}
	catch (error) {
		console.error('hot reload', error?.message || error)
		setTimeout(longPollDevChanges, 3000)
	}
}

function hotReloadCSS(file) {
	let link = document.querySelector(`link[href^="${file}"]`)

	// Fallback: construct relative path based on current pathname
	if (!link) {
		const parts = window.location.pathname.split('/').filter(Boolean)
		if (parts.length > 1)
			parts.pop()
		const urlDir = parts.join('/') + '/'
		const r = file.split(urlDir).pop()
		link = document.querySelector(`link[href^="${r}"]`)
	}

	if (link) {
		const [url] = link.getAttribute('href').split('?')
		link.href = url + '?' + Date.now()
	}
}

