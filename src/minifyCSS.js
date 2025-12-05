/**
 * You can override this minifier in `config.minifyCSS`
 * 
 * This program is an oversimplified CSS minifier. It doesn’t
 * try to minify everything, but only what’s safe and easy to minify.
 * 
 * Why?
 * When I wrote this program, ~2018, some CSS minifiers reordered rules 
 * but that messed up browser-specific prefixes that were used as workarounds.
 */

// TODO
// - Handle nested comments like /*/* foo */*/
// - Preserve anything within data-uri, and content strings.
//   We could do like in minifyHTML. i.e., stacking all the things to
//   be preserved and replace them with a magic string then pop the stack to re-replace.

const BlockComments = /\/\*(\*(?!\/)|[^*])*\*\//g
const LeadingAndTrailingWhitespace = /^\s*|\s*$/gm
const PropValueWhitespaceSeparator = /(?<=:)\s*/gm
const Newlines = /\n/gm
const WhitespaceBeforeBraces = /\s*(?=[{}])/gm
const WhitespaceAfterBraces = /(?<=[{}])\s*/gm
const LastSemicolonInSet = /;(?=})/gm
const SpacesAfterComma = /(?<=,)\s+/g


export function minifyCSS(css) {
	return css
		.replace(BlockComments, '')
		.replace(LeadingAndTrailingWhitespace, '')
		.replace(PropValueWhitespaceSeparator, '')
		.replace(Newlines, '')
		.replace(WhitespaceBeforeBraces, '')
		.replace(WhitespaceAfterBraces, '')
		.replace(LastSemicolonInSet, '')
		.replace(SpacesAfterComma, '')
}

export const Testable = {
	BlockComments,
	LeadingAndTrailingWhitespace,
	PropValueWhitespaceSeparator,
	Newlines,
	WhitespaceBeforeBraces,
	WhitespaceAfterBraces,
	LastSemicolonInSet,
	SpacesAfterComma,
}

