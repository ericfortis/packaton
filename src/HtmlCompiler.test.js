import { deepEqual } from 'node:assert/strict'
import { describe, test } from 'node:test'
import { HtmlCompiler } from './HtmlCompiler.js'
import { minifyJS } from './minifyJS.js'
import { minifyCSS } from './minifyCSS.js'
import { minifyHTML } from './minifyHTML.js'

const opts = {
	minifyJS,
	minifyCSS,
	minifyHTML
}

describe('HtmlCompiler', () => {
	const HTML = `
<html lang="en">
<head>
	<link rel="stylesheet" href="0.css">
	<link href="../1.css"  rel="stylesheet" >
	<link href="2.css" rel="stylesheet">
	<link rel="dns-prefetch" href="https://my.uxtly.com">
</head>
<body>

<footer> Footer </footer>

<script src="0.js"></script>
	<script   src="../1.js"  ></script>
	<script type="module"  src="2.js"></script>
	<script src="3.json" type="speculationrules"></script>
</body>
</html>
`

	test('Extracts CSS files', () =>
		deepEqual(new HtmlCompiler(HTML, '', opts).extractStyleSheetHrefs(), [
			'0.css', '../1.css', '2.css'
		]))

	test('Extracts Script files', () =>
		deepEqual(new HtmlCompiler(HTML, '', opts).extractScriptSources(), [
			['0.js', 'application/javascript'],
			['../1.js', 'application/javascript'],
			['2.js', 'module'],
			['3.json', 'speculationrules']
		]))


	test('Removes line containing X', () => {
		const doc = new HtmlCompiler(HTML, '', opts)
		doc.removeLineContaining('href="0.css"')
		deepEqual(doc.html, `
<html lang="en">
<head>
	<link href="../1.css"  rel="stylesheet" >
	<link href="2.css" rel="stylesheet">
	<link rel="dns-prefetch" href="https://my.uxtly.com">
</head>
<body>

<footer> Footer </footer>

<script src="0.js"></script>
	<script   src="../1.js"  ></script>
	<script type="module"  src="2.js"></script>
	<script src="3.json" type="speculationrules"></script>
</body>
</html>
`)
	})
})
