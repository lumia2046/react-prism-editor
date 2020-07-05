import React from 'react';
import prism from "./utils/prism";
import escapeHtml from "escape-html";
import normalizeHtml from "./utils/normalizeHtml.js";
import htmlToPlain from "./utils/htmlToPlain.js";
import selectionRange from "./utils/selection-range.js";
import { getIndent, getDeindentLevel } from "./utils/getIndent";
import { FORBIDDEN_KEYS } from "./utils/constant";
import themes from './utils/themes'



const themesCss = {}

themes.forEach(({ title, srcName }) => {
    themesCss[title] = require(`!!raw-loader!prismjs/themes/${srcName}.css`).default
})


class Editor extends React.Component {
    constructor(props) {
        super(props)
        const { code, language } = props
        this.state = {
            lineNumbersHeight: '20px',
            selection: undefined,
            codeData: code,
            content: this.getContent(code, language)
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
    updateContent(plain) {
        const { changeCode } = this.props
        changeCode(plain)
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
        return prism(codeData || "", language);
    }

    componentDidMount() {
        this.recordChange(this.getPlain());
        this.undoTimestamp = 0; // Reset timestamp
        this.styleLineNumbers();


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
            this.setState({
                codeData: nextProps.code || '',
                content: this.getContent(nextProps.code, nextProps.language)
            }, () => this.styleLineNumbers())
        }
        if (this.props.theme !== nextProps.theme) {
            this.setState({}, this.styleLineNumbers)
        }
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

    styleLineNumbers() {
        if (this.props.lineNumber) {
            const $editor = this.pre;
            const $lineNumbers = this.lineNumbersDom
            const editorStyles = window.getComputedStyle($editor);
            const lineStyles = window.getComputedStyle($lineNumbers);
            const btlr = "border-top-left-radius";
            const bblr = "border-bottom-left-radius";
            $lineNumbers.style[btlr] = editorStyles[btlr];
            $lineNumbers.style[bblr] = editorStyles[bblr];
            $editor.style[btlr] = 0;
            $editor.style[bblr] = 0;
            $lineNumbers.style['margin-top'] = editorStyles['padding-top'];
            const stylesList = [
                // "background-color",
                "font-family",
                "font-size",
                "line-height"
            ];

            stylesList.forEach(style => {
                $lineNumbers.style[style] = editorStyles[style];
            });
            $editor.style["height"] = lineStyles['height']
        }
    }


    render() {
        const { language, readOnly, theme, lineNumber, clipboard } = this.props
        const { content, lineNumbersHeight } = this.state
        const lineNumbers = this.getLineNumbers()
        return <div style={{ position: 'relative' }}>
            {lineNumber && <div
                className="line-numbers-container"
                ref={ref => this.lineNumbersDom = ref}
            >
                {lineNumbers.map((item, i) => <span
                    key={i}
                    style={{ height: 24 }}
                />)}
            </div>}
            <pre
                className={`language-${language} ${false ? 'line-numbers' : ''} ${clipboard ? 'copy-to-clipboard' : ''}`}
                style={{ paddingLeft: '3em' }}
                ref={ref => this.pre = ref}
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
            <style key={theme}>{themesCss[theme]}</style>
            <style>{`
            .line-numbers-container {
                position:absolute;
                pointer-events: none;
                font-size: 100%;
                z-index:1;
                width: 2.5em; /* works for line-numbers below 1000 lines */
                letter-spacing: -1px;
                border-right: 1px solid #999;
                user-select: none;
            }
            
            .line-numbers-container > span {
                pointer-events: none;
                display: block;
                counter-increment: linenumber;
            }
            
            .line-numbers-container > span:before {
                content: counter(linenumber);
                color: #999;
                display: block;
                padding-right: 0.8em;
                text-align: right;
            }
            `}</style>
        </div >
    }
}


export default Editor;
