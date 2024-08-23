import type { UserConfig, Mode } from './define-config'
import type { DOMElement } from './dom'
import type { Task } from './utils'
import type { Plugin } from './plugin'
import { isVisibleElementNode, isElementNode } from './dom'
import Overlay from './overlay'
import { schedule, makeHash } from './utils'
import PluginManager from './plugin'

export { default as defineConfig } from './define-config'

export enum ModeEnum {
    Single = 'single',
    Siblings = 'siblings',
}

class HighlightDom {
    overlay?: Overlay

    mode: Mode

    maxZIndex?: number

    portal?: DOMElement

    taskQueue: Task[] = []

    cache: boolean

    hash: string

    /**
     * @remark 批量挂载inspector的数量。高亮多个节点时可以优化性能
     */
    batchMountNum: number

    pluginManager: PluginManager = new PluginManager()

    constructor({
        mode = ModeEnum.Single,
        maxZIndex,
        portal,
        hash = makeHash(),
        batchMountNum = 10,
        plugins = [],
        cache = true,
    }: UserConfig = {}) {
        this.mode = mode
        this.maxZIndex = maxZIndex
        this.portal = portal
        this.hash = hash
        this.cache = cache
        this.batchMountNum = batchMountNum
        this.pluginManager.install(plugins)
    }

    registerPlugin(plugin: Plugin) {
        this.pluginManager.use(plugin)
    }

    getHash(): string {
        return this.hash
    }

    getZIndex(): number {
        return this.overlay?.zIndex || 0
    }

    interruptTask() {
        this.taskQueue.forEach((task) => {
            task.interruptSchedule()
        })
        this.taskQueue = []
    }

    clearOverlay() {
        if (this.overlay) {
            this.overlay.removeContainer()
            this.overlay = undefined
        }
    }

    highlightNode(target: DOMElement) {
        if (!this.overlay) {
            return
        }
        const overlay = this.overlay
        overlay.create(target)

        if (this.mode === ModeEnum.Single) {
            overlay.mount()
            this.pluginManager.hooks.afterHighlight.call(this)
            return
        }

        let preNode = target.previousElementSibling as DOMElement | null
        let nextNode = target.nextElementSibling as DOMElement | null

        let currentNodePosition: 'pre' | 'next' = 'pre'
        let isValidPreNode = false
        let isValidNextNode = false

        /**
         *  每轮更新，取距离当前节点最近的batchMountNum个节点进行渲染(这里渲染指的是将overlay模版和数据组装好)。
         *  例如1,2,3,4,5,6,7,8,9,10五个节点，当前节点是5，且批量处理数量为4
         *  那么每轮渲染顺序为依次为[3,4,5,6,7],[1,2,8,9,10]，以保证距离当前节点近的节点优先渲染
         *  注意: "田"字格问题，比如1,2,3,4按田字布局,其中2,3是在右侧屏幕外，如果4当高亮节点，那么节点1也需要高亮
         */
        const batchUpdate = () => {
            let i = 0
            const renderTask = () => {
                if (currentNodePosition === 'pre') {
                    isValidPreNode = !!preNode && isVisibleElementNode(preNode)
                    if (isValidPreNode) {
                        overlay.create(preNode!)
                    }
                    // 不是有效节点的话，继续找下一个有效节点。这样可以保证每次批量渲染的都是有效节点。无效节点直接跳过
                    preNode = preNode && (preNode.previousElementSibling as DOMElement | null)
                    currentNodePosition = nextNode ? 'next' : 'pre'
                } else if (currentNodePosition === 'next') {
                    isValidNextNode = !!nextNode && isVisibleElementNode(nextNode)
                    if (isValidNextNode) {
                        overlay.create(nextNode!)
                    }
                    nextNode = nextNode && (nextNode.nextElementSibling as DOMElement | null)
                    currentNodePosition = preNode ? 'pre' : 'next'
                }
                i++
            }

            const canExec = () => {
                if (preNode == null && nextNode == null) {
                    return false
                }

                return i < this.batchMountNum
            }

            const scheduler = schedule(renderTask, canExec, () => {
                // 这里因为用了异步函数，需要额外处理下中断
                requestAnimationFrame(() => {
                    if (scheduler.isInterrupt) {
                        this.pluginManager.hooks.afterHighlight.call(this)
                        return
                    }
                    overlay.mount()
                    if (preNode || nextNode) {
                        // 走到这里说明上一轮批处理任务执行完了。此时队列只有一个任务。直接清空就好
                        this.taskQueue = []
                        batchUpdate()
                        return
                    }
                })
            })

            this.taskQueue.push(scheduler)
        }
        batchUpdate()
    }

    clearOverlayCache() {
        if (this.overlay) {
            this.overlay.clearCache()
        }
    }

    reset() {
        this.interruptTask()
        this.clearOverlay()
    }

    shouldHighlight(target: EventTarget): target is DOMElement {
        if (!isElementNode(target)) {
            console.warn('the parameter "target" must be HTMLElement or SVGElement')
            return false
        }

        if (!isVisibleElementNode(target)) {
            console.warn('element is not visible')
            return false
        }
        return true
    }

    highlight(
        target: EventTarget | null,
        options: Pick<UserConfig, 'mode' | 'maxZIndex' | 'hash'> = {},
    ) {
        this.pluginManager.hooks.beforeHighlight.call(this, target)
        this.reset()

        // 仅允许'mode', 'maxZIndex', 'hash'字段覆盖全局配置
        Object.keys(options).forEach((key) => {
            if (['mode', 'maxZIndex', 'hash'].includes(key)) {
                ;(this as any)[key] = options[key as keyof typeof options]
            }
        })

        if (!target) {
            throw new Error('the parameter "target" is required')
        }

        if (!this.shouldHighlight(target)) {
            return
        }

        if (!this.overlay) {
            this.overlay = Overlay.getInstance({
                zIndex: this.maxZIndex,
                portal: this.portal,
                cache: this.cache,
                hash: this.hash,
                pluginManager: this.pluginManager,
            })
        }

        this.highlightNode(target)
    }
}

export default HighlightDom
