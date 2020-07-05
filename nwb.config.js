module.exports = {
  type: 'react-component',
  npm: {
    esModules: true,
    umd: false
  },
  babel: {
    plugins: [
      [
        "prismjs",
        {
          "languages": [
            "javascript",
            "json",
            "jsx",
            "tsx",
            "typescript",
            "markup",
            "html",
            "css",
            "sass",
            "xml",
            "java",
            "php",
            "csharp",
            "c",
            "cpp",
            "sql"
          ],
          "plugins": [
            "line-numbers",
            "show-language",
            "copy-to-clipboard",
            "custom-class"
          ],
          "css": true
        }
      ]]
  }
}
