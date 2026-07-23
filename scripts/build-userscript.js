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


const header = `// ==UserScript==
// @name         Умный дом (compact UI)
// @namespace    yandex-iot-compact
// @version      1.0.0
// @description  Компактный UI для yandex.ru/iot — те же правки, что в браузерном расширении из этого репозитория. Не связано с Яндексом.
// @author       yandex-iot
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
