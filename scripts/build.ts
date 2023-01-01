import { build, BuildOptions } from "esbuild"
import { run } from "../lib/vm"
import { readFile, writeFile } from "fs/promises"
import { renderToString } from "solid-js/web"
import { dedupeResolvePlugin, solidPlugin } from "../lib/plugin"
import { deflateRaw } from "zlib"

console.time('Building page')

// defaults for server code bundles
export const esbuildConfigBaseSsr: BuildOptions = {
  bundle: true,
  //minify: true,
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
  platform: 'browser',
  //minify: true,
  sourcemap: 'external',
  entryPoints: ['src/index.tsx'],
  outfile: 'dist/index-client.js',
  plugins: [
    solidPlugin({ generate: 'dom', hydratable: true }),
    // de-duping the solid dependency triggers 
    //dedupeResolvePlugin({ isServer: false })
  ]
})

const pageJs = await readFile('./dist/index.js', { encoding: 'utf-8' })

// run page code
const pageResult = await run<{ default: Function }, undefined>(pageJs, context)
const Page = pageResult.data!.default as () => unknown

// SSG render and write to disk
await writeFile('dist/index.html', renderToString(Page), { encoding: 'utf-8' })

const pageClientJs = await readFile('dist/index-client.js', { encoding: 'utf-8' })

console.timeEnd('Building page')

deflateRaw(Buffer.from(pageClientJs), (err, compressedJs) => {
  console.log('Page JS in KiB', Math.round(Buffer.from(pageClientJs).byteLength / 1024))
  console.log('Page JS in KiB (deflate)', Math.round(compressedJs.byteLength / 1024))
})