import { build, BuildOptions } from "esbuild"
import { run } from "../lib/vm"
import { readFile, writeFile } from "fs/promises"
import { renderToString } from "solid-js/web"
import { solidPlugin } from "../lib/plugin"
import { compress } from 'esbuild-plugin-compress';

console.time('Building page')

// defaults for server code bundles
export const esbuildConfigBaseSsr: BuildOptions = {
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'node',
  sourcemap: 'external',
  external: ["solid-js", "solid-js/web"]
}

// server code bundle, hydratable (page code only)
await build({
  ...esbuildConfigBaseSsr,
  entryPoints: ['src/index.tsx'],
  plugins: [
    solidPlugin({ generate: 'ssr', hydratable: true })
  ]
})

const context = { pageClientScriptPath: 'index-client.js' }

// client code bundle
await build({
  bundle: true,
  format: 'iife',
  define: {
    context: JSON.stringify(context)
  },
  minify: true,
  write: false,
  platform: 'browser',
  sourcemap: 'external',
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/index-client.js',
  plugins: [
    solidPlugin({ generate: 'dom', hydratable: true }),
    compress({
      brotli: false,
      outputDir: 'compressed',
      exclude: ['**/*.map'],
    }),
  ]
})

const pageJs = await readFile('./dist/index.js', { encoding: 'utf-8' })

// run page code
const pageResult = await run<{ default: Function }, undefined>(pageJs, context)
const Page = pageResult.data!.default as () => unknown

// SSG render and write to disk
await writeFile('dist/index.html', renderToString(Page), { encoding: 'utf-8' })

console.timeEnd('Building page')

const pageClientJs = Buffer.from(await readFile('dist/index-client.js'))
const pageClientJsGz = Buffer.from(await readFile('dist/compressed/index-client.js.gz'))

const sizeInKib = (buffer: Buffer) => (buffer.byteLength / 1024).toFixed(2)

console.log('index-client.js:', sizeInKib(pageClientJs), 'KiB')
console.log('index-client.js (gz):', sizeInKib(pageClientJsGz), 'KiB')