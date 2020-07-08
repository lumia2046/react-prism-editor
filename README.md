# React Prism Editor


> A dead simple code editor with theme、syntax highlighting 、line numbers.

## Demo

[prism-editor.netlify.com](https://prism-editor.netlify.com/)


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
import ReactPrismEditor from "vue-prism-editor";




```
## Props

| Name                 | Type      | Default | Options                              | Description                                           |
| -------------------- | --------- | ------- | ------------------------------------ | ----------------------------------------------------- |
| v-model              | `string`  | -       | -                                    | for the `code` prop below                             |
| code                 | `string`  | `""`    | -                                    | the code                                              |
| language             | `String`  | `"js"`  | `vue,html,md,ts` + Prismjs Languages | language of the code                                  |
| lineNumbers          | `Boolean` | `false` | -                                    | Whether to show line numbers or not                   |
| readonly             | `Boolean` | `false` | -                                    | Indicates if the editor is read only or not.          |
| emitEvents           | `Boolean` | `false` | -                                    | Indicates if the editor should emit events.           |
| autoStyleLineNumbers | `Boolean` | `true`  | -                                    | Allow the line number to be styled by this component. |

## Events

| Name   | Parameters | Description                     |
| ------ | ---------- | ------------------------------- |
| change | `(code)`   | Fires when the code is changed. |

The events below won't be fired unless you set the `emitEvents` prop to `true`.

| Name         | Parameters | Description                                                                 |
| ------------ | ---------- | --------------------------------------------------------------------------- |
| keydown      | `(event)`  | This event is emitted when a keydown event happens in editor                |
| keyup        | `(event)`  | This event is emitted when a keyup event happens in editor                  |
| editor-click | `(event)`  | This event is emitted  when clicking anywhere in the contenteditable editor |

## Thanks

inspired by [react-live](https://github.com/FormidableLabs/react-live).

## License

MIT