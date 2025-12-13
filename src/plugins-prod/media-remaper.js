import { renameSync } from 'node:fs'
import { join, parse, relative } from 'node:path'
import { sha1, listFiles } from '../utils/fs-utils.js'


/**
 * Subdirectories are ignored
 *   foo.avif      -> foo-<sha1>.avif
 */
export async function renameMediaWithHashes(distDir, mediaDir) {
	const mDir = join(distDir, mediaDir)
	const map = new Map()

	for (const file of await listFiles(mDir)) {
		const { dir, name, ext } = parse(file)
		const newFile = join(dir, name + '-' + sha1(file) + ext)
		renameSync(file, newFile)
		map.set(relative(distDir, file), relative(distDir, newFile))
	}

	return map
}

export function remapMediaInHTML(mediaHashes, html, mediaRelUrl) {
	const mURL = escapeRegex(mediaRelUrl)
	const reFindMedia = new RegExp(`="(/?)(${mURL}/[^"]*)"`, 'g')
	return html.replace(reFindMedia, (_, optLeadingSlash, url) => {
		const hashedName = mediaHashes.get(url)
		if (!hashedName)
			throw new Error(`ERROR: Missing ${url}`)
		return `="${optLeadingSlash}${hashedName}"`
	})
}


function escapeRegex(literal) {
	return literal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

