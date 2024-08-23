// getComputedStyle获取的transform的scale，通一转成类似transform: "matrix(0.5, 0, 0, 0.5, 0, 0)"的形式。

function extractParameters(prop: string, value?: any) {
    const regex = new RegExp(`${prop}\\(([^)]+)\\)`)
    const match = value.match(regex)

    if (match) {
        const params = match[1].split(',').map((param: any) => parseFloat(param.trim()))
        return params
    }

    return [1, 1]
}

const oldGetComputedStyle = window.getComputedStyle

window.getComputedStyle = (ele: Element) => {
    const computedStyle = oldGetComputedStyle(ele)
    const getPropertyValue = computedStyle.getPropertyValue.bind(computedStyle)

    return new Proxy(computedStyle, {
        get(target, prop) {
            if (prop === 'getPropertyValue') {
                return getPropertyValue
            }

            const value = Reflect.get(target, prop, computedStyle)

            if (prop === 'transform' && !value.startsWith('matrix')) {
                if (value.startsWith('scaleX')) {
                    const res = extractParameters('scaleX', value)
                    return `matrix(${res[1]}, 0, 0, 1, 0, 0)`
                } else if (value.startsWith('scaleY')) {
                    const res = extractParameters('scaleY', value)
                    return `matrix(1, 0, 0, ${res[1]}, 0, 0)`
                } else if (value.startsWith('scale')) {
                    const res = extractParameters('scale', value)
                    return `matrix(${res[0]}, 0, 0, ${res[1] || res[0]}, 0, 0)`
                } else {
                    return value
                }
            }
            return value
        },
    })
}
