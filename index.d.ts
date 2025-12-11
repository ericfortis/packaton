export interface Config {
	mode?: 'development' | 'production';
	srcPath?: string
	assetsDir?: string
	ignore?: RegExp
	

	// Dev
  host?: string,
  port?: number
  onReady?: (address: string) => void
  hotReload?: boolean // For UI dev purposes only
	
	// Production
	outputDir?: string
	outputExtension?: string
	minifyJS?: (js: string) => Promise<string>
	minifyCSS?: (css: string) => Promise<string>
	minifyHTML?: (html: string) => Promise<string>
	sitemapDomain?: string
	cspMapEnabled?: boolean
}
  
