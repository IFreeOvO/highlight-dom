import { SyncHook } from 'tapable'
export const hookTypes = ['beforeCreateOverlay', 'beforeMountOverlay']
import { isFunction } from 'radash'

export interface Plugin {
    name: string
    hooks: Record<string, (...args: any[]) => any>
}

class PluginManager {
    hooks = {
        beforeHighlight: new SyncHook<[object, EventTarget | null]>(['ctx', 'target']),
        afterHighlight: new SyncHook(['ctx']),
        beforeInitOverlay: new SyncHook(['ctx']),
        afterInitOverlay: new SyncHook(['ctx']),
        beforeCreateOverlay: new SyncHook<[object, object]>(['ctx', 'options']),
        afterCreateOverlay: new SyncHook(['ctx']),
        beforeMountOverlay: new SyncHook(['ctx']),
        afterMountOverlay: new SyncHook(['ctx']),
        generateCss: new SyncHook(['ctx']),
    }

    plugins: Map<string, Record<string, (...args: any[]) => any>> = new Map()

    install(plugins: Plugin[]) {
        plugins.forEach((plugin) => {
            if (plugin.hooks) {
                this.use(plugin)
            }
        })
    }

    use(plugin: Plugin) {
        const hooks = Object.keys(this.hooks)
        Object.keys(plugin.hooks).forEach((hook) => {
            const callback = plugin.hooks[hook]
            if (hooks.includes(hook) && isFunction(callback)) {
                this.hooks[hook as keyof typeof this.hooks].tap(plugin.name, callback)
                this.plugins.set(plugin.name, plugin.hooks)
            }
        })
    }
}

export default PluginManager
