let svg1 = d3.select("#tab-1")
            .append("svg")
            .attr("width", 1294.4)
            .attr("height", 629.99)

let svg2 = d3.select("#tab-2")
            .append("svg")
            .attr("width", 1294.4)
            .attr("height", 629.99)

let svg3 = d3.select("#tab-3")
            .append("svg")
            .attr("width", 1294.4)
            .attr("height", 629.99)

let svg4 = d3.select("#tab-4")
            .append("svg")
            .attr("width", 1294.4)
            .attr("height", 629.99)

let tooltip = d3.select("#tab-1")
                .append("div")
                .style("opacity", 0)
                .style("pointer-events", "none")

let rect = svg1.append("rect")
               .attr("x", "10")
               .attr("y", "10")
               .attr("width", "50")
               .attr("height", "50")
               .attr("fill", "orange")
               .on("mouseover", function(event, d) {
                tooltip.style("opacity", 1).html(`Khue`);
               })
               .on("mousemove", function(event, d){
                tooltip.style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                })
               .on("mouseout", function(event, d) {
                tooltip.style("opacity", 0);
               })
