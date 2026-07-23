// ==UserScript==
// @name         Умный дом
// @namespace    https://github.com/davidaganov/yandex-iot-extension
// @version      1.0.0
// @description  Компактный UI для yandex.ru/iot.
// @author       davidaganov
// @license      MIT
// @homepageURL  https://github.com/davidaganov/yandex-iot-extension
// @supportURL   https://github.com/davidaganov/yandex-iot-extension/issues
// @icon         https://raw.githubusercontent.com/davidaganov/yandex-iot-extension/main/icons/icon128.png
// @downloadURL  https://raw.githubusercontent.com/davidaganov/yandex-iot-extension/main/userscript/yandex-iot.user.js
// @updateURL    https://raw.githubusercontent.com/davidaganov/yandex-iot-extension/main/userscript/yandex-iot.user.js
// @match        https://yandex.ru/iot*
// @match        https://yandex.com/iot*
// @run-at       document-start
// @grant        none
// ==/UserScript==

;(() => {
  const STYLE_ID = "yandex-iot-extension-tweaks"
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style")
    style.id = STYLE_ID
    style.textContent = ".home-household-layout-iot {\n  --home__header-height: 0px !important;\n  --home__header-activity-bar-height: 0px !important;\n}\n\n.home-household-layout-iot__head,\n.home-household-layout-iot__head-background,\n.home-household-layout-iot__promo-shutter,\n.home-household-layout-iot__head-visibility-marker,\n.home-adfox-banner,\n.home-adfox-banner__banner,\n.iot-news-notifications-carousel,\n.iot-news-notification,\n.iot-news-notifications__item,\n.iot-news-promo-section,\n.iot-news-promo-section__stack,\n.iot-news-all__anchor,\n.iot-news-all-categories,\n.iot-news-all__tab-wrapper,\n.promo__stories,\n.promo-tile,\n.story-tile,\n.story-promo-tile,\n.stories-promo__item,\n.stories-grid,\n.stories-grid2,\n.stories-grid__item,\n.stories-grid2__item,\n.stories-grid__cell,\n.stories-grid__row,\n.story-modal,\n.alice-pro-banner,\n.alice-pro-gifts-notification,\n.alice-personalized-notification,\n.in-app-notifications-stack {\n  display: none !important;\n}\n\n.home-activity-bar-novelty-button {\n  display: none !important;\n}\n\nhtml.iot-ext-hide-alice .home-tabbar__alice-button,\nhtml.iot-ext-hide-alice .home-tabbar-alice-button,\n#home-tabbar___home-tabbar_id_catalog,\n#home-tabbar___home-tabbar_id_stories {\n  display: none !important;\n}\n\n.home-tabbar__tabs {\n  display: flex !important;\n  justify-content: space-evenly !important;\n  align-items: stretch !important;\n}\n\n#home-tabbar___home-tabbar_id_household {\n  order: 1;\n}\n\n.home-tabbar__alice-button,\n.home-tabbar-alice-button {\n  order: 2;\n}\n\n#home-tabbar___home-tabbar_id_scenarios {\n  order: 3;\n}\n\n.home-filters,\n.home-filters .home-filters__filters,\n.home-filters .horizontal-wrapper {\n  overscroll-behavior-x: contain;\n  cursor: grab;\n  user-select: none;\n  -webkit-user-select: none;\n}\n\n.home-filters.iot-ext-dragging,\n.home-filters.iot-ext-dragging * {\n  cursor: grabbing !important;\n}\n\n.iot-ext-header-actions {\n  display: flex;\n  align-items: center;\n  margin-inline-start: auto;\n  gap: 0;\n  flex-shrink: 0;\n}\n\n.iot-ext-header-actions [data-iot-ext-proxy],\n.iot-ext-header-actions [data-iot-ext-alice-toggle] {\n  flex-shrink: 0;\n  width: 40px !important;\n  height: 40px !important;\n  min-width: 40px !important;\n  max-width: 40px !important;\n  padding: 8px !important;\n  box-sizing: border-box !important;\n  display: inline-flex !important;\n  align-items: center !important;\n  justify-content: center !important;\n  border-radius: 0 !important;\n  background: transparent !important;\n}\n\n.iot-ext-header-actions [data-iot-ext-proxy] .icon,\n.iot-ext-header-actions [data-iot-ext-alice-toggle] .icon {\n  --icon-size: 1.5rem !important;\n  width: 1.5rem !important;\n  height: 1.5rem !important;\n}\n\n.iot-ext-header-actions [data-iot-ext-alice-toggle][aria-pressed=\"false\"] {\n  opacity: 0.35;\n}\n\n.iot-ext-header-actions [data-iot-ext-alice-toggle][aria-pressed=\"true\"] {\n  opacity: 1;\n}\n\n.bottom-sheet__container {\n  padding-top: 24px !important;\n}\n\n.ssr-bottom-sheet__container {\n  padding-top: 24px !important;\n  box-sizing: border-box;\n}\n"
    ;(document.documentElement || document.head || document.body)?.appendChild(style)
  }
})()

;(() => {
  const LABELS = ["Будильники", "История событий"]
  const ALICE_STORAGE_KEY = "yandex-iot-compact.showAlice"

  const isAliceVisible = () => {
    try {
      return localStorage.getItem(ALICE_STORAGE_KEY) === "1"
    } catch {
      return false
    }
  }

  const setAliceVisible = (visible) => {
    try {
      localStorage.setItem(ALICE_STORAGE_KEY, visible ? "1" : "0")
    } catch {
      /* ignore quota / private mode */
    }
  }

  const applyAliceVisibility = () => {
    document.documentElement.classList.toggle("iot-ext-hide-alice", !isAliceVisible())
  }

  const findOriginal = (label) => {
    return document.querySelector(
      `.home-activity-bar [aria-label="${label}"], .home-household-layout-iot__head [aria-label="${label}"]`
    )
  }

  const ensureActionsRow = (stickyRow) => {
    let actions = stickyRow.querySelector(":scope > .iot-ext-header-actions")
    if (actions) return actions

    const settings = stickyRow.querySelector('[aria-label="Настройки умного дома"]')
    const add = stickyRow.querySelector('[aria-label^="Добавить"]')
    if (!settings || !add) return null

    actions = document.createElement("div")
    actions.className = "iot-ext-header-actions"
    settings.replaceWith(actions)
    actions.appendChild(settings)
    actions.appendChild(add)
    return actions
  }

  const iconClassFrom = (original) => {
    const icon = original.querySelector(".icon")
    if (!icon) return null
    const typeClass = [...icon.classList].find((name) => name.startsWith("icon_type_"))
    return typeClass || null
  }

  const syncAliceToggleState = (button) => {
    const visible = isAliceVisible()
    button.setAttribute("aria-pressed", visible ? "true" : "false")
    button.setAttribute(
      "aria-label",
      visible ? "Скрыть Алису в нижнем меню" : "Показать Алису в нижнем меню"
    )
    button.title = visible ? "Включить Алису" : "Выключить Алису"
  }

  const ensureAliceToggle = (actions) => {
    let button = document.querySelector("[data-iot-ext-alice-toggle]")
    if (!button) {
      button = document.createElement("div")
      button.className =
        "active-area active-area_clickable icon-button box box_d_ib box_w_40 box_h_40 box_p_8"
      button.tabIndex = 0
      button.setAttribute("role", "button")
      button.setAttribute("data-iot-ext-alice-toggle", "1")

      const icon = document.createElement("div")
      icon.className = "box box_bg_btn-icon-primary icon icon_type_alice-smart__voice-icon"
      icon.style.setProperty("--icon-size", "1.5rem")
      button.appendChild(icon)

      const toggle = (event) => {
        event.preventDefault()
        event.stopPropagation()
        setAliceVisible(!isAliceVisible())
        applyAliceVisibility()
        syncAliceToggleState(button)
      }

      button.addEventListener("click", toggle, true)
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") toggle(event)
      })
    }

    const alarm = actions.querySelector(`[data-iot-ext-proxy="${CSS.escape(LABELS[0])}"]`)
    const settings = actions.querySelector('[aria-label="Настройки умного дома"]')
    const before = alarm || settings || actions.firstChild

    if (button.parentElement !== actions || (before && button.nextSibling !== before)) {
      actions.insertBefore(button, before)
    }

    syncAliceToggleState(button)
  }

  const buildProxyButton = (label, iconTypeClass) => {
    const button = document.createElement("div")
    button.className =
      "active-area active-area_clickable icon-button box box_d_ib box_w_40 box_h_40 box_p_8"
    button.tabIndex = 0
    button.setAttribute("role", "button")
    button.setAttribute("aria-label", label)
    button.setAttribute("data-iot-ext-proxy", label)

    const icon = document.createElement("div")
    icon.className = `box box_bg_btn-icon-primary icon ${iconTypeClass}`
    icon.style.setProperty("--icon-size", "1.5rem")
    button.appendChild(icon)

    const activate = (event) => {
      event.preventDefault()
      event.stopPropagation()
      findOriginal(label)?.click()
    }

    button.addEventListener("click", activate, true)
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") activate(event)
    })

    return button
  }

  const syncHeaderButtons = () => {
    const stickyRow = document.querySelector(
      ".home-household-sticky-bar-iot > .box_d_f, .home-household-sticky-bar-iot > .box"
    )
    if (!stickyRow) return

    const actions = ensureActionsRow(stickyRow)
    if (!actions) return

    actions
      .querySelectorAll(
        "[data-iot-ext-proxy].button-rounded-l, [data-iot-ext-proxy].home-activity-bar-button__active-area"
      )
      .forEach((node) => node.remove())

    const settings = actions.querySelector('[aria-label="Настройки умного дома"]')
    if (!settings) return

    for (const label of LABELS) {
      const original = findOriginal(label)
      let proxy = actions.querySelector(`[data-iot-ext-proxy="${CSS.escape(label)}"]`)

      if (!original) {
        proxy?.remove()
        continue
      }

      const iconTypeClass = iconClassFrom(original)
      if (!iconTypeClass) continue

      if (!proxy) {
        proxy = buildProxyButton(label, iconTypeClass)
        actions.insertBefore(proxy, settings)
      }
    }

    ensureAliceToggle(actions)
  }

  const findScrollable = (el) => {
    if (el.scrollWidth > el.clientWidth + 1) return el
    for (const child of el.querySelectorAll("*")) {
      if (child.scrollWidth > child.clientWidth + 1) return child
    }
    return el
  }

  const enableFiltersScroll = () => {
    document
      .querySelectorAll(".home-filters, .scroll-carousel.home-filters")
      .forEach((carousel) => {
        if (carousel.dataset.iotExtScroll === "1") return
        carousel.dataset.iotExtScroll = "1"

        carousel.addEventListener(
          "wheel",
          (event) => {
            if (event.ctrlKey) return

            const scroller = findScrollable(carousel)
            if (scroller.scrollWidth <= scroller.clientWidth + 1) return

            const delta =
              Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX
            if (!delta) return

            const maxScroll = scroller.scrollWidth - scroller.clientWidth
            const next = Math.min(maxScroll, Math.max(0, scroller.scrollLeft + delta))
            if (next === scroller.scrollLeft) return

            event.preventDefault()
            scroller.scrollLeft = next
          },
          { passive: false }
        )

        let dragging = false
        let dragged = false
        let startX = 0
        let startScroll = 0
        let activeScroller = null

        const onMove = (event) => {
          if (!dragging || !activeScroller) return
          const dx = event.clientX - startX
          if (Math.abs(dx) > 3) dragged = true
          activeScroller.scrollLeft = startScroll - dx
          event.preventDefault()
        }

        const onUp = (event) => {
          if (!dragging) return
          dragging = false
          carousel.classList.remove("iot-ext-dragging")
          window.removeEventListener("pointermove", onMove, true)
          window.removeEventListener("pointerup", onUp, true)
          window.removeEventListener("pointercancel", onUp, true)
          if (dragged) {
            event.preventDefault()
            event.stopPropagation()
            const blockClick = (clickEvent) => {
              clickEvent.preventDefault()
              clickEvent.stopPropagation()
              carousel.removeEventListener("click", blockClick, true)
            }
            carousel.addEventListener("click", blockClick, true)
          }
          activeScroller = null
        }

        carousel.addEventListener(
          "pointerdown",
          (event) => {
            if (event.button !== 0) return
            const scroller = findScrollable(carousel)
            if (scroller.scrollWidth <= scroller.clientWidth + 1) return

            dragging = true
            dragged = false
            startX = event.clientX
            startScroll = scroller.scrollLeft
            activeScroller = scroller
            carousel.classList.add("iot-ext-dragging")
            window.addEventListener("pointermove", onMove, true)
            window.addEventListener("pointerup", onUp, true)
            window.addEventListener("pointercancel", onUp, true)
          },
          true
        )
      })
  }

  applyAliceVisibility()

  const tick = () => {
    applyAliceVisibility()
    syncHeaderButtons()
    enableFiltersScroll()
  }

  tick()

  const observer = new MutationObserver(() => {
    tick()
  })

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  })
})()
