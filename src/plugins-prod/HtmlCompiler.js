import { join } from 'node:path'
import { createHash } from 'node:crypto'

import { read } from '../utils/fs-utils.js'
import { remapMediaInHTML } from './media-remaper.js'


export class HtmlCompiler {
	html = ''
	pSource = ''
	css = ''
	scriptsJs = ''
	mediaRelUrl = ''
	scriptsNonJs = ''
	externalScripts = []
	externalCSS = []
	#minifyJS = a => a
	#minifyCSS = a => a
	#minifyHTML = a => a

	constructor(html, pSource = '', { minifyJS, minifyCSS, minifyHTML, mediaRelUrl }) {
		this.html = html
		this.pSource = pSource
		this.#minifyJS = minifyJS
		this.#minifyCSS = minifyCSS
		this.#minifyHTML = minifyHTML
		this.mediaRelUrl = mediaRelUrl
	}

	// Removes comments and format multi-line tags (needed for `removeLineContaining`)
	async minifyHTML() {
		this.html = await this.#minifyHTML(this.html)
	}

	remapMedia(mediaHashes) {
		this.html = remapMediaInHTML(mediaHashes, this.html, this.mediaRelUrl)
	}

	async inlineMinifiedCSS() {
		for (const sheet of this.extractStyleSheetHrefs()) {
			if (sheet.startsWith('http')) // TODO clean
				this.externalCSS.push(sheet)
			else {
				this.css += read(join(this.pSource, sheet))
				this.removeLineContaining(`href="${sheet}"`)
			}
		}
		if (this.css) {
			this.css = await this.#minifyCSS(this.css)
			this.html = this.html.replace('<head>', `<head><style>${this.css}</style>`)
		}
	}

	async inlineMinifiedJS() {
		const scripts = []
		for (const [src, type] of this.extractScriptSources()) {
			if (src.startsWith('http')) // TODO clean
				this.externalScripts.push(src)
			else {
				this.removeLineContaining(`src="${src}"`)
				scripts.push([type, read(join(this.pSource, src))])
			}
		}

		this.scriptsJs = await this.#minifyJS(scripts
			.filter(([type]) => type === 'application/javascript')
			.map(([, body]) => body)
			.join('\n'))

		this.scriptsNonJs = scripts
			.filter(([type]) => type !== 'application/javascript')

		if (this.scriptsJs)
			this.html = this.html.replace('</body>', `<script>${this.scriptsJs}</script></body>`)
		
		for (const [type, body] of this.scriptsNonJs)
			this.html = this.html.replace('</body>', `\n<script type="${type}">${body}</script></body>`)
	}

	csp() {
		const cssHash = this.css
			? `'${this.hash256(this.css)}'`
			: '' // TODO maybe self?
		const jsScriptHash = this.scriptsJs
			? `'${this.hash256(this.scriptsJs)}'`
			: '' // TODO maybe self?
		const nonJsScriptHashes = this.scriptsNonJs
			.map(([, body]) => `'${this.hash256(body)}'`).join(' ')
		const externalScriptHashes = this.externalScripts.map(url => `${new URL(url).origin}`).join(' ')
		return [
			`default-src 'self'`,
			`img-src 'self' data:`, // data: is for Safari's video player icons and for CSS bg images
			`style-src ${cssHash}`,
			`script-src ${nonJsScriptHashes} ${jsScriptHash} ${externalScriptHashes}`,
			`frame-ancestors 'none'`
		].join('; ')
	}

	hash256(data) {
		return data
			? 'sha256-' + createHash('sha256').update(data).digest('base64')
			: ''
	}

	removeLineContaining(str) {
		this.html = this.html.replace(new RegExp('^.*' + str + '.*\n', 'm'), '')
	}

	extractStyleSheetHrefs() {
		const reExtractStyleSheets = /(?<=<link\s.*href=")[^"]+\.css/g
		return Array.from(this.html.matchAll(reExtractStyleSheets), m => m[0])
	}


	/**
	 * NOTE: Run minifyHTML first, because using any of these functions
	 * because they don't support tags within comments nor multiline ones.
	 * @returns {[src:string, type:string][]}
	 */
	extractScriptSources() {
		const reExtractScripts = /<script\b([^>]*?)src="([^"]+)"([^>]*)>/g
		return Array.from(this.html.matchAll(reExtractScripts), m => {
			const pre = m[1]
			const post = m[3]
			const typeMatch = (pre + post).match(/type="([^"]+)"/)
			return [
				m[2], // src
				typeMatch
					? typeMatch[1]
					: 'application/javascript'
			]
		})
	}
}
