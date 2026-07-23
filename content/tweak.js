;(() => {
  const STYLE_ID = "yandex-iot-extension-tweaks"
  const LABELS = ["Будильники", "История событий"]

  const injectStyles = () => {
    if (document.getElementById(STYLE_ID)) return
    const link = document.createElement("link")
    link.id = STYLE_ID
    link.rel = "stylesheet"
    link.href = chrome.runtime.getURL("content/tweak.css")
    ;(document.documentElement || document.head || document.body)?.appendChild(link)
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

  const tick = () => {
    injectStyles()
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
