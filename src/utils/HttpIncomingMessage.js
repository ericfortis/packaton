export function removeQueryStringAndFragment(url = '') {
	return new URL(url, 'http://_').pathname
}


const reControlAndDelChars = /[\x00-\x1f\x7f]/

export function hasControlChars(url) {
	try {
		const decoded = decode(url)
		return !decoded || reControlAndDelChars.test(decoded)
	}
	catch {
		return true
	}
}

function decode(url) {
	const candidate = decodeURIComponent(url)
	return candidate === decodeURIComponent(candidate)
		? candidate
		: '' // reject multiple encodings
}
