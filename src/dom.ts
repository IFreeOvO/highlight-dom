import { partial } from 'radash'
interface BaseStyle {
    width: string
    height: string
}

export type DOMElement = HTMLElement | SVGElement

type Position = 'top' | 'bottom' | 'left' | 'right'

type BoxModelLevel = 'content' | 'padding' | 'border' | 'margin'

export interface InlineStyle extends BaseStyle {
    left: string
    top: string
}

export interface ElementInfo {
    borderTopWidth: number
    borderRightWidth: number
    borderBottomWidth: number
    borderLeftWidth: number
    marginTop: number
    marginRight: number
    marginBottom: number
    marginLeft: number
    paddingTop: number
    paddingRight: number
    paddingBottom: number
    paddingLeft: number
    contentWidth: number
    contentHeight: number
    top: number
    left: number
    bottom: number
    tagName: string
    id: string
    classList: string[]
    isSVG: boolean
}

export type ElementInfoKey = keyof ElementInfo

export function isElementNode(ele: EventTarget): ele is DOMElement {
    return isHTMLElement(ele) || isSVG(ele)
}

export function isHTMLElement(ele: EventTarget): ele is HTMLElement {
    return ele instanceof HTMLElement
}

export function isSVG(ele: EventTarget): ele is SVGElement {
    return ele instanceof SVGElement
}

export function isVisibleElementNode(ele: EventTarget): boolean {
    return (
        isElementNode(ele) &&
        window.getComputedStyle(ele).display !== 'none' &&
        isElementInViewport(ele)
    )
}

export function getOffsetHeight(ele: DOMElement): number {
    const { scaleY } = getScale(ele)
    const { height } = ele.getBoundingClientRect()
    return isSVG(ele) ? height : ele.offsetHeight * scaleY
}

export function getOffsetWidth(ele: DOMElement): number {
    const { scaleX } = getScale(ele)
    const { width } = ele.getBoundingClientRect()
    return isSVG(ele) ? width : ele.offsetWidth * scaleX
}

export function isElementInViewport(ele: DOMElement): boolean {
    const { left, right, top, bottom } = ele.getBoundingClientRect()

    const eleWidth = getOffsetWidth(ele)
    const eleHeight = getOffsetHeight(ele)

    const res =
        top >= -eleHeight &&
        left >= -eleWidth &&
        bottom <= window.innerHeight + eleHeight &&
        right <= window.innerWidth + eleWidth
    return res
}

export function $(selector: string, parent?: Element): Element | null {
    if (parent && isElementNode(parent)) {
        return parent.querySelector(selector)
    }
    return document.querySelector(selector)
}

export function removeDom(ele?: Element) {
    if (ele) {
        ele.remove()
    }
}

export function getMaxZIndex(): number {
    return Array.from(document.querySelectorAll('*')).reduce((r, e) => {
        let zIndex = Number(window.getComputedStyle(e).zIndex)
        zIndex = Number.isNaN(zIndex) ? 0 : zIndex
        return Math.max(r, zIndex)
    }, 0)
}

/**
 * @example
 * 例如'<div class="a-1 a-2"></div>'，匹配结果为'class="a-1 a-2"'
 */
export function matchClassAttribute(text: string): RegExpMatchArray | null {
    const reg = /class=["'](\s?[\w-]+\s*)+["']/g
    return text.match(reg)
}

/**
 * @example
 * 例如class="a-1 a-2"，提取结果为"['a-1', 'a-2']"
 */
export function extractClassNames(text: string): Array<string> {
    const classValue = text.replace('class=', '')
    const classNames = classValue.replace(/["']/g, '').trim().replace(/\s+/g, ' ').split(' ')
    return classNames
}

export function getScale(ele: DOMElement): { scaleX: number; scaleY: number } {
    const regex = /([0-9.]+)/g
    const { transform } = window.getComputedStyle(ele)

    if (!transform.startsWith('matrix')) {
        return {
            scaleX: 1,
            scaleY: 1,
        }
    }
    const [scaleX, , , scaleY] = Array.from(transform.replace(/matrix(3d)?/, '').match(regex) ?? [])
    return {
        scaleX: Number(scaleX),
        scaleY: Number(scaleY),
    }
}

/**
 * @remarks
 * 需要注意：
 * 如果svg加了margin属性，位置应该不受影响
 */
function getPosition(position: Position, ele: DOMElement): number {
    let res = 0
    const computedStyle = window.getComputedStyle(ele)
    const pos = ele.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth
    const { scaleX, scaleY } = getScale(ele)
    const positionValue = pos[position]

    if (isSVG(ele)) {
        res = positionValue
        switch (position) {
            case 'left':
            case 'top':
                res = positionValue
                break
            case 'bottom':
            case 'right':
                res = viewportHeight - positionValue
                break
        }
    } else {
        switch (position) {
            case 'left':
                res =
                    positionValue -
                    parseFloat(computedStyle.getPropertyValue(`margin-${position}`) || '0') * scaleX
                break
            case 'top':
                res =
                    positionValue -
                    parseFloat(computedStyle.getPropertyValue(`margin-${position}`) || '0') * scaleY
                break
            case 'bottom':
                res =
                    viewportHeight -
                    positionValue -
                    parseFloat(computedStyle.getPropertyValue(`margin-${position}`) || '0') * scaleY
                break
            case 'right':
                res =
                    viewportWidth -
                    positionValue -
                    parseFloat(computedStyle.getPropertyValue(`margin-${position}`) || '0') * scaleX
                break
        }
    }
    return res
}

const getEleLeft = partial(getPosition, 'left' as Position)

const getEleTop = partial(getPosition, 'top' as Position)

const getEleBottom = partial(getPosition, 'bottom' as Position)

export function getElementInfo(ele: DOMElement): ElementInfo {
    const elementInfo = {} as ElementInfo

    const attributeList = [
        'borderTopWidth',
        'borderRightWidth',
        'borderBottomWidth',
        'borderLeftWidth',
        'marginTop',
        'marginRight',
        'marginBottom',
        'marginLeft',
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
    ] as const

    const { scaleX, scaleY } = getScale(ele)
    const computedStyle = window.getComputedStyle(ele)
    attributeList.forEach((attributeName) => {
        const attributeValue = computedStyle[attributeName].replace('px', '')
        if (attributeName.includes('Top') || attributeName.includes('Bottom')) {
            elementInfo[attributeName] = (parseFloat(attributeValue) || 0) * scaleY
        } else if (attributeName.includes('Left') || attributeName.includes('Right')) {
            elementInfo[attributeName] = (parseFloat(attributeValue) || 0) * scaleX
        } else {
            elementInfo[attributeName] = parseFloat(attributeValue) || 0
        }
    })

    const { width, height } = ele.getBoundingClientRect()
    const contentWidth = isSVG(ele)
        ? width
        : getOffsetWidth(ele) -
          elementInfo.borderLeftWidth -
          elementInfo.borderRightWidth -
          elementInfo.paddingLeft -
          elementInfo.paddingRight

    const contentHeight = isSVG(ele)
        ? height
        : getOffsetHeight(ele) -
          elementInfo.borderTopWidth -
          elementInfo.borderBottomWidth -
          elementInfo.paddingTop -
          elementInfo.paddingBottom

    Object.assign(elementInfo, {
        contentWidth: contentWidth,
        contentHeight: contentHeight,
        top: getEleTop(ele),
        left: getEleLeft(ele),
        bottom: getEleBottom(ele),
        id: ele.id,
        tagName: ele.tagName,
        classList: ele.classList,
        isSVG: isSVG(ele),
    })
    return elementInfo
}

/**
 * @remarks 元素水平方向上dom宽度的结构顺序
 */
const horizontalOrder = [
    'marginLeft',
    'borderLeftWidth',
    'paddingLeft',
    'contentWidth',
    'paddingRight',
    'borderRightWidth',
    'marginRight',
] as const

/**
 * @remarks 元素垂直方向上dom宽度的结构顺序
 */
const verticalOrder = [
    'marginTop',
    'borderTopWidth',
    'paddingTop',
    'contentHeight',
    'paddingBottom',
    'borderBottomWidth',
    'marginBottom',
] as const

/**
 * @example
 * 例如currentSide传入'padding-top'，那么距离为verticalOrder数组里，padding-top前两项'margin-top'、'border-top-width'的高度相加
 */
export function calcTop(
    elementInfo: ElementInfo,
    currentSide: (typeof verticalOrder)[number],
): `${string}px` {
    const index = verticalOrder.findIndex((side) => side === currentSide)
    const restOrder = verticalOrder.slice(0, index)
    if (restOrder.length === 0) {
        return '0px'
    }
    const top = restOrder.reduce((sum, side) => sum + elementInfo[side], 0)
    return `${top}px`
}

/**
 * @example
 * 例如currentSide传入'padding-left'，那么距离为horizontalOrder数组里，paddingLeft前两项'marginLeft'、'borderLeftWidth'的宽度相加
 */
export function calcLeft(
    elementInfo: ElementInfo,
    currentSide: (typeof horizontalOrder)[number],
): `${string}px` {
    const index = horizontalOrder.findIndex((side) => side === currentSide)
    const restOrder = horizontalOrder.slice(0, index)
    if (restOrder.length === 0) {
        return '0px'
    }
    const left = restOrder.reduce((sum, side) => sum + elementInfo[side], 0)
    return `${left}px`
}

/**
 * @example
 * 例如boxModel传入'padding'，则在verticalOrder数据中找到以padding开头和结尾的那一段数组，即['paddingTop','contentHeight','paddingBottom']，
 * 然后对数组里的这些值，进行累加算出模型高度
 * @remarks
 * 需要注意svg模型高度不受padding、border、margin影响
 */
export function getBoxModelHeight(elementInfo: ElementInfo, boxModel: BoxModelLevel): number {
    if (elementInfo.isSVG) {
        return elementInfo.contentHeight
    }
    const startIndex = verticalOrder.findIndex((side) => side.startsWith(boxModel))
    const endIndex = verticalOrder.findLastIndex((side) => side.startsWith(boxModel))
    const calcOrder = verticalOrder.slice(startIndex, endIndex + 1)

    const height = calcOrder.reduce((sum, side) => sum + elementInfo[side], 0)
    return height
}

/**
 * @example
 * 例如boxModel传入'padding'，则在horizontalOrder数据中找到以padding开头和结尾的那一段数组，即['paddingLeft','contentWidth','paddingRight']，
 * 然后对数组里的这些值，进行累加算出模型宽度
 * @remarks
 * 需要注意svg模型宽度不受padding、border、margin影响
 */
export function getBoxModelWidth(elementInfo: ElementInfo, boxModel: BoxModelLevel): number {
    if (elementInfo.isSVG) {
        return elementInfo.contentWidth
    }
    const startIndex = horizontalOrder.findIndex((side) => side.startsWith(boxModel))
    const endIndex = horizontalOrder.findLastIndex((side) => side.startsWith(boxModel))
    const calcOrder = horizontalOrder.slice(startIndex, endIndex + 1)

    const width = calcOrder.reduce((sum, side) => sum + elementInfo[side], 0)
    return width
}
