/**
 * You can override this minifier in `config.minifyHTML`
 *
 * This program is an oversimplified HTML minifier. It doesn’t
 * try to minify everything, but only what’s safe and easy to minify.
 * It's based on https://gist.github.com/espretto/1b3cb7e8b01fa7daaaac
 *
 * Why?
 * When I wrote this program, ~2018, I tried a few libraries but some 
 * of them messed up relevant spaces in `<pre>` tags and between tags.
 *
 * We don’t remove newlines because for example `<kbd>` and `<a>`
 * would need special rules to have a space in-place of that newline.
 *
 * 
 * This algorithm basically collects parts that should not be minified and
 * replaces them with a known magic string "<preserved>". Then, at the end, 
 * replaces, in order, those magic strings with the original tag and its content.
 */


const Comments = /<!--(?!\s*?\[\s*?if)[\s\S]*?-->/gi

const PreserveTags = /<(pre|style|script(?![^>]*?src))[^>]*>[\s\S]*?<\/\1>/gi
const InsertTags = /<preserved>/g

const ReduceAttributeDelimiters = /\s{2,}(?=[^<]*>)/g
const LeadingWhitespace = /^\s*/gm


export function minifyHTML(html) {
	const preservedTags = []

	function onPreserveTag(tag) {
		preservedTags.push(tag)
		return '<preserved>' // temp placeholder
	}

	function onInsertTag() {
		return preservedTags.shift() // pops left, rewrites the placeholder back to the original tag
	}

	return html
		.replace(Comments, '')
		.replace(PreserveTags, onPreserveTag)
		.replace(ReduceAttributeDelimiters, ' ')
		.replace(LeadingWhitespace, '')
		.replace(InsertTags, onInsertTag)
		.trim()
}
