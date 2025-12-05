import { minify } from 'terser'


export async function minifyJS(code, options) {
	return (await minify(code, options)).code
}
