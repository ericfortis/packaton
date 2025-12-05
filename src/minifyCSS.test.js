import { equal } from 'node:assert/strict'
import { describe, test } from 'node:test'
import { minifyCSS, Testable } from './minifyCSS.js'


describe('minifyCSS', () => {
	test('Acceptance', () => {
		equal(minifyCSS(`
.a { 
	color: green; 
	&:active {
		color: red; 
	}
}
.b { color: orange; }
.c { color: #f00; }
.d { color: rgb(255, 255,  0); }
.e { color: #111222; }
`),
			`.a{color:green;&:active{color:red}}.b{color:orange}.c{color:#f00}.d{color:rgb(255,255,0)}.e{color:#111222}`)
	})

	test('Comments', () => {
		testRegexMatchesGetDeleted(Testable.BlockComments, `
/* Foo */
/* Multiline line 1 
Line 2 */
.a { color: red; } /* Bar */
/*/*/
`,
			`


.a { color: red; } 

`)
	})


	test('Trimming', () => {
		testRegexMatchesGetDeleted(Testable.LeadingAndTrailingWhitespace, `
 .b .c {
	color: orange;
  width: 20px;
}
.d {
		height: 30px;
		}
`,
			`.b .c {
color: orange;
width: 20px;
}
.d {
height: 30px;
}`)
	})


	test('Inner Prop Value space', () => {
		testRegexMatchesGetDeleted(Testable.PropValueWhitespaceSeparator, `
.e {
	color: #f00;
	height:   100px;
	width:	100px;
	content:  'a';
}
`,
			`
.e {
	color:#f00;
	height:100px;
	width:100px;
	content:'a';
}
`)
	})


	test('Newlines', () => {
		testRegexMatchesGetDeleted(Testable.Newlines, `
.f {
	color: blue;
	height: 300px;
	width: 300px;
}
`,
			`.f {	color: blue;	height: 300px;	width: 300px;}`)
	})


	test('White spaces before braces', () => {
		testRegexMatchesGetDeleted(Testable.WhitespaceBeforeBraces, `
.g { color: pink; width: 400px; } `,
			`
.g{ color: pink; width: 400px;} `)
	})


	test('White spaces after braces', () => {
		testRegexMatchesGetDeleted(Testable.WhitespaceAfterBraces, `
.G { color: green; width: 410px; } `,
			`
.G {color: green; width: 410px; }`)
	})

	test('Final semicolon', () => {
		testRegexMatchesGetDeleted(Testable.LastSemicolonInSet,
			'.h {color: cyan; width: 500px;}',
			'.h {color: cyan; width: 500px}'
		)
	})

	test('Comma + Space', () => {
		testRegexMatchesGetDeleted(Testable.SpacesAfterComma,
			'.H { color: rgb(255, 255, 0); }',
			'.H { color: rgb(255,255,0); }'
		)
	})

	function testRegexMatchesGetDeleted(regex, input, expected) {
		equal(input.replace(regex, ''), expected)
	}
})
