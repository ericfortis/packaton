import { minify } from 'terser'


export async function minifyJS(code, isModule) {
	return (await minify(code, { module: isModule })).code
}
