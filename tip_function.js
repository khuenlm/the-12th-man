let tip = d3.select("body")
            .append("div")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("padding", "6px")
            .style("border", "1px solid black")
            .style("font-family", "Source Sans 3")
            .style("opacity", 0)
            .style("pointer-events", "none")
            .style("margin-right", "10px")

function showGitTip() {
    tip.style("opacity", 0.8)
       .style("font-size", "12px")
       .html(`<em>Go to project's repository?</em`)
}

function moveGitTip(event) {
    tip.style("left", (event.pageX - 60) + "px")
       .style("top", (event.pageY + 10) + "px")
}

function hideTip() {
    tip.style("opacity", 0)
}

function showLinkedInTip() {
    tip.style("opacity", 0.8)
       .style("font-size", "12px")
       .html(`<em>Go to my LinkedIn?</em`)
}

function moveTip(event) {
    tip.style("left", (event.pageX - 60) + "px")
       .style("top", (event.pageY + 10) + "px")
}