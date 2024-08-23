import type { ElementInfo, InlineStyle, DOMElement } from './dom'
import { partial, isFunction, isPrimitive } from 'radash'
import {
    getMaxZIndex,
    getElementInfo,
    calcTop,
    calcLeft,
    getBoxModelHeight,
    getBoxModelWidth,
    removeDom,
    $,
} from './dom'
import PluginManager from './plugin'

export interface OverlayOptions {
    zIndex?: number
    portal?: DOMElement
    cache?: boolean
    hash?: string
    pluginManager?: PluginManager
}

export interface InspectorData {
    domInspector: InlineStyle
    domInspectorContent: InlineStyle
    domInspectorPaddingTop: InlineStyle
    domInspectorPaddingBottom: InlineStyle
    domInspectorPaddingLeft: InlineStyle
    domInspectorPaddingRight: InlineStyle
    domInspectorBorderTop: InlineStyle
    domInspectorBorderBottom: InlineStyle
    domInspectorBorderLeft: InlineStyle
    domInspectorBorderRight: InlineStyle
    domInspectorMarginTop: InlineStyle
    domInspectorMarginBottom: InlineStyle
    domInspectorMarginLeft: InlineStyle
    domInspectorMarginRight: InlineStyle
}

export interface TipsData {
    tagName: string
    id: string
    classNames: string
    size: string
    tipsClass: string
    style: string
    left: `${string}px`
}

export type OverlayData = InspectorData & TipsData

// 简易版styled-component
export function styled(styles: TemplateStringsArray, ...interpolations: any[]): string {
    let result = styles[0]

    for (let i = 0, len = interpolations.length; i < len; i++) {
        const value = interpolations[i]
        if (isFunction(value)) {
            result = result + value()
        } else if (isPrimitive(value)) {
            result += value
        } else {
            throw new Error(`不支持处理类型${Object.prototype.toString.call(value)}`)
        }

        result += styles[i + 1]
    }

    return result
}

/**
 * @example
 * 例如样式为'.demo {color: red;}'，hash值为abc，则样式会转成'.demo-abc {color: red;}'
 */
export function transformCss(css: string, hash: string = ''): string {
    const reg = /\.[\w-]+(?=[^{}]*\{)/g
    const newCss = css.replace(reg, (selector) => `${selector}-${hash}`)
    return newCss
}

class Overlay {
    static instance?: Overlay

    zIndex: number

    /**
     * @remark 防止通用样式与项目样式冲突用的hash
     */
    hash?: string

    fragments: string = ''

    /**
     * @remark inspector挂载在页面里的位置
     */
    portal: DOMElement

    /**
     * @remark 存放所有inspector的容器
     */

    container?: HTMLElement

    /**
     * @remarks 缓存高亮的元素信息
     */
    #cacheMap: WeakMap<DOMElement, any> = new WeakMap()

    pluginManager: PluginManager

    cache: boolean

    style: string = ''

    tipFontSize: string = '12px'

    tipBackgroundColor: string = '#333740'

    tipTagColor: string = '#e776e0'

    tipIdColor: string = '#eba062'

    tipClassColor: string = '#8dd2fb'

    tipLineColor: string = '#fff'

    tipSizeColor: string = '#fff'

    marginBackgroundColor: string = 'rgb(246 178 107 / 66%)'

    borderBackgroundColor: string = 'rgb(255 229 153 / 66%)'

    paddingBackgroundColor: string = 'rgb(147 196 125 / 55%)'

    contentBackgroundColor: string = 'rgb(111 169 220 / 66%)'

    private constructor({
        zIndex = getMaxZIndex() + 1,
        portal = document.documentElement,
        cache = true,
        hash,
        pluginManager = new PluginManager(),
    }: OverlayOptions = {}) {
        this.pluginManager = pluginManager
        this.pluginManager.hooks.beforeInitOverlay.call(this)
        this.zIndex = zIndex
        this.portal = portal
        this.cache = cache
        this.hash = hash
        this.createContainer()
        this.createOverlayStyle(this.hash)
        this.pluginManager.hooks.afterInitOverlay.call(this)
    }

    static getInstance(options: OverlayOptions): Overlay {
        if (!Overlay.instance) {
            Overlay.instance = new Overlay(options)
        }
        return Overlay.instance
    }

    defineDefaultTheme(hash?: string): string {
        const theme = styled`
                .dom-inspector {
                    position: fixed;
                    pointer-events: none;
                    transform-origin: 0 0;
                }
    
                .dom-inspector > div {
                    position: absolute;
                    pointer-events: none;
                }
    
                .dom-inspector-wrapper .tips {
                    position: fixed;
                    right: auto;
                    max-width: 100%;
                    padding: 3px 10px;
                    font-size: 0;
                    line-height: 18px;
                    pointer-events: none;
                    background-color: ${this.tipBackgroundColor};
                    border-radius: 4px;
                }
    
                .dom-inspector-wrapper .tips .tips-triangle {
                    position: absolute;
                    bottom: -16px;
                    left: 10px;
                    width: 0;
                    height: 0;
                    border-top: 8px solid ${this.tipBackgroundColor};
                    border-right: 8px solid transparent;
                    border-bottom: 8px solid transparent;
                    border-left: 8px solid transparent;
                }
    
                .dom-inspector-wrapper .reverse .tips-triangle {
                    top: -16px;
                    left: 10px;
                    border-top: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 8px solid ${this.tipBackgroundColor};
                    border-left: 8px solid transparent;
                }
    
                .dom-inspector-wrapper .tips > div {
                    display: inline-block;
                    overflow: auto;
                    font-family: Consolas, Menlo, Monaco, Courier, monospace;
                    font-size: ${this.tipFontSize};
                    vertical-align: middle;
                }
    
                .dom-inspector-wrapper .tips .tips-tag {
                    color: ${this.tipTagColor};
                }
    
                .dom-inspector-wrapper .tips .tips-id {
                    color: ${this.tipIdColor};
                }
    
                .dom-inspector-wrapper .tips .tips-class {
                    color: ${this.tipClassColor};
                }
    
                .dom-inspector-wrapper .tips .tips-line {
                    color: ${this.tipLineColor};
                }
    
                .dom-inspector-wrapper .tips .tips-size {
                    color: ${this.tipSizeColor};
                }
    
                .dom-inspector .dom-inspector-margin {
                    background-color: ${this.marginBackgroundColor};
                }
    
                .dom-inspector .dom-inspector-border {
                    background-color: ${this.borderBackgroundColor};
                }
    
                .dom-inspector .dom-inspector-padding {
                    background-color: ${this.paddingBackgroundColor};
                }
    
                .dom-inspector .dom-inspector-content {
                    background-color: ${this.contentBackgroundColor};
                }
            `
        return transformCss(theme, hash)
    }

    createOverlayStyle(hash?: string) {
        const hashTag = `tag-v-${hash}`
        if ($(`[${hashTag}]`)) {
            return
        }
        const styleDom = document.createElement('style')
        this.style = this.defineDefaultTheme(hash)

        this.pluginManager.hooks.generateCss.call(this)

        styleDom.setAttribute(hashTag, '')
        styleDom.textContent = this.style
        $('head')?.append(styleDom)
    }

    clearCache() {
        this.#cacheMap = new WeakMap()
    }

    removeContainer() {
        removeDom(this.container)
        this.container = undefined
        Overlay.instance = undefined
    }

    createContainer() {
        if (this.container) {
            return
        }
        const rootName = `dom-inspector-container-${this.hash}`
        const container = document.createElement('div')
        container.id = rootName
        container.style.zIndex = this.zIndex.toString()
        this.container = container
        this.portal.appendChild(this.container!)
    }

    createInspector(data: OverlayData): string {
        const {
            domInspector,
            domInspectorContent,
            domInspectorPaddingTop,
            domInspectorPaddingBottom,
            domInspectorPaddingRight,
            domInspectorPaddingLeft,
            domInspectorBorderTop,
            domInspectorBorderRight,
            domInspectorBorderBottom,
            domInspectorBorderLeft,
            domInspectorMarginTop,
            domInspectorMarginRight,
            domInspectorMarginBottom,
            domInspectorMarginLeft,
        } = data
        const template = `<div  class="dom-inspector-${this.hash}" style="z-index: ${this.zIndex}; width: ${domInspector.width}; height: ${domInspector.height}; top: ${domInspector.top}; left: ${domInspector.left};">
            <div class="dom-inspector-content-${this.hash}" style="width: ${domInspectorContent.width}; height: ${domInspectorContent.height}; top: ${domInspectorContent.top}; left: ${domInspectorContent.left};"></div>
            <div class="dom-inspector-padding-${this.hash} dom-inspector-padding-top-${this.hash}" style="width: ${domInspectorPaddingTop.width}; height: ${domInspectorPaddingTop.height}; top: ${domInspectorPaddingTop.top}; left: ${domInspectorPaddingTop.left};"></div>
            <div class="dom-inspector-padding-${this.hash} dom-inspector-padding-right-${this.hash}" style="width: ${domInspectorPaddingRight.width}; height: ${domInspectorPaddingRight.height}; top: ${domInspectorPaddingRight.top}; left: ${domInspectorPaddingRight.left};"></div>
            <div class="dom-inspector-padding-${this.hash} dom-inspector-padding-bottom-${this.hash}" style="width: ${domInspectorPaddingBottom.width}; height: ${domInspectorPaddingBottom.height}; top: ${domInspectorPaddingBottom.top}; left: ${domInspectorPaddingBottom.left};"></div>
            <div class="dom-inspector-padding-${this.hash} dom-inspector-padding-left-${this.hash}" style="width: ${domInspectorPaddingLeft.width}; height: ${domInspectorPaddingLeft.height}; top: ${domInspectorPaddingLeft.top}; left: ${domInspectorPaddingLeft.left};"></div>
            <div class="dom-inspector-border-${this.hash} dom-inspector-border-top-${this.hash}" style="width: ${domInspectorBorderTop.width}; height: ${domInspectorBorderTop.height}; top: ${domInspectorBorderTop.top}; left: ${domInspectorBorderTop.left};"></div>
            <div class="dom-inspector-border-${this.hash} dom-inspector-border-right-${this.hash}" style="width: ${domInspectorBorderRight.width}; height: ${domInspectorBorderRight.height}; top: ${domInspectorBorderRight.top}; left: ${domInspectorBorderRight.left};"></div>
            <div class="dom-inspector-border-${this.hash} dom-inspector-border-bottom-${this.hash}" style="width: ${domInspectorBorderBottom.width}; height: ${domInspectorBorderBottom.height}; top: ${domInspectorBorderBottom.top}; left: ${domInspectorBorderBottom.left};"></div>
            <div class="dom-inspector-border-${this.hash} dom-inspector-border-left-${this.hash}" style="width: ${domInspectorBorderLeft.width}; height: ${domInspectorBorderLeft.height}; top: ${domInspectorBorderLeft.top}; left: ${domInspectorBorderLeft.left};"></div>
            <div class="dom-inspector-margin-${this.hash} dom-inspector-margin-top-${this.hash}" style="width: ${domInspectorMarginTop.width}; height: ${domInspectorMarginTop.height}; top: ${domInspectorMarginTop.top}; left: ${domInspectorMarginTop.left};"></div>
            <div class="dom-inspector-margin-${this.hash} dom-inspector-margin-right-${this.hash}" style="width: ${domInspectorMarginRight.width}; height: ${domInspectorMarginRight.height}; top: ${domInspectorMarginRight.top}; left: ${domInspectorMarginRight.left};"></div>
            <div class="dom-inspector-margin-${this.hash} dom-inspector-margin-bottom-${this.hash}" style="width:${domInspectorMarginBottom.width}; height: ${domInspectorMarginBottom.height}; top: ${domInspectorMarginBottom.top}; left: ${domInspectorMarginBottom.left}"></div>
            <div class="dom-inspector-margin-${this.hash} dom-inspector-margin-left-${this.hash}" style="width: ${domInspectorMarginLeft.width}; height: ${domInspectorMarginLeft.height}; top: ${domInspectorMarginLeft.top}; left: ${domInspectorMarginLeft.left};"></div>
        </div>`
        return template
    }

    createTips(data: OverlayData): string {
        const { id, tagName, classNames, size, style, left, tipsClass } = data
        const template = `<div class="tips-${this.hash} ${tipsClass}" style="${style} ;left: ${left};   z-index: ${this.zIndex + 1};">
            <div class="tips-tag-${this.hash}">${tagName}</div>
            <div class="tips-id-${this.hash}">${id}</div>
            <div class="tips-class-${this.hash}">${classNames}</div>
            <div class="tips-line-${this.hash}"> | </div>
            <div class="tips-size-${this.hash}">${size}</div>
            <div class="tips-triangle-${this.hash}"></div>
        </div>`
        return template
    }

    createWrap(content: string): string {
        const template = `<div style="z-index: ${this.zIndex}" class="dom-inspector-wrapper-${this.hash}">${content}</div>`
        return template
    }

    defineTemplate(): (data: OverlayData) => string {
        return (data: OverlayData) => {
            const template = this.createWrap(this.createInspector(data) + this.createTips(data))
            return template
        }
    }

    render(templateFn: (data: OverlayData) => string, data: OverlayData): string {
        return templateFn(data)
    }

    getInspectorData(elementInfo: ElementInfo): InspectorData {
        const getHeight = partial(getBoxModelHeight, elementInfo)
        const getWidth = partial(getBoxModelWidth, elementInfo)

        const contentLevel = {
            width: getWidth('content'),
            height: getHeight('content'),
        }

        const paddingLevel = {
            width: getWidth('padding'),
            height: getHeight('padding'),
        }
        const borderLevel = {
            width: getWidth('border'),
            height: getHeight('border'),
        }

        const marginLevel = {
            width: getWidth('margin'),
            height: getHeight('margin'),
        }

        const getTop = partial(calcTop, elementInfo)
        const getLeft = partial(calcLeft, elementInfo)

        let inspectorData: InspectorData

        if (elementInfo.isSVG) {
            inspectorData = {
                domInspector: {
                    width: `${contentLevel.width}px`,
                    height: `${contentLevel.height}px`,
                    top: `${elementInfo.top}px`,
                    left: `${elementInfo.left}px`,
                },
                domInspectorContent: {
                    width: `${contentLevel.width}px`,
                    height: `${contentLevel.height}px`,
                    top: '0px',
                    left: '0px',
                },
            } as InspectorData
            const keyList = [
                'domInspectorPaddingTop',
                'domInspectorPaddingBottom',
                'domInspectorPaddingLeft',
                'domInspectorPaddingRight',
                'domInspectorBorderTop',
                'domInspectorBorderBottom',
                'domInspectorBorderLeft',
                'domInspectorBorderRight',
                'domInspectorMarginTop',
                'domInspectorMarginBottom',
                'domInspectorMarginLeft',
                'domInspectorMarginRight',
            ] as const
            keyList.forEach((key) => {
                inspectorData[key] = {
                    width: '0px',
                    height: '0px',
                    top: '0px',
                    left: '0px',
                }
            })
        } else {
            inspectorData = {
                domInspector: {
                    width: `${marginLevel.width}px`,
                    height: `${marginLevel.height}px`,
                    top: `${elementInfo.top}px`,
                    left: `${elementInfo.left}px`,
                },
                domInspectorContent: {
                    width: `${contentLevel.width}px`,
                    height: `${contentLevel.height}px`,
                    top: getTop('contentHeight'),
                    left: getLeft('contentWidth'),
                },
                domInspectorPaddingTop: {
                    width: `${paddingLevel.width}px`,
                    height: `${elementInfo.paddingTop}px`,
                    top: getTop('paddingTop'),
                    left: getLeft('paddingLeft'),
                },
                domInspectorPaddingBottom: {
                    width: `${paddingLevel.width - elementInfo.paddingRight}px`,
                    height: `${elementInfo.paddingBottom}px`,
                    top: getTop('paddingBottom'),
                    left: getLeft('paddingLeft'),
                },
                domInspectorPaddingLeft: {
                    width: `${elementInfo.paddingLeft}px`,
                    height: `${
                        paddingLevel.height - elementInfo.paddingTop - elementInfo.paddingBottom
                    }px`,
                    top: getTop('contentHeight'),
                    left: getLeft('paddingLeft'),
                },
                domInspectorPaddingRight: {
                    width: `${elementInfo.paddingRight}px`,
                    height: `${paddingLevel.height - elementInfo.paddingTop}px`,
                    top: getTop('contentHeight'),
                    left: getLeft('paddingRight'),
                },
                domInspectorBorderTop: {
                    width: `${borderLevel.width}px`,
                    height: `${elementInfo.borderTopWidth}px`,
                    top: getTop('borderTopWidth'),
                    left: getLeft('borderLeftWidth'),
                },
                domInspectorBorderBottom: {
                    width: `${borderLevel.width - elementInfo.borderRightWidth}px`,
                    height: `${elementInfo.borderBottomWidth}px`,
                    top: getTop('borderBottomWidth'),
                    left: getLeft('borderLeftWidth'),
                },
                domInspectorBorderLeft: {
                    width: `${elementInfo.borderLeftWidth}px`,
                    height: `${
                        borderLevel.height -
                        elementInfo.borderTopWidth -
                        elementInfo.borderBottomWidth
                    }px`,
                    top: getTop('paddingTop'),
                    left: getLeft('borderLeftWidth'),
                },
                domInspectorBorderRight: {
                    width: `${elementInfo.borderRightWidth}px`,
                    height: `${borderLevel.height - elementInfo.borderTopWidth}px`,
                    top: getTop('paddingTop'),
                    left: getLeft('borderRightWidth'),
                },
                domInspectorMarginTop: {
                    width: `${marginLevel.width}px`,
                    height: `${elementInfo.marginTop}px`,
                    top: getTop('marginTop'),
                    left: getLeft('marginLeft'),
                },
                domInspectorMarginBottom: {
                    width: `${marginLevel.width - elementInfo.marginRight}px`,
                    height: `${elementInfo.marginBottom}px`,
                    top: getTop('marginBottom'),
                    left: getLeft('marginLeft'),
                },
                domInspectorMarginLeft: {
                    width: `${elementInfo.marginLeft}px`,
                    height: `${
                        marginLevel.height - elementInfo.marginTop - elementInfo.marginBottom
                    }px`,
                    top: getTop('borderTopWidth'),
                    left: getLeft('marginLeft'),
                },
                domInspectorMarginRight: {
                    width: `${elementInfo.marginRight}px`,
                    height: `${marginLevel.height - elementInfo.marginTop}px`,
                    top: getTop('borderTopWidth'),
                    left: getLeft('marginRight'),
                },
            }
        }

        return inspectorData
    }

    getTipsData(elementInfo: ElementInfo): TipsData {
        const getHeight = partial(getBoxModelHeight, elementInfo)
        const getWidth = partial(getBoxModelWidth, elementInfo)

        const tipsData = {
            id: elementInfo.id ? `#${elementInfo.id}` : '',
            tagName: elementInfo.tagName.toLowerCase(),
            classNames: [...elementInfo.classList].map((className) => `.${className}`).join(''),
            size: `${getWidth('border')}x${getHeight('border')}`,
            tipsClass: '',
            style: '',
            left: '0px',
        } as TipsData

        let tipsTop = 0
        const tipsHeight = 24
        const triangleHeight = 8

        // 如果元素可以显示在tip下方
        if (elementInfo.top >= tipsHeight + triangleHeight) {
            tipsTop = elementInfo.top - tipsHeight - triangleHeight
            // 使用bottom替代top是防止tips内容有多行时，定位展示的位置不准确
            tipsData.style = `bottom:${elementInfo['bottom'] + getHeight('margin') + triangleHeight}px;`
        } else {
            tipsTop = getBoxModelHeight(elementInfo, 'margin') + elementInfo.top + triangleHeight
            tipsData.tipsClass = `reverse-${this.hash}`
            tipsData.style = `top:${tipsTop}px;`
        }
        tipsData.left = `${elementInfo.left}px`
        return tipsData
    }

    getData(elementInfo: ElementInfo): OverlayData {
        const data: OverlayData = {
            ...this.getInspectorData(elementInfo),
            ...this.getTipsData(elementInfo),
        }

        return data
    }

    create(ele: DOMElement) {
        const elementInfo = getElementInfo(ele)
        const data = this.getData(elementInfo)
        let fragment
        const fragmentCache = this.#cacheMap.get(ele)

        if (fragmentCache) {
            fragment = fragmentCache
        } else {
            fragment = this.render(this.defineTemplate(), data)
            if (this.cache) {
                this.#cacheMap.set(ele, fragment)
            }
        }

        const options = {
            target: ele,
            elementInfo,
            data,
            fragment,
        }
        this.pluginManager.hooks.beforeCreateOverlay.call(this, options)
        this.fragments += options.fragment
        this.pluginManager.hooks.afterCreateOverlay.call(this)
    }

    mount() {
        this.pluginManager.hooks.beforeMountOverlay.call(this)
        const dom = document.createRange().createContextualFragment(this.fragments)
        this.fragments = ''
        this.container?.appendChild(dom)
        this.pluginManager.hooks.afterMountOverlay.call(this)
    }
}

export default Overlay
