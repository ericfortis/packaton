# Packaton WIP

Static Pages Bundler.

## HTML Template
Optionally, you can create an HTML template.
For example, to handle the common header, navigation, and footer.

## Assets and CSP
The production bundler inlines the JavaScript and CSS. Also, it
computes their corresponding CSP nonce and injects it as well.


## Images and Videos (immutable naming)
For long-term caching, [media-remaper.js](src/media-remaper.js) appends a SHA-1 hash
to the filenames and takes care of rewriting their `src` in HTML (**only in HTML**).

If you want to use media files in CSS, create a similar function to
`remapMediaInHTML` but with a regex for replacing the `url(...)` content.

## Production Build
It crawls the dev server, and saves each route as static html page.
It saves the pages without the `.html` extension for pretty URLs. 
See [Pretty routes for static HTML](https://blog.uxtly.com/pretty-routes-for-static-html)



## Minifiers

```js
import { minify } from 'terser'


const terserOptions = {}

Packaton({
  minifyJS: async js => (await minify(js, terserOptions)).code
})
```

To avoid minifying, you can pass `a=>a` 


## Caveats
- can't write inline scripts or css (all must be in an external file, packaton inlines them)
- must have an index
- Ignored Documents start with `_`, so you can't have routes that begin with _
- Non-Documents and Files outside /static are not automatically copied over,
  you need to specify them. 
- static/media only files at the top level get hashed-named. But files within subdirs are not (by design).
