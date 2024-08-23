import { expect, describe, it, beforeAll, beforeEach } from 'vitest'
import flushPromises from 'flush-promises'
import { HighlightDom } from '../src/main'
import './polyfill'
import { ModeEnum } from '../src/highlight-dom'
import mockElement from './utils/mockElement'
import clearBody from './utils/clearBody'

describe('highlight a single element', () => {
    let HD: HighlightDom
    beforeAll(() => {
        HD = new HighlightDom({
            hash: 'abc',
        })
    })

    beforeEach(() => {
        clearBody()
        HD.reset()
    })

    it('a normal element', async () => {
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

        const hash = HD.getHash()
        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)
        expect(overlayElement?.querySelector(`.tips-size-${hash}`)?.textContent).toBe('250x250')

        expect(overlayElement).toMatchInlineSnapshot(`
          <div
            id="dom-inspector-container-abc"
            style="z-index: 1;"
          >
            <div
              class="dom-inspector-wrapper-abc"
              style="z-index: 1"
            >
              <div
                class="dom-inspector-abc"
                style="z-index: 1; width: 350px; height: 350px; top: 0px; left: 0px;"
              >
                
                      
                <div
                  class="dom-inspector-content-abc"
                  style="width: 50px; height: 50px; top: 150px; left: 150px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-top-abc"
                  style="width: 150px; height: 50px; top: 100px; left: 100px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-right-abc"
                  style="width: 50px; height: 100px; top: 150px; left: 200px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-bottom-abc"
                  style="width: 100px; height: 50px; top: 200px; left: 100px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-left-abc"
                  style="width: 50px; height: 50px; top: 150px; left: 100px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-top-abc"
                  style="width: 250px; height: 50px; top: 50px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-right-abc"
                  style="width: 50px; height: 200px; top: 100px; left: 250px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-bottom-abc"
                  style="width: 200px; height: 50px; top: 250px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-left-abc"
                  style="width: 50px; height: 150px; top: 100px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-top-abc"
                  style="width: 350px; height: 50px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-right-abc"
                  style="width: 50px; height: 300px; top: 50px; left: 300px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-bottom-abc"
                  style="width:300px; height: 50px; top: 300px; left: 0px"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-left-abc"
                  style="width: 50px; height: 250px; top: 50px; left: 0px;"
                />
                
                  
              </div>
              <div
                class="tips-abc reverse-abc"
                style="top:358px; ;left: 0px;   z-index: 2;"
              >
                
                      
                <div
                  class="tips-tag-abc"
                >
                  div
                </div>
                
                      
                <div
                  class="tips-id-abc"
                >
                  #simple
                </div>
                
                      
                <div
                  class="tips-class-abc"
                />
                
                      
                <div
                  class="tips-line-abc"
                >
                   | 
                </div>
                
                      
                <div
                  class="tips-size-abc"
                >
                  250x250
                </div>
                
                      
                <div
                  class="tips-triangle-abc"
                />
                
                  
              </div>
            </div>
          </div>
        `)
    })

    it('a border-box element', async () => {
        mockElement(`
            <div id="simple" 
                style="
                    width: 100px;
                    height: 100px;
                    padding: 50px;
                    border: 50px solid #333;
                    box-sizing: border-box;
                    background-color: yellow;
                    "
            >borderBox</div>
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)
        await flushPromises()

        const hash = HD.getHash()
        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)

        expect(overlayElement?.querySelector(`.tips-size-${hash}`)?.textContent).toBe('200x200')
        expect(overlayElement).toMatchInlineSnapshot(`
          <div
            id="dom-inspector-container-abc"
            style="z-index: 1;"
          >
            <div
              class="dom-inspector-wrapper-abc"
              style="z-index: 1"
            >
              <div
                class="dom-inspector-abc"
                style="z-index: 1; width: 200px; height: 200px; top: 0px; left: 0px;"
              >
                
                      
                <div
                  class="dom-inspector-content-abc"
                  style="width: 0px; height: 0px; top: 100px; left: 100px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-top-abc"
                  style="width: 100px; height: 50px; top: 50px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-right-abc"
                  style="width: 50px; height: 50px; top: 100px; left: 100px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-bottom-abc"
                  style="width: 50px; height: 50px; top: 100px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-left-abc"
                  style="width: 50px; height: 0px; top: 100px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-top-abc"
                  style="width: 200px; height: 50px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-right-abc"
                  style="width: 50px; height: 150px; top: 50px; left: 150px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-bottom-abc"
                  style="width: 150px; height: 50px; top: 150px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-left-abc"
                  style="width: 50px; height: 100px; top: 50px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-top-abc"
                  style="width: 200px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-right-abc"
                  style="width: 0px; height: 200px; top: 0px; left: 200px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-bottom-abc"
                  style="width:200px; height: 0px; top: 200px; left: 0px"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-left-abc"
                  style="width: 0px; height: 200px; top: 0px; left: 0px;"
                />
                
                  
              </div>
              <div
                class="tips-abc reverse-abc"
                style="top:208px; ;left: 0px;   z-index: 2;"
              >
                
                      
                <div
                  class="tips-tag-abc"
                >
                  div
                </div>
                
                      
                <div
                  class="tips-id-abc"
                >
                  #simple
                </div>
                
                      
                <div
                  class="tips-class-abc"
                />
                
                      
                <div
                  class="tips-line-abc"
                >
                   | 
                </div>
                
                      
                <div
                  class="tips-size-abc"
                >
                  200x200
                </div>
                
                      
                <div
                  class="tips-triangle-abc"
                />
                
                  
              </div>
            </div>
          </div>
        `)
    })

    it('a reduced element', async () => {
        mockElement(`
            <div id="simple" 
                style="
                    width: 40px;
                    height: 40px;
                    padding: 20px;
                    border: 20px solid green;
                    margin: 20px;
                    transform: scale(0.5);
                    "
            >缩小</div>
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)
        await flushPromises()

        const hash = HD.getHash()
        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)
        expect(overlayElement?.querySelector(`.tips-size-${hash}`)?.textContent).toBe('60x60')

        const contentOverlayRect = overlayElement
            ?.querySelector(`.dom-inspector-content-${hash}`)
            ?.getBoundingClientRect()
        expect(contentOverlayRect?.width).toBe(20)
        expect(contentOverlayRect?.height).toBe(20)

        expect(overlayElement).toMatchInlineSnapshot(`
          <div
            id="dom-inspector-container-abc"
            style="z-index: 1;"
          >
            <div
              class="dom-inspector-wrapper-abc"
              style="z-index: 1"
            >
              <div
                class="dom-inspector-abc"
                style="z-index: 1; width: 80px; height: 80px; top: 10px; left: 10px;"
              >
                
                      
                <div
                  class="dom-inspector-content-abc"
                  style="width: 20px; height: 20px; top: 30px; left: 30px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-top-abc"
                  style="width: 40px; height: 10px; top: 20px; left: 20px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-right-abc"
                  style="width: 10px; height: 30px; top: 30px; left: 50px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-bottom-abc"
                  style="width: 30px; height: 10px; top: 50px; left: 20px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-left-abc"
                  style="width: 10px; height: 20px; top: 30px; left: 20px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-top-abc"
                  style="width: 60px; height: 10px; top: 10px; left: 10px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-right-abc"
                  style="width: 10px; height: 50px; top: 20px; left: 60px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-bottom-abc"
                  style="width: 50px; height: 10px; top: 60px; left: 10px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-left-abc"
                  style="width: 10px; height: 40px; top: 20px; left: 10px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-top-abc"
                  style="width: 80px; height: 10px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-right-abc"
                  style="width: 10px; height: 70px; top: 10px; left: 70px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-bottom-abc"
                  style="width:70px; height: 10px; top: 70px; left: 0px"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-left-abc"
                  style="width: 10px; height: 60px; top: 10px; left: 0px;"
                />
                
                  
              </div>
              <div
                class="tips-abc reverse-abc"
                style="top:98px; ;left: 10px;   z-index: 2;"
              >
                
                      
                <div
                  class="tips-tag-abc"
                >
                  div
                </div>
                
                      
                <div
                  class="tips-id-abc"
                >
                  #simple
                </div>
                
                      
                <div
                  class="tips-class-abc"
                />
                
                      
                <div
                  class="tips-line-abc"
                >
                   | 
                </div>
                
                      
                <div
                  class="tips-size-abc"
                >
                  60x60
                </div>
                
                      
                <div
                  class="tips-triangle-abc"
                />
                
                  
              </div>
            </div>
          </div>
        `)
    })

    it('a svg element', async () => {
        mockElement(`
            <svg style="width:100px;height:100px" id="simple">
                <rect style="width:100px;height:100px" fill="red" style="padding: 10px;margin:10px" />
            </svg> 
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)
        await flushPromises()

        const hash = HD.getHash()
        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)
        expect(overlayElement?.querySelector(`.tips-size-${hash}`)?.textContent).toBe('100x100')

        expect(overlayElement).toMatchInlineSnapshot(`
          <div
            id="dom-inspector-container-abc"
            style="z-index: 1;"
          >
            <div
              class="dom-inspector-wrapper-abc"
              style="z-index: 1"
            >
              <div
                class="dom-inspector-abc"
                style="z-index: 1; width: 100px; height: 100px; top: 0px; left: 0px;"
              >
                
                      
                <div
                  class="dom-inspector-content-abc"
                  style="width: 100px; height: 100px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-top-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-right-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-bottom-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-padding-abc dom-inspector-padding-left-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-top-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-right-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-bottom-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-border-abc dom-inspector-border-left-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-top-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-right-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-bottom-abc"
                  style="width:0px; height: 0px; top: 0px; left: 0px"
                />
                
                      
                <div
                  class="dom-inspector-margin-abc dom-inspector-margin-left-abc"
                  style="width: 0px; height: 0px; top: 0px; left: 0px;"
                />
                
                  
              </div>
              <div
                class="tips-abc reverse-abc"
                style="top:108px; ;left: 0px;   z-index: 2;"
              >
                
                      
                <div
                  class="tips-tag-abc"
                >
                  svg
                </div>
                
                      
                <div
                  class="tips-id-abc"
                >
                  #simple
                </div>
                
                      
                <div
                  class="tips-class-abc"
                />
                
                      
                <div
                  class="tips-line-abc"
                >
                   | 
                </div>
                
                      
                <div
                  class="tips-size-abc"
                >
                  100x100
                </div>
                
                      
                <div
                  class="tips-triangle-abc"
                />
                
                  
              </div>
            </div>
          </div>
        `)
    })

    it('a hidden element', () => {
        mockElement(`
            <div id="simple"
                style="
                    width: 50px;
                    height: 50px;
                    display: none;
                    "
            >标准</div>
        `)

        const targetElement = document.querySelector('#simple')
        HD.highlight(targetElement)

        const hash = HD.getHash()
        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)
        expect(overlayElement).toBe(null)
    })
})

describe('highlight multiple elements', () => {
    let HD: HighlightDom
    beforeAll(() => {
        HD = new HighlightDom({
            hash: 'abc',
            mode: ModeEnum.Siblings,
        })
    })

    beforeEach(() => {
        clearBody()
        HD.reset()
    })

    it('multiple elements', async () => {
        mockElement(`
            <div style="width: 100px: height:1000px;">
                <span style="width:32px;height:22px">1</span>
                <div id="simple" style="width:514px;height:22px">2</div>
                <svg style="width:100px;height:100px" class="svg-3">
                    <rect  fill="red" style="width:100px;height:100px;padding: 10px;margin:10px" />
                </svg>
                <div style="width:514px;height:22px">4</div>
            </div>
        `)
        const targetElement = document.querySelector('#simple')

        HD.highlight(targetElement)
        await flushPromises()

        const hash = HD.getHash()
        const overlayElement = document.querySelector(`#dom-inspector-container-${hash}`)
        expect(overlayElement?.children.length).toBe(4)
    })
})
