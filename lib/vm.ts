import vm from 'node:vm'
import { Context } from './context'

export interface ExecutionResult<D, S = any> {
  data?: D
  state?: S
  error?: Error
}

/** dynamic ESM module linking */
export const linker = (runContext: vm.Context) => {
  return async (specifier: string) => {
    return new Promise(async (resolveLink) => {
      let module: any
      if (!module) {
        module = await import(specifier)
      }

      const exportNames = Object.keys(module)

      // @ts-ignore
      const syntheticModule = new vm.SyntheticModule(
        exportNames,
        function () {
          exportNames.forEach((key) => {
            this.setExport(key, module[key])
          })
        },
        { context: runContext },
      )
      resolveLink(syntheticModule)
    })
  }
}

/** dynamic ESM module execution via VM */
export const run = async <D, S>(scriptCode: string, context: Context): Promise<ExecutionResult<D, S>> => {
  let state: any
  let data: any
  try {
    const runContext = vm.createContext({
      context,
      console: console
    })

    // @ts-ignore
    const mod = new vm.SourceTextModule(`${scriptCode}`, {
      context: runContext,
    })

    await mod.link(linker(runContext))

    await mod.evaluate()

    data = mod.namespace

  } catch (e: any) {
    return {
        error: e
    }
  }

  return {
    data,
    state,
  }
}
