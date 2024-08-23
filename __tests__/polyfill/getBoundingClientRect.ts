// happy-dom的getBoundingClientRect源码里永远返回0，所以模拟了一个临时实现

function toNumber(value = '') {
    const res = parseFloat(value)
    return Number.isNaN(res) ? 0 : res
}

function getStyle(style) {
    const boxSizing = style.boxSizing
    const width = toNumber(style.width)
    const height = toNumber(style.height)

    const borderLeft = toNumber(style.borderLeftWidth)
    const borderRight = toNumber(style.borderRightWidth)
    const borderTop = toNumber(style.borderTopWidth)
    const borderBottom = toNumber(style.borderBottomWidth)

    const paddingLeft = toNumber(style.paddingLeft)
    const paddingRight = toNumber(style.paddingRight)
    const paddingTop = toNumber(style.paddingTop)
    const paddingBottom = toNumber(style.paddingBottom)

    const offsetWidth =
        boxSizing === 'border-box'
            ? borderLeft + paddingLeft + paddingRight + borderRight
            : borderLeft + paddingLeft + width + paddingRight + borderRight

    const offsetHeight =
        boxSizing === 'border-box'
            ? borderTop + paddingTop + paddingBottom + borderBottom
            : borderTop + paddingTop + height + paddingBottom + borderBottom

    return {
        boxSizing,
        width,
        height,
        borderLeft,
        borderRight,
        borderTop,
        borderBottom,
        paddingLeft,
        paddingRight,
        paddingTop,
        paddingBottom,
        offsetWidth,
        offsetHeight,
    }
}

function getBoundingClientRect() {
    const { offsetWidth, offsetHeight } = getStyle(this.style)

    // 只考虑border-box和content-box的情况
    const domRect = {
        width: offsetWidth,
        height: offsetHeight,
        top: parseFloat(this.style.marginTop) || 0,
        left: parseFloat(this.style.marginLeft) || 0,
        bottom: parseFloat(this.style.marginBottom) || 0,
        right: parseFloat(this.style.marginRight) || 0,
    }
    return domRect
}

// @ts-expect-error 忽略类型报错
window.HTMLElement.prototype.getBoundingClientRect = getBoundingClientRect

// @ts-expect-error 忽略类型报错
window.SVGElement.prototype.getBoundingClientRect = getBoundingClientRect

Object.defineProperties(window.HTMLElement.prototype, {
    offsetWidth: {
        get() {
            const { offsetWidth } = getStyle(this.style)
            return offsetWidth
        },
    },
    offsetHeight: {
        get() {
            const { offsetHeight } = getStyle(this.style)
            return offsetHeight
        },
    },
    offsetTop: {
        get() {
            return parseFloat(this.style.marginTop) || 0
        },
    },
    offsetLeft: {
        get() {
            return parseFloat(this.style.marginLeft) || 0
        },
    },
})
