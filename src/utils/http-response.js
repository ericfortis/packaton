import fs from 'node:fs'
import { mimeFor } from './mimes.js'


export function sendError(response, error) {
	response.statusCode = error?.code === 'ENOENT'
		? 404
		: 500
	console.error(error.message)
	response.end()
}

export function sendJSON(response, payload) {
	response.setHeader('Content-Type', 'application/json')
	response.end(JSON.stringify(payload))
}

export function serveAsset(response, file) {
	response.setHeader('Content-Type', mimeFor(file))
	const reader = fs.createReadStream(file)
	reader.on('open', function () { this.pipe(response) })
	reader.on('error', function (error) { sendError(response, error) })
}


export async function servePartialContent(response, headers, file) {
	const { size } = await fs.promises.lstat(file)
	let [start, end] = headers.range.replace(/bytes=/, '').split('-').map(n => parseInt(n, 10))
	if (isNaN(end)) end = size - 1
	if (isNaN(start)) start = size - end

	if (start < 0 || start > end || start >= size || end >= size) {
		response.statusCode = 416 // Range Not Satisfiable
		response.setHeader('Content-Range', `bytes */${size}`)
		response.end()
	}
	else {
		response.statusCode = 206 // Partial Content
		response.setHeader('Accept-Ranges', 'bytes')
		response.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
		response.setHeader('Content-Type', mimeFor(file))
		const reader = fs.createReadStream(file, { start, end })
		reader.on('open', function () { this.pipe(response) })
		reader.on('error', function (error) { sendError(response, error) })
	}
}
