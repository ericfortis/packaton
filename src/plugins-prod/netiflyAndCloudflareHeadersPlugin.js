export function netiflyAndCloudflareHeadersPlugin(opts) {
	let result = []
	for (const [route, headers] of Object.entries(opts)) {
		result.push(route)
		for (const [h, v] of headers)
			result.push(`  ${h}: ${v}`)
	}
	return result.join('\n')
}

