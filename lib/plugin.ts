import { Plugin } from "esbuild"
import { parse } from "path";
import { transformAsync } from "@babel/core";
import solid from "babel-preset-solid";
import ts from "@babel/preset-typescript";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";

export interface SolidOptions {
  hydratable?: boolean;
  generate?: 'dom' | 'ssr';
}

export function solidPlugin(options: SolidOptions = {}): Plugin {
  return {
    name: "esbuild:solid",

    setup(build) {
      build.onLoad({ filter: /\.(t|j)sx$/ }, async (args) => {
        const source = await readFile(args.path, { encoding: "utf-8" });

        const { name, ext } = parse(args.path);
        const filename = name + ext;

        const { code } = await transformAsync(source, {
          presets: [[solid, options], ts],
          filename,
          sourceMaps: "inline",
        });

        return { contents: code, loader: "js" };
      });
    },
  };
}

export interface DedupeResolveOptions {
  isServer?: boolean;
  isExternal?: boolean;
}

export function dedupeResolvePlugin({ isServer, isExternal = false }: DedupeResolveOptions): Plugin {
    return {
        name: 'dedupe-resolve-plugin',
        setup(build) {

            // de-duplicates solid-js and solid-js/web imports by
            // resolving exactly to the same file all the time
            // also makes sure the correct implementation invariant is chosen
            build.onResolve({ filter: /solid-js/ }, async args => {
                const solidJsPath = await import.meta.resolve(args.path)

                const clientImplFileName = solidJsPath.indexOf('solid-js/web') > -1 ? 'web.js' : 'solid.js'
                const consolidatedSolidJsPath = !isServer ? solidJsPath.replace('server.js', clientImplFileName) : solidJsPath

                return { path: fileURLToPath(consolidatedSolidJsPath), external: isExternal }
            })
        },
    }
}

