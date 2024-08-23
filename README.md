<div align="center">

# Highlight-DOM

<p>

![node](https://img.shields.io/badge/node->=18-brightgreen.svg)
![npm](https://img.shields.io/badge/pnpm-8.12.1-blue.svg)
![MIT License](https://img.shields.io/badge/license-MIT-brightgreen.svg)
![download](https://img.shields.io/npm/dw/@ifreeovo/highlight-dom)
![github action](https://github.com/IFreeOvO/highlight-dom/actions/workflows/deploy.yml/badge.svg)

</p>

<p align="center">
<a href="./README_en.md">English</a> |
<a href="./README.md">简体中文</a>
</p>

实现类似chrome-devtools元素选择器的高亮效果

<img src='./screenshots/sample.png'>
</div>

## Demo

[在线使用](https://ifreeovo.github.io/highlight-dom/)

## 📦 安装

```bash
npm install @ifreeovo/highlight-dom
```

```bash
yarn add @ifreeovo/highlight-dom
```

```bash
pnpm add @ifreeovo/highlight-dom
```

## 📖 用法

通过es-module方式使用

```js
import { HighlightDOM } from '@ifreeovo/highlight-dom'

const highlightDOM = new HighlightDOM()
highlightDOM.highlight(document.querySelector('#app'))
```

通过cdn方式使用

```html
<!-- index.html -->
<div id="app"></div>

<script src="https://unpkg.com/@ifreeovo/highlight-dom"></script>
<script>
    const highlightDOM = new __HD__.HighlightDom()
    highlightDOM.highlight(document.querySelector('#app'))
</script>
```

## HighlightDOM构造参数

```ts
{
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
```

## HighlightDOM实例方法

```ts
// 注册插件
registerPlugin(plugin: Plugin):void

// 重置高亮(将会移除界面上的overlay节点，并中断overlay绘制任务)
reset(): void

// 获取hash
getHash(): string

// 获取overlay的zIndex
getZIndex(): string
```

## 插件用法

- 生命周期

```ts
'beforeHighlight',
'beforeInitOverlay',
'generateCss',
'afterInitOverlay',
'beforeCreateOverlay',
'afterCreateOverlay',
'beforeMountOverlay',
'afterMountOverlay',
'afterHighlight',
```

- 插件示例 **(\_\_tests\_\_/plugin.test.ts文件里有类似的测试案例)**

1. 实现自定义样式的插件

```html
<div
    id="simple"
    style="
        width: 50px;
        height: 50px;
        padding: 50px;
        margin: 50px;
        border: 50px solid #333;
        "
>
    标准
</div>
```

```ts
import { HighlightDOM } from '@ifreeovo/highlight-dom'
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

const targetElement = document.querySelector('#simple')
HD.highlight(targetElement)
```

内置样式参考。建议在`beforeInitOverlay`钩子里进行修改

```ts
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
```

2. 实现跳过某些dom的高亮

```html
<div style="width: 100px: height:1000px;">
    <span style="width:32px;height:22px">1</span>
    <div id="simple" style="width:514px;height:22px">2</div>
    <svg style="width:100px;height:100px" class="svg-3">
        <rect fill="red" style="width:100px;height:100px;padding: 10px;margin:10px" />
    </svg>
    <div style="width:50px;height:22px">4</div>
</div>
```

```ts
import { HighlightDOM, ModeEnum } from '@ifreeovo/highlight-dom'

HD = new HighlightDom({
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

const targetElement = document.querySelector('#simple')
HD.highlight(targetElement)
```
