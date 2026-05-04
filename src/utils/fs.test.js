import { join } from 'node:path'
import { equal } from 'node:assert/strict'
import { tmpdir } from 'node:os'
import { after, describe, test } from 'node:test'
import { mkdtempSync, rmSync, realpathSync } from 'node:fs'

import { replaceExt, resolveIn } from './fs.js'


describe('replaceExt', () => {
	test('replaces a simple extension', () =>
		equal(replaceExt('file.txt', 'md'), 'file.md'))

	test('replaces a multi-part extension', () =>
		equal(replaceExt('archive.tar.gz', 'zip'), 'archive.tar.zip'))

	test('adds extension when none exists', () =>
		equal(replaceExt('README', 'md'), 'README.md'))

	test('handles empty filename', () =>
		equal(replaceExt('', 'ext'), '.ext'))

	test('handles dot-files', () =>
		equal(replaceExt('.env', 'txt'), '.env.txt'))
})


describe('resolveIn', () => {
	const isNull = v => equal(v, null)
	const baseDir = mkdtempSync(join(tmpdir(), '_resolveIn'))
	const baseParentDir = join(baseDir, '..')
	after(() => rmSync(baseDir, { recursive: true, force: true }))

	test('null when baseDir does not exist', async () =>
		isNull(await resolveIn(join(baseParentDir, 'missing'), 'file.json')))

	test('null when relative path escapes baseDir', async () =>
		isNull(await resolveIn(baseDir, '../outside.json')))


	const realBaseDir = realpathSync(baseDir)
	const onReal = f => join(realBaseDir, f)

	test('resolves a relative file within baseDir', async () =>
		equal(await resolveIn(baseDir, 'file.json'), onReal('file.json')))

	test('resolves file starting with /', async () =>
		equal(await resolveIn(baseDir, '/file.json'), onReal('file.json')))
})
