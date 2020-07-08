import React from 'react';
import { renderToString } from 'react-dom/server';
import prism from "./utils/prism";
import escapeHtml from "escape-html";
import normalizeHtml from "./utils/normalizeHtml.js";
import htmlToPlain from "./utils/htmlToPlain.js";
import selectionRange from "./utils/selection-range.js";
import { getIndent, getDeindentLevel } from "./utils/getIndent";
import { FORBIDDEN_KEYS } from "./utils/constant";
import themes from './utils/themes'
import languages from './utils/languages'
import plugins from './utils/plugins'
import 'clipboard'
import 'prismjs/plugins/toolbar/prism-toolbar.css'
// import 'prismjs/plugins/line-numbers/prism-line-numbers.css'

const addCssParent = (parentSelector, cssStr) => {
    cssStr = cssStr.replace(/:not\(pre\) > code\[class\*="language-"\]/g, `${parentSelector} not(pre)code`)
    cssStr = cssStr.replace(/\.language-css \.token\.string/g, `${parentSelector} language-token`)
    cssStr = cssStr.replace(/\.style \.token\.string/g, `${parentSelector} style.string`)
    const keyArray = ['code\\[class\\*="language"\\]', 'code\\[class\\*="language-"\\]', 'pre\\[class\\*="language-"\\]', '\\.token\\.']
    keyArray.forEach(item => {
        const name = item.replace(/\\/g, '')
        cssStr = cssStr.replace(new RegExp(item, 'g'), `${parentSelector} ${name}`)
    })
    cssStr = cssStr.replace(new RegExp(`not\\(pre\\)code`, 'g'), ':not(pre) > code[class*="language-"]')
    cssStr = cssStr.replace(new RegExp(`language-token`, 'g'), '.language-css .token.string')
    cssStr = cssStr.replace(new RegExp(`style\\.string`, 'g'), '.style .token.string')
    return cssStr
}

const themesCss = {}
themes.forEach(({ title, srcName }) => {
    themesCss[title] = require(`!!raw-loader!prismjs/themes/${srcName}.css`).default
})

const languagesJs = {}
Array.from(new Set(languages.map(item => item.value))).forEach(item => {
    languagesJs[item] = require(`!!raw-loader!prismjs/components/prism-${['html', 'vue', 'angular', 'xml'].includes(item) ? 'markup' : item}.min.js`).default
})

const pluginsJs = {}
// const pluginsCss = []
Array.from(new Set(plugins.map(item => item.value))).forEach(item => {
    pluginsJs[item] = require(`!!raw-loader!prismjs/plugins/${item}/prism-${item}.min.js`).default
    // pluginsCss.push(require(`!!raw-loader!prismjs/plugins/${item}/prism-${item}.js`).default)
})

const prismJs = require(`!!raw-loader!prismjs/prism.js`).default




class Editor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            lineNumbersHeight: '20px',
            selection: undefined,
            codeData: '',
            content: ''
        }
    }


    handleClick(evt) {
        this.undoTimestamp = 0
        this.selection = selectionRange(this.pre);
    }
    getPlain() {
        if (this._innerHTML === this.pre.innerHTML) {
            return this._plain;
        }
        const plain = htmlToPlain(normalizeHtml(this.pre.innerHTML));
        this._innerHTML = this.pre.innerHTML;
        this._plain = plain;

        return this._plain;
    }

    undoStack = []
    undoOffset = 0
    lastPos = 0
    undoTimestamp = 0
    composing = false

    recordChange(plain, selection) {
        if (plain === this.undoStack[this.undoStack.length - 1]) {
            return;
        }

        if (this.undoOffset > 0) {
            this.undoStack = this.undoStack.slice(0, -this.undoOffset);
            this.undoOffset = 0;
        }

        const timestamp = Date.now();
        const record = { plain, selection };

        // Overwrite last record if threshold is not crossed
        if (timestamp - this.undoTimestamp < 3000) {
            this.undoStack[this.undoStack.length - 1] = record;
        } else {
            this.undoStack.push(record);

            if (this.undoStack.length > 50) {
                this.undoStack.shift();
            }
        }

        this.undoTimestamp = timestamp;
    }

    restoreStackState(offset) {
        console.log(this.undoStack)
        const { plain, selection } = this.undoStack[
            this.undoStack.length - 1 - offset
        ];

        this.selection = selection;
        this.undoOffset = offset;
        this.updateContent(plain);
    }
    undo() {
        const offset = this.undoOffset + 1;
        if (offset >= this.undoStack.length) {
            return;
        }
        this.restoreStackState(offset);
    }
    redo() {
        const offset = this.undoOffset - 1;
        if (offset < 0) {
            return;
        }

        this.restoreStackState(offset);
    }
    handleKeyDown(evt) {
        if (evt.keyCode === 9 && !this.ignoreTabKey) {
            document.execCommand("insertHTML", false, "  ");
            evt.preventDefault();
        } else if (evt.keyCode === 8) {
            // Backspace Key
            const { start: cursorPos, end: cursorEndPos } = selectionRange(
                this.pre
            );
            if (cursorPos !== cursorEndPos) {
                return; // Bail on selections
            }

            const deindent = getDeindentLevel(this.pre.innerText, cursorPos);
            if (deindent <= 0) {
                return; // Bail when deindent level defaults to 0
            }

            // Delete chars `deindent` times
            for (let i = 0; i < deindent; i++) {
                document.execCommand("delete", false);
            }

            evt.preventDefault();
        } else if (evt.keyCode === 13) {
            // Enter Key
            const { start: cursorPos } = selectionRange(this.pre);
            const indentation = getIndent(this.pre.innerText, cursorPos);

            // https://stackoverflow.com/questions/35585421
            // add a space and remove it. it works :/
            document.execCommand("insertHTML", false, "\n " + indentation);
            document.execCommand("delete", false);

            evt.preventDefault();
        } else if (
            // Undo / Redo
            evt.keyCode === 90 &&
            evt.metaKey !== evt.ctrlKey &&
            !evt.altKey
        ) {
            if (evt.shiftKey) {
                this.redo();
            } else {
                this.undo();
            }

            evt.preventDefault();
        }
    }
    handleKeyUp(evt) {
        const keyupCode = evt.which;
        if (this.composing) {
            if (keyupCode === 13) {
                // finish inputting via IM.
                this.composing = false;
            } else {
                // now inputting words using IM.
                // must not update view.
                return;
            }
        }

        if (!this.code) {
            this.codeData = evt.target.innerText;
        }

        // if (this.emitEvents) {
        //     this.$emit("keyup", evt);
        // }
        if (
            evt.keyCode === 91 || // left cmd
            evt.keyCode === 93 || // right cmd
            evt.ctrlKey ||
            evt.metaKey
        ) {
            return;
        }

        // Enter key
        if (evt.keyCode === 13) {
            this.undoTimestamp = 0;
        }

        this.selection = selectionRange(this.pre);

        if (!Object.values(FORBIDDEN_KEYS).includes(evt.keyCode)) {
            const plain = this.getPlain();

            this.recordChange(plain, this.selection);
            this.updateContent(plain);
        } else {
            this.undoTimestamp = 0;
        }
    }

    getContent(codeData, language) {
        return prism(this.Prism, codeData || "", language);
    }

    onPaste = e => {
        e.preventDefault();
        const currentCursorPos = selectionRange(this.pre);

        // get text representation of clipboard
        var text = (e.originalEvent || e).clipboardData.getData("Text");
        // insert text manually
        document.execCommand("insertHTML", false, escapeHtml(text));

        const newCursorPos = currentCursorPos.end + text.length;
        this.selection = { start: newCursorPos, end: newCursorPos };

        const plain = this.getPlain();
        this.recordChange(plain, this.selection);
        this.updateContent(plain);
        this.styleLineNumbers();
    }

    componentWillUnmount() {
        this.pre.removeEventListener("paste", this.onPaste);
    }

    componentWillUpdate(nextProps, nextState) {
        if (this.props.code !== nextProps.code || this.props.language !== nextProps.language) {
            this.setPrismStyle(nextProps)
        }
        if (this.props.theme !== nextProps.theme) {
            this.setThemeStyle(nextProps.theme)
            this.setState({}, this.styleLineNumbers)
        }
    }

    componentDidMount() {
        // document.addEventListener('DOMContentLoaded',()=>{
        //     console.log('DOMContentLoaded')
        // })
        // const event = new CustomEvent("DOMContentLoaded", {
        //     detail: {
        //       hazcheeseburger: true
        //     }
        //   })
        // setInterval(() => {
        //     document.dispatchEvent(event)
        // }, 1000);
        this.setThemeStyle(this.props.theme)
        this.setPrismScript()
        this.setPluginsScript()
        //php等语言需要先引入这个
        this.setLanguageScript('markup-templating')

        this.Prism = window.Prism
        this.setPrismStyle(this.props)
        this.recordChange(this.getPlain());



        this.undoTimestamp = 0; // Reset timestamp
        const $pre = this.pre;
        $pre.addEventListener("paste", this.onPaste);

        $pre.addEventListener("compositionstart", () => {
            this.composing = true;
        });
        $pre.addEventListener("compositionend", () => {
            // for canceling input.
            this.composing = false;
        });
    }

    componentWillUnmount() {
        this.addedDomNames.forEach(domName => {
            this[domName] && document.body.removeChild(this[domName])
        })
    }

    updateContent(plain) {
        const { changeCode } = this.props
        if (changeCode) {
            changeCode(plain)
        }
        this.setState({
            codeData: plain || '',
            content: this.getContent(plain, this.props.language)
        }, () => {
            const container = this.pre.parentNode
            //去掉 toolbar
            container.className = container.className.replace(/code-toolbar/g, '')
            const toolbar = container.querySelector('.toolbar')
            toolbar && container.removeChild(toolbar)

            //重新执行Prism的complete操作，linenumber,toobar等插件都在complete里挂载了回调方法
            this.Prism.hooks.run('complete', { code: plain, element: this.pre.querySelector('code') })
            // this.setPrismScript()
            // this.setLanguageScript(this.props.language)
            // this.setPluginsScript()
        })
        // }, () => this.styleLineNumbers()) 

    }

    addedDomNames = []

    addElement(type, name, content) {
        const domName = `${name}-${type}-dom`
        if (this[domName] || window[domName]) {
            return
            //script必须每次通过appendChild的方式才会重新执行，所以先要remove掉
            document.body.removeChild(this[domName])
        } else {
            this.addedDomNames.push(`${name}${type}Dom`)
        }
        window[domName] = true
        this[domName] = document.createElement(type)
        this[domName].id = domName
        this[domName].innerHTML = content
        document.body.appendChild(this[domName])
    }

    setPrismStyle(props, notSetState) {
        // debugger
        // this.Prism = null
        // this.setPrismScript()
        this.setLanguageScript(props.language)

        // const event = new CustomEvent("DOMContentLoaded", {
        //     detail: {
        //         hazcheeseburger: true
        //     }
        // })
        // document.dispatchEvent(event)
        // setInterval(() => {
        //     
        // }, 1000);
        // 
        this.setState({
            codeData: props.code || '',
            content: this.getContent(props.code, props.language)
        }, () => {
            this.Prism.hooks.run('complete', { code: this.state.codeData, element: this.pre.querySelector('code') })
            // this.styleLineNumbers()
        })

    }

    setThemeStyle(theme) {
        this.addElement('style', theme, addCssParent(`.module-theme-${theme}`, themesCss[theme]))
    }

    setPrismScript() {
        this.addElement('script', 'prism', prismJs)
    }

    setPluginsScript() {
        Array.from(new Set(plugins.map(item => item.value))).forEach(item => {
            this.addElement('script', item, pluginsJs[item])
        })
    }


    setLanguageScript(language) {
        this.addElement('script', `${language}-language`, languagesJs[language])
        // this.Prism.language = window.Prism.language
        // console.log(this.Prism)

    }

    componentDidUpdate() {
        if (this.selection) {
            selectionRange(this.pre, this.selection);
        }
    }

    getLineNumbers() {
        let totalLines = this.state.codeData.split(/\r\n|\n/).length;
        // TODO: Find a better way of doing this - ignore last line break (os spesific etc.)
        if (this.state.codeData.endsWith("\n")) {
            totalLines--;
        }
        const lineNumbers = []
        for (let i = 0; i < totalLines; i++) {
            lineNumbers.push(i)
        }
        return lineNumbers
    }

    deletePx = (str = '') => parseInt(str.split('px')[0])

    styleLineNumbers() {
        // clearTimeout(this.timeout)
        // if (this.props.lineNumber) {
        //     this.timeout = setTimeout(() => {
        //         const lineNumbers = this.getLineNumbers()
        //         const reactLineNumbers = lineNumbers.map((item, i) => <span key={i} />)
        //         const $editor = this.pre;
        //         const $code = $editor.querySelector('code')
        //         const editorStyles = window.getComputedStyle($editor);
        //         let $lineNumbers = $code.querySelector('.line-numbers-rows')
        //         if (!$lineNumbers) {
        //             $lineNumbers = document.createElement('div')
        //             $code.appendChild($lineNumbers)
        //             $lineNumbers.className = "line-numbers-rows"
        //             const btlr = "border-top-left-radius";
        //             const bblr = "border-bottom-left-radius";
        //             $lineNumbers.style[btlr] = editorStyles[btlr];
        //             $lineNumbers.style[bblr] = editorStyles[bblr];
        //             $editor.style[btlr] = 0;
        //             $editor.style[bblr] = 0;
        //             const stylesList = [
        //                 // "background-color",
        //                 "font-family",
        //                 "font-size",
        //                 "line-height",
        //                 // "padding-top",
        //                 // "padding-bottom",
        //             ];
        //             stylesList.forEach(style => {
        //                 $lineNumbers.style[style] = editorStyles[style];
        //             });
        //         }
        //         $lineNumbers.innerHTML = renderToString(reactLineNumbers)
        //         $editor.style['height'] = $lineNumbers.offsetHeight +
        //             // this.deletePx(editorStyles["padding-top"]) +
        //             // this.deletePx(editorStyles["padding-bottom"]) +
        //             // this.deletePx(editorStyles["border-top-width"]) +
        //             // this.deletePx(editorStyles["border-bottom-width"]) +
        //             'px'
        //     }, 20)
        // }

    }


    render() {
        const { language, readOnly, theme, lineNumber, clipboard } = this.props
        const { content, lineNumbersHeight } = this.state
        return <div className={`module-prism-editor-container module-theme-${theme}`}>
            {/* {lineNumber && <div
                className="line-numbers-container"
                ref={ref => this.lineNumbersDom = ref}
            >
                {lineNumbers.map((item, i) => <span
                    key={i}
                // style={{ height: 'calc(100)' }}
                />)}
            </div>} */}
            <pre
                className={`language-${language} ${lineNumber ? 'line-numbers' : ''} copy-to-clipboard show-language`}
                ref={ref => this.pre = ref}
                style={{ marginTop: 0 }}
                dangerouslySetInnerHTML={{ __html: content }}
                contentEditable={!readOnly}
                onKeyDown={this.handleKeyDown.bind(this)}
                onKeyUp={this.handleKeyUp.bind(this)}
                onClick={this.handleClick.bind(this)}
                spellCheck="false"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                data-gramm="false"
            />
            <style>{addCssParent(`.module-theme-${theme}`, require(`!!raw-loader!prismjs/plugins/line-numbers/prism-line-numbers.css`).default)}</style>
            {/* <style key={theme}>{addCssParent(`.module-theme-${theme}`, themesCss[theme])}</style> */}

            {/* <style>{`
            .module-prism-editor-container pre[class*="language-"].line-numbers {
                position: relative;
                padding-left: 3.8em;
                counter-reset: linenumber;
            }
            
            .module-prism-editor-container pre[class*="language-"].line-numbers > code {
                position: relative;
                white-space: inherit;
            }
            
            .module-prism-editor-container .line-numbers .line-numbers-rows {
                position: absolute;
                pointer-events: none;
                top: 0;
                font-size: 100%;
                left: -3.8em;
                width: 3em; 
                letter-spacing: -1px;
                border-right: 1px solid #999;
            
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            
            }
            
            .module-prism-editor-container .line-numbers-rows > span {
                pointer-events: none;
                display: block;
                counter-increment: linenumber;
             }
        
            .module-prism-editor-container .line-numbers-rows > span:before {
                content: counter(linenumber);
                color: #999;
                display: block;
                padding-right: 0.8em;
                text-align: right;
            }
            `}</style> */}
        </div >
    }
}


export default Editor;
