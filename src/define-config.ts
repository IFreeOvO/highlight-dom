import type { Plugin } from './plugin'

/**
 * @type  single 单选
 * @type  siblings 多选(在可视区内，选择包含目标节点和目标的兄弟节点在内的多个节点)
 */
export type Mode = 'single' | 'siblings'

/**
 * @typedef {UserConfig} UserConfig
 * @remarks 用户配置
 * @property {HTMLElement} UserConfig.target - ssd
 */
export interface UserConfig {
    /**
     * @remarks 高亮模式
     * @type  single 单选
     * @type  siblings 多选(在可视区内，选择包含目标节点和目标的兄弟节点在内的多个节点)
     */
    mode?: Mode
    /**
     * @remarks Overlay的层级。不穿的话自动获取页面最大层级。某些场景下手动传入，可以跳过自动获取阶段，从而获得更好的执行性能
     */
    maxZIndex?: number
    /**
     * @remarks Overlay的挂载位置。默认挂载到html上
     */
    portal?: HTMLElement
    /**
     * @remark 防止通用样式与项目样式冲突用的hash
     */
    hash?: string
    /**
     * @remark 批量挂载inspector的数量。高亮多个节点时可以优化性能
     */
    batchMountNum?: number
    /**
     * @remark 自定义插件
     */
    plugins?: Plugin[]
    /**
     * @remark 是否缓存高亮节点
     */
    cache?: boolean
}

function defineConfig(config: UserConfig): UserConfig {
    return config
}

export default defineConfig
