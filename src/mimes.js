// Generated with:
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// m = {}
// for (const row of tbody.children)
//  m[row.children[0].querySelector('code').innerText] = row.children[2].querySelector('code').innerText

const mimes = {
	css: 'text/css; charset=utf8',
	html: 'text/html; charset=utf8',
	js: 'application/javascript; charset=utf8',
	json: 'application/json; charset=utf8',
	svg: 'image/svg+xml; charset=utf8',
	txt: 'text/plain; charset=utf8', // e.g., robots.txt when running lighthouse

	'3g2': 'video/3gpp2',
	'3gp': 'video/3gpp',
	'7z': 'application/x-7z-compressed',
	aac: 'audio/aac',
	abw: 'application/x-abiword',
	apng: 'image/apng',
	arc: 'application/x-freearc',
	avi: 'video/x-msvideo',
	avif: 'image/avif',
	azw: 'application/vnd.amazon.ebook',
	bin: 'application/octet-stream',
	bmp: 'image/bmp',
	bz2: 'application/x-bzip2',
	bz: 'application/x-bzip',
	cda: 'application/x-cdf',
	cjs: 'text/javascript',
	csh: 'application/x-csh',
	csv: 'text/csv',
	doc: 'application/msword',
	docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	eot: 'application/vnd.ms-fontobject',
	epub: 'application/epub+zip',
	gif: 'image/gif',
	gz: 'application/gzip',
	htm: 'text/html',
	ico: 'image/vnd.microsoft.icon',
	ics: 'text/calendar',
	jar: 'application/java-archive',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	jsonld: 'application/ld+json',
	mid: 'audio/midi',
	midi: 'audio/midi',
	mjs: 'text/javascript',
	mp3: 'audio/mpeg',
	mp4: 'video/mp4',
	mpeg: 'video/mpeg',
	mpkg: 'application/vnd.apple.installer+xml',
	odp: 'application/vnd.oasis.opendocument.presentation',
	ods: 'application/vnd.oasis.opendocument.spreadsheet',
	odt: 'application/vnd.oasis.opendocument.text',
	oga: 'audio/ogg',
	ogv: 'video/ogg',
	ogx: 'application/ogg',
	opus: 'audio/ogg',
	otf: 'font/otf',
	pdf: 'application/pdf',
	php: 'application/x-httpd-php',
	png: 'image/png',
	ppt: 'application/vnd.ms-powerpoint',
	pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	rar: 'application/vnd.rar',
	rtf: 'application/rtf',
	sh: 'application/x-sh',
	tar: 'application/x-tar',
	tif: 'image/tiff',
	ts: 'video/mp2t',
	ttf: 'font/ttf',
	vsd: 'application/vnd.visio',
	wav: 'audio/wav',
	weba: 'audio/webm',
	webm: 'video/webm',
	webp: 'image/webp',
	woff2: 'font/woff2',
	woff: 'font/woff',
	xhtml: 'application/xhtml+xml',
	xls: 'application/vnd.ms-excel',
	xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	xml: 'application/xml',
	xul: 'application/vnd.mozilla.xul+xml',
	yaml: 'application/yaml',
	yml: 'application/yaml',
	zip: 'application/zip'
}

export function mimeFor(filename) {
	return mimes[extname(filename)] || ''
}

function extname(filename) {
	const ext = filename
		.split('.').at(-1)
		.split('?').at(0)
	return ext
}
