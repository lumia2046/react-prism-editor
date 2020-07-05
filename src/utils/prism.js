import escapeHtml from "escape-html";
import Prism from 'prismjs'

// const Prism = window.Prism

function wrap(code, lang, langPrism) {
  if (lang === "text") {
    code = escapeHtml(code);
  }
  return `<code class="language-${langPrism}">${code}</code>`;
}

export default (str, lang) => {
  if (!lang) {
    return wrap(str, "text", "text");
  }
  lang = lang.toLowerCase();
  const rawLang = lang;
  if (Prism.languages[lang]) {
    // var myEvent = new Event('DOMContentLoaded');
    // window.dispatchEvent(myEvent)
    // console.log(Prism)
    const code = Prism.highlight(str, Prism.languages[lang], lang);
    console.log(code)
    // Prism.highlightAll()
    // {highlightedCode}
    
    return wrap(code, rawLang, lang);
  }
  return wrap(str, "text", "text");
};
