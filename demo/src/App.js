import React from 'react';
import Editor from '../../src'
// import Editor from '../disk/main'
import themes from '../../src/utils/themes'
import languages from '../../src/utils/languages'



class App extends React.Component {
  constructor(props) {
    super(props)
    const { lineNumber, readOnly, code, theme, language } = this.props
    this.state = {
      language,
      theme,
      lineNumber,
      readOnly,
      code
    }
  }


  render() {
    const { lineNumber, readOnly, code, theme, language } = this.state
    return <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 10 }}>
        <span style={{ marginRight: 10 }} onClick={e => this.setState({ lineNumber: !lineNumber })} >
          Line Numbers
            <input type="checkbox" name="ln" checked={lineNumber} onChange={() => { }} />
        </span>
        <span style={{ marginRight: 10 }} onClick={e => this.setState({ readOnly: !readOnly })}>
          Readonly
            <input type="checkbox" name="ln" checked={readOnly} onChange={() => { }} />
        </span>
        <span style={{ marginRight: 10 }}>
          Theme
            <select style={{ marginLeft: 5 }} value={theme} onChange={e => this.setState({ theme: e.target.value })}>
            {themes.map(({ title }, i) =>
              <option key={i} value={title}>{title}</option>
            )}
          </select>
        </span>
        <span>
          Language
          <select style={{ marginLeft: 5 }} value={language} onChange={e => this.setState({ language: e.target.value })}>
            {languages.map(({ title, value }, i) =>
              <option key={i} value={value}>{title}</option>
            )}
          </select>
        </span>
      </div>
      <Editor
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
    </div >
  }
}


export default App;
