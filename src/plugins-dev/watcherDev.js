const WATCH_API = '/packaton/watch-dev'

let es = null
let timer = null

window.addEventListener('beforeunload', teardown)
connect()
function connect() {
	if (es) return

	clearTimeout(timer)
	es = new EventSource(WATCH_API)

	es.onmessage = function (event) {
		const file = event.data
		if (file.endsWith('.css'))
			hotReloadCSS(file)
		else if (file)
			location.reload()
	}

	es.onerror = function () {
		console.error('hot reload')
		teardown()
		timer = setTimeout(connect, 3000)
	}
}

function teardown() {
	clearTimeout(timer)
	es?.close()
	es = null
}

async function hotReloadCSS(file) {
	let link = document.querySelector(`link[href^="/${file}"]`)
	if (link) {
		const [url] = link.getAttribute('href').split('?')
		link.href = url + '?' + Date.now()
	}
	else {
		const mod = await import(`/${file}?${Date.now()}`, { with: { type: 'css' } })
		document.adoptedStyleSheets = [mod.default]
	}
}

