import escapeHtml from "escape-html";
// import 'prismjs'




function wrap(code, lang, langPrism) {
  if (lang === "text") {
    code = escapeHtml(code);
  }
  return `<code class="language-${langPrism}">${code}</code>`;
}

export default (Prism, str, lang) => {
  // const Prism = window.Prism
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
    // console.log(code)
    // Prism.highlightAll()
    // {highlightedCode}

    return wrap(code, rawLang, lang);
  }
  return wrap(str, "text", "text");
};
