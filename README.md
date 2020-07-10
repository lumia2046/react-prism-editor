# React Prism Editor


> A dead simple code editor with theme,syntax highlighting,line numbers.

## Demo

[react-prism-editor](https://lumia2046.github.io/react-prism-editor/)


## Features
- Theme
- Copy to dashboard
- Code Editing ^^
- Syntax highlighting
- Undo / Redo
- Copy / Paste
- The spaces/tabs of the previous line is preserved when a new line is added
- Works on mobile (thanks to contenteditable)
- Resize to parent width and height
- Support for line numbers
- Support for autosizing the editor
- Autostyling the linenumbers 

## Install

```sh
npm install react-prism-editor
```

or

```sh
yarn add react-prism-editor
```

## Usage



```js
import ReactPrismEditor from "react-prism-editor";

<ReactPrismEditor
  language={language}
  theme={theme}
  code={code}
  lineNumber={lineNumber}
  readOnly={readOnly}
  clipboard={true}
  changeCode={code => {
    this.code = code
    console.log(code)
  }}
/>


```
## Props

| Name                 | Type      | Default | Options                              | Description                                      |
| -------------------- | --------- | ------- | ------------------------------------ | ------------------------------------------------ |
| code                 | `string`  | `""`    | -                                    |  the code                                        |
| language             | `String`  |`"javascript"`| `json,javascript,jsx,tsx,typescript`<br>`html,vue,angular,css,sass,markup`<br>`java,php,csharp,c,cpp,sql,xml` | language of the code |
| lineNumbers          | `Boolean` | `false` | -                                    | Whether to show line numbers or not              |
| readonly             | `Boolean` | `false` | -                                    | Indicates if the editor is read only or not      |               
| clipboard            | `Boolean` | `false` | -                                    | Whether to show clipboard or not                 |
| showLanguage         | `Boolean` | `false` | -                                    | Whether to show language or not                  |



## Events

| Name       | Parameters | Description                     |
| ---------- | ---------- | ------------------------------- |
| changeCode | `(code)`   | Fires when the code is changed. |


## Thanks

inspired by [react-live](https://github.com/FormidableLabs/react-live).

## License

MIT