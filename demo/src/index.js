import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';



ReactDOM.render(<div>
   <header style={{ textAlign: 'center' }}>
      <div>
         <h1>React Prism Code Editor</h1>
         <h3>
            A dead simple code editor with theme、 syntax highlighting 、 line numbers.
        </h3>
      </div>
      <div style={{ padding: 10 }}>
         Documentation on
        <a href="https://github.com/lumia2046/react-prism-editor" style={{ marginLeft: 10 }}>Github</a>
      </div>
   </header>
   <main>
      <App
         language='jsx'
         theme='default'
         lineNumber={true}
         readOnly={true}
         code={`import React from 'react';
import Editor from 'react-prism-editor'

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      language:'jsx',
      theme:'default',
      lineNumber:true,
      readOnly:true,
      code:''
    }
  }


  render() {
    const { lineNumber, readOnly, code, theme, language } = this.state
    return <Editor
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
  }
}

export default App;
            `}
      />
      <App
         language='php'
         theme='coy'
         lineNumber={true}
         readOnly={true}
         code={`<?php
// 定义变量并默认设置为空值
$nameErr = $emailErr = $genderErr = $websiteErr = "";
$name = $email = $gender = $comment = $website = "";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
   if (empty($_POST["name"])) {
      $nameErr = "Name is required";
      } else {
         $name = test_input($_POST["name"]);
         // 检测名字是否只包含字母跟空格
         if (!preg_match("/^[a-zA-Z ]*$/",$name)) {
         $nameErr = "只允许字母和空格"; 
         }
     }
   
   if (empty($_POST["email"])) {
      $emailErr = "Email is required";
   } else {
      $email = test_input($_POST["email"]);
      // 检测邮箱是否合法
      if (!preg_match("/([\w\-]+\@[\w\-]+\.[\w\-]+)/",$email)) {
         $emailErr = "非法邮箱格式"; 
      }
   }
     
   if (empty($_POST["website"])) {
      $website = "";
   } else {
      $website = test_input($_POST["website"]);
      // 检测 URL 地址是否合法
     if (!preg_match("/\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]/i",$website)) {
         $websiteErr = "非法的 URL 的地址"; 
      }
   }

   if (empty($_POST["comment"])) {
      $comment = "";
   } else {
      $comment = test_input($_POST["comment"]);
   }

   if (empty($_POST["gender"])) {
      $genderErr = "性别是必需的";
   } else {
      $gender = test_input($_POST["gender"]);
   }
}
?>`}
      />
   </main>
</div >, document.querySelector('#demo'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
