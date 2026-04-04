function clickNavButton(btn, tabId, desId) {
    document.querySelectorAll(".tab-button")
            .forEach(t => t.classList.remove("button-clicked"))
    
    document.querySelectorAll(".visualization")
            .forEach(v => v.classList.remove("visualization-selected"))

    document.querySelectorAll(".description")
            .forEach(d => d.classList.remove("description-selected"))
    
    btn.classList.add("button-clicked")

    document.getElementById(tabId)
            .classList.add("visualization-selected")

    document.getElementById(desId)
            .classList.add("description-selected")
}