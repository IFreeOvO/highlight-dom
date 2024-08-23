import { expect, describe, it, beforeEach } from 'vitest'
import flushPromises from 'flush-promises'
import { HighlightDom } from '../src/main'
import './polyfill'
import { styled } from '../src/overlay'
import { ModeEnum } from '../src/highlight-dom'
import mockElement from './utils/mockElement'
import clearBody from './utils/clearBody'

describe('test the functionality of the plugin', () => {
    let HD: HighlightDom
    const hash = 'abc'

    beforeEach(() => {
        clearBody()
        HD && HD.reset()
    })

    it('test the timing of hook triggers', async () => {
        const hookList: string[] = []
        HD = new HighlightDom({
            plugins: [
                {
                    name: 'test hooks',
                    hooks: {
                        beforeHighlight: () => {
                            hookList.push('beforeHighlight')
                        },
                        afterHighlight: () => {
                            hookList.push('afterHighlight')
                        },
                        beforeInitOverlay: () => {
                            hookList.push('beforeInitOverlay')
                        },
                        afterInitOverlay: () => {
                            hookList.push('afterInitOverlay')
                        },
                        beforeCreateOverlay: () => {
                            hookList.push('beforeCreateOverlay')
                        },
                        generateCss: () => {
                            hookList.push('generateCss')
                        },
                        afterCreateOverlay: () => {
                            hookList.push('afterCreateOverlay')
                        },
                        beforeMountOverlay: () => {
                            hookList.push('beforeMountOverlay')
                        },
                        afterMountOverlay: () => {
                            hookList.push('afterMountOverlay')
                        },
                        invalidate: () => {
                            hookList.push('invalid hook')
                        },
                    },
                },
            ],
        })
        mockElement(`
            <div id="simple" 
                style="
                    width: 50px;
                    height: 50px;
                    padding: 50px;
                    margin: 50px;
                    border: 50px solid #333;
                    "
            >标准</div>
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)
        await flushPromises()

        const hooks = [
            'beforeHighlight',
            'beforeInitOverlay',
            'generateCss',
            'afterInitOverlay',
            'beforeCreateOverlay',
            'afterCreateOverlay',
            'beforeMountOverlay',
            'afterMountOverlay',
            'afterHighlight',
        ]

        hooks.forEach((v, i) => {
            expect(hookList[i]).toBe(hooks[i])
        })
    })

    it('a plugin for customizing themes', async () => {
        HD = new HighlightDom({
            hash,
            plugins: [
                {
                    name: 'customizing themes',
                    hooks: {
                        beforeInitOverlay: (ctx) => {
                            // 样式替换
                            ctx.tipBackgroundColor = '#fff'
                            ctx.tipSizeColor = '#333'
                        },
                        generateCss: (ctx) => {
                            // 样式覆盖
                            ctx.style =
                                ctx.style +
                                styled`
                                    .dom-inspector-${ctx.hash} .dom-inspector-margin-${ctx.hash} {
                                        background-color: red;
                                    }
                                `
                        },
                    },
                },
            ],
        })
        mockElement(`
            <div id="simple" 
                style="
                    width: 50px;
                    height: 50px;
                    padding: 50px;
                    margin: 50px;
                    border: 50px solid #333;
                    "
            >标准</div>
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)
        await flushPromises()

        const overlayElement = document.querySelector(`.dom-inspector-margin-top-${hash}`)
        const { backgroundColor } = window.getComputedStyle(overlayElement!)
        expect(backgroundColor).toBe('red')

        const tipSizeElement = document.querySelector(`.tips-size-${hash}`)
        const { color } = window.getComputedStyle(tipSizeElement!)
        expect(color).toBe('#333')
    })

    it('a plugin for skipping the highlighting of certain elements', async () => {
        HD = new HighlightDom({
            hash,
            mode: ModeEnum.Siblings,
            plugins: [
                {
                    name: 'skip highlighting',
                    hooks: {
                        beforeCreateOverlay(ctx, options) {
                            // 跳过id为simple的dom
                            if (options.target.id === 'simple') {
                                options.fragment = ''
                            }
                        },
                    },
                },
            ],
        })
        mockElement(`
            <div style="width: 100px: height:1000px;">
                <span style="width:32px;height:22px">1</span>
                <div id="simple" style="width:514px;height:22px">2</div>
                <svg style="width:100px;height:100px" class="svg-3">
                    <rect  fill="red" style="width:100px;height:100px;padding: 10px;margin:10px" />
                </svg>
                <div style="width:50px;height:22px">4</div>
            </div>
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)
        await flushPromises()

        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)
        expect(overlayElement?.children.length).toBe(3)

        const tipsElements = document.querySelectorAll(`.tips-size-${hash}`)
        expect(tipsElements[0].textContent).toBe('32x22')
        expect(tipsElements[1].textContent).toBe('100x100')
        expect(tipsElements[2].textContent).toBe('50x22')
    })
})
