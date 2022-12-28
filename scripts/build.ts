import { build, BuildOptions } from "esbuild"
import { run } from "../lib/vm"
import { readFile, writeFile } from "fs/promises"
import { renderToString } from "solid-js/web"
import { solidPlugin } from "../lib/plugin"
import { deflateRaw } from "zlib"

console.time('Building page')

// defaults for server code bundles
export const esbuildConfigBaseSsr: BuildOptions = {
  bundle: true,
  minify: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'node',
  sourcemap: 'external',
  external: ["solid-js", "solid-js/web"]
}

// server code bundle, non-hydratable (<html>,<head>,<body> etc.)
await build({
  ...esbuildConfigBaseSsr,
  entryPoints: ['src/_document.tsx'],
  plugins: [
    solidPlugin({ generate: 'ssr', hydratable: false })
  ]
})

// server code bundle, hydratable (page code only)
await build({
  ...esbuildConfigBaseSsr,
  entryPoints: ['src/index.tsx'],
  plugins: [
    solidPlugin({ generate: 'ssr', hydratable: true })
  ]
})

// client code bundle
await build({
  bundle: true,
  format: 'iife',
  platform: 'browser',
  minify: true,
  sourcemap: 'external',
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/index-client.js',
  plugins: [
    solidPlugin({ generate: 'dom', hydratable: true })
  ]
})

const pageJs = await readFile('./dist/index.js', { encoding: 'utf-8' })

// run page code
const pageResult = await run<{ default: Function }, undefined>(pageJs, {})
const Page = pageResult.data!.default

const _documentJs = await readFile('./dist/_document.js', { encoding: 'utf-8' })

// run document code and merge <body> via runtime SSG
const _documentResult = await run<{ default: Function }, undefined>(
  _documentJs, 
  { Page, pageClientScriptPath: 'index-client.js' }
)
const Document = _documentResult.data!.default as () => unknown

// SSG render and write to disk
await writeFile('dist/index.html', renderToString(Document), { encoding: 'utf-8' })

const pageClientJs = await readFile('dist/index-client.js', { encoding: 'utf-8' })

console.timeEnd('Building page')

deflateRaw(Buffer.from(pageClientJs), (err, compressedJs) => {
  console.log('Page JS in KiB', Math.round(Buffer.from(pageClientJs).byteLength / 1024))
  console.log('Page JS in KiB (deflate)', Math.round(compressedJs.byteLength / 1024))
})