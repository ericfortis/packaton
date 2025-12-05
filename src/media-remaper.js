import { join, parse } from 'node:path'
import { renameSync } from 'node:fs'
import { sha1, listFiles } from './fs-utils.js'


/**
 * Subdirectories are ignored
 *   foo.avif      -> foo-<sha1>.avif
 */
export async function renameMediaWithHashes(dir) {
	const mediaHashes = new Map()

	for (const file of await listFiles(dir)) {
		const { name, base, ext } = parse(file)
		const newFileName = name + '-' + sha1(file) + ext
		const newFile = join(dir, newFileName)
		mediaHashes.set(base, newFileName)
		renameSync(file, newFile)
	}

	return mediaHashes
}

// TODO if media is made configurable, we'd need to espace the regex for example .media -> \.media
// Having one dir is kinda nice for nginx headers, but that's not an excuse nor solves nested dirs with same filename

// TODO for (b of base) find and replace base with new hash
//   so it works in dirs outside media/
//  mm currently a limitation is that the dictionary doesn't have the path, just the name, so
// filenames need to be unique, regardless of being in a subfolder
/**
 * Edit the media source links in the HTML, so they have the new SHA-1 hashed
 * filenames. Assumes that all the files are in "media/" (not ../media, ./media)
 *
 * If you want to handle CSS files, edit the regex so
 * instead of checking `="` (e.g. src="img.png") also checks for `url(`
 **/
export function remapMediaInHTML(mediaHashes, html) {
	const reFindMedia = new RegExp('(="static/media/.*?)"', 'g')
	const reFindMediaKey = new RegExp('="static/media/')

	for (const [, url] of html.matchAll(reFindMedia)) {
		const hashedName = mediaHashes.get(url.replace(reFindMediaKey, ''))
		if (!hashedName)
			throw `ERROR: Missing ${url}\n`
		html = html.replace(url, `="static/media/${hashedName}`)
	}
	return html
}


