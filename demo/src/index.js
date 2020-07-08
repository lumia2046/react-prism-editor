import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';



ReactDOM.render(<div>
    <header style={{ textAlign: 'center' }}>
        <div>
            <h1>React Prism Code Editor</h1>
            <h3>
                A dead simple code editor with syntax highlighting and line numbers.
        </h3>
        </div>
        <div style={{ padding: 10 }}>
            Documentation on
        <a href="https://github.com/lumia2046/react-prism-editor">Github</a>
        </div>
    </header>
    <main>
        <App
            language='json'
            theme='default'
            lineNumber={true}
            readOnly={true}
            code={`<html><body>Welcome <?php echo $_POST["name"]; ?><br>Your e111111111111111111111111111111111111111111111111111111mail address is: <?php echo $_POST["email"]; ?></body></html>`}
        />
        <App
            language='php'
            theme='coy'
            lineNumber={true}
            readOnly={true}
            code={`<html>
                    <body>
                    Welcome <?php echo $_POST["name"]; ?><br>
                    Your email address is: <?php echo $_POST["email"]; ?>
                    </body>
                  </html>`}
        />
    </main>
</div >, document.querySelector('#demo'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
