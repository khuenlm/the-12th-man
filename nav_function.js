function clickNavButton(btn, tabId) {
    document.querySelectorAll(".tab-button")
            .forEach(t => t.classList.remove("button-clicked"))
    
    document.querySelectorAll(".visualization")
            .forEach(v => v.classList.remove("visualization-selected"))
    
    btn.classList.add("button-clicked")
    document.getElementById(tabId)
            .classList.add("visualization-selected")
}