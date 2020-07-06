import React from 'react';
import Editor from '../../src'
// import Editor from '../disk/main'
import themes from '../../src/utils/themes'
import languages from '../../src/utils/languages'



class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language: 'json',
      theme: 'default',
      lineNumber: true,
      readOnly: true,
      code: `<html>
      <body>
      
      Welcome <?php echo $_POST["name"]; ?><br>
      Your email address is: <?php echo $_POST["email"]; ?>
      
      </body>
      </html>
      `
    }
  }


  render() {
    const { lineNumber, readOnly, code, theme, language } = this.state
    return <div>
      <header style={{ textAlign: 'center' }}>
        <div>
          <h1>React Prism Code Editor</h1>
          <h3>
            A dead simple code editor with syntax highlighting and line numbers.
          </h3>
        </div>
        <div>
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
            <select style={{marginLeft:5}} value={theme} onChange={e => this.setState({ theme: e.target.value })}>
              {themes.map(({ title }, i) =>
                <option key={i} value={title}>{title}</option>
              )}
            </select>
          </span>
          <span>
            Language
            <select style={{marginLeft:5}} value={language} onChange={e => this.setState({ language: e.target.value })}>
              {languages.map(({ title, value }, i) =>
                <option key={i} value={value}>{title}</option>
              )}
            </select>
          </span>

        </div>
        <div style={{padding:10}}>
          Documentation on
          <a href="https://github.com/lumia2046/react-prism-editor">Github</a>
        </div>
      </header>
      <main>
        <Editor
          key={lineNumber}
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
      </main>
      <Editor
          key={lineNumber}
          language={'php'}
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
