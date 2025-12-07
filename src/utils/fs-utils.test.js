import test, { describe } from 'node:test'
import { equal } from 'node:assert/strict'
import { replaceExt } from './fs-utils.js'


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
