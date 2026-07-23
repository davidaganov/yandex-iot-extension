const fs = require("fs")
const path = require("path")

const root = path.join(__dirname, "..")
const css = fs
  .readFileSync(path.join(root, "content", "tweak.css"), "utf8")
  .replace(/\r\n/g, "\n")
  .trim()
const js = fs
  .readFileSync(path.join(root, "content", "tweak.js"), "utf8")
  .replace(/\r\n/g, "\n")
  .trim()

const REPO = "https://github.com/davidaganov/yandex-iot-extension"
const RAW = "https://raw.githubusercontent.com/davidaganov/yandex-iot-extension/main"

const header = `// ==UserScript==
// @name         Умный дом
// @namespace    ${REPO}
// @version      1.0.0
// @description  Компактный UI для yandex.ru/iot.
// @author       davidaganov
// @license      MIT
// @homepageURL  ${REPO}
// @supportURL   ${REPO}/issues
// @icon         ${RAW}/icons/icon128.png
// @downloadURL  ${RAW}/userscript/yandex-iot.user.js
// @updateURL    ${RAW}/userscript/yandex-iot.user.js
// @match        https://yandex.ru/iot*
// @match        https://yandex.com/iot*
// @run-at       document-start
// @grant        none
// ==/UserScript==
`

const body = `
;(() => {
  const STYLE_ID = "yandex-iot-extension-tweaks"
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = ${JSON.stringify(css + "\n")}
    ;(document.documentElement || document.head || document.body)?.appendChild(style)
  }
})()

${js}
`

const out = path.join(root, "userscript", "yandex-iot.user.js")
fs.mkdirSync(path.dirname(out), { recursive: true })
fs.writeFileSync(out, header + body, "utf8")
console.log("wrote", out)
