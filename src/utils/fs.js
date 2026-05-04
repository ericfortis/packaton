import { createHash } from 'node:crypto'
import { readdir, realpath } from 'node:fs/promises'
import { join, dirname, sep, resolve } from 'node:path'
import { rmSync, mkdirSync, readFileSync, writeFileSync, lstatSync } from 'node:fs'



export const read = f => readFileSync(f, 'utf8')

export const lstat = f => lstatSync(f, { throwIfNoEntry: false })
export const isFile = path => lstat(path)?.isFile()
export const isDirectory = path => lstat(path)?.isDirectory()


export function write(fname, data) {
	mkdirSync(dirname(fname), { recursive: true })
	writeFileSync(fname, data, 'utf8')
}

export function removeDir(dir) {
	rmSync(dir, {
		recursive: true,
		force: true // allows for removing non-existing directories
	})
}

export const sizeOf = f => lstatSync(f).size
export const sha1 = f => createHash('sha1').update(readFileSync(f)).digest('base64url')

export async function listFiles(dir) {
	return (await readdir(dir, {
		withFileTypes: true,
		recursive: true
	}))
		.filter(e => e.isFile())
		.map(e => join(e.parentPath, e.name))
}


export const saveAsJSON = (name, data) => {
	writeFileSync(name, JSON.stringify(data, null, '\t'), 'utf8')
}

export const replaceExt = (f, ext) => {
	const parts = f.split('.')
	if (parts.length > 1 && parts[0])
		parts.pop()
	parts.push(ext)
	return parts.join('.')
}

/** @returns {string | null} absolute path if it’s within `baseDir` */
export async function resolveIn(baseDir, file) {
	try {
		const parent = await realpath(baseDir)
		const child = resolve(join(parent, file))
		return child.startsWith(join(parent, sep))
			? child
			: null
	}
	catch {
		return null
	}
}
