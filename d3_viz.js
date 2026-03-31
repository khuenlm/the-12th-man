const width = document.getElementById('tab-1').clientWidth;
const height = 750;

const margin = {
  top: 70,
  right: 40,
  bottom: 30,
  left: 60
}

let svg1 = d3.select("#tab-1").append("svg").attr("width", '100%').attr("height", 800)
let svg2 = d3.select("#tab-2").append("svg").attr("width", '100%').attr("height", 750)
let svg3 = d3.select("#tab-3").append("svg").attr("width", '100%').attr("height", 750)
let svg4 = d3.select("#tab-4").append("svg").attr("width", '100%').attr("height", 750)

const xScale = d3.scaleBand()
                 .domain(["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"])
                 .range([margin.left * 5, 1000])
                 .padding(0.5)

const gx = svg1.append("g")
              .attr("class", "x-axis")
              .style("font-size", "16px")
              .style("font-weight", 'bold')
              .style("font-family", "Source Sans 3")
              .attr("transform", "translate(0, 60)")

const yScale = d3.scaleBand()
                 .domain(["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"])
                 .range([0, 980 - margin.left * 5])
                 .padding(0.5)

const gy = svg1.append("g")
               .attr("class", "y-axis")
               .style("font-size", "16px")
               .style("font-weight", 'bold')
               .style("font-family", "Source Sans 3")
               .attr("transform", `translate(${margin.left * 5 + 10}, 50)`)

const tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("position", "fixed")
                  .style("background-color", "white")
                  .style("padding", "10px")
                  .style("border", "1px solid black")
                  .style("border-radius", "10px")
                  .style("font-family", "Source Sans 3")
                  .style("text-align", "center")
                  .style("opacity", 0)
                  .style("pointer-events", "none")

d3.json("data/viz/heatmap.json").then(function(data) {
    console.log(data)
    gx.call(d3.axisTop(xScale)
              .tickSizeOuter(0));
    gy.call(d3.axisLeft(yScale)
              .tickSizeOuter(0));

    const cells = [];
    Object.keys(data).forEach(refConf => {
        Object.keys(data[refConf]).forEach(teamConf => {
            cells.push({
                refConf: refConf,
                teamConf: teamConf,
                mean_card: data[refConf][teamConf].mean_card,
                match_count: data[refConf][teamConf].match_count
            });
        });
    });

    const values = cells.filter(d => d.mean_card !== null && d.match_count >= 1).map(d => d.mean_card);

    const colorScale = d3.scaleSequential()
                         .domain([d3.min(values), d3.max(values)])
                         .interpolator(d3.interpolateRgb('#43aa8b', '#e84855'))

    const cellGroups = svg1.selectAll("g.cell")
                           .data(cells)
                           .enter()
                           .append("g")
                           .attr("class", "cell")
                           .on("mouseover", function(event, d) {
                                tooltip.style("opacity", 1)
                                       .html(`<strong>${d.refConf} REF &#8594; ${d.teamConf} TEAM</strong><br>
                                                            Mean cards: ${d.mean_card === null ? "N/A" : d.mean_card.toFixed(3)}<br>
                                                            Matches: ${d.match_count}`)
                                svg1.selectAll("g.cell rect")
                                    .attr("opacity", "0.6")
                                d3.select(this)
                                  .select("rect")
                                  .attr("opacity", 1)
                                  .attr("stroke", d => d.refConf === d.teamConf ? "#FFCE1B" : "black")
                                  .attr("stroke-width", d => d.refConf === d.teamConf ? "5" : "3")
                                  .attr("cursor", "pointer")
                           })
                           .on("mousemove", function(event, d) {
                                tooltip.style("left", (event.pageX + 120) + "px")
                                       .style("top", (event.pageY + 15) + "px")
                                       .style("position", "absolute")
                           })
                           .on("mouseout", function(event, d) {
                                tooltip.style("opacity", 0)
                                svg1.selectAll("g.cell rect")
                                    .attr("opacity", 1)
                                    .attr("stroke", d => d.refConf === d.teamConf ? "#FFCE1B" : "none")
                                    .attr("stroke-width", d => d.refConf === d.teamConf ? "5" : "0")
                            })

    cellGroups.append("rect")
              .attr("x", d => xScale(d.teamConf) - 23)
              .attr("y", d => yScale(d.refConf) + 28)
              .attr("width", 100)
              .attr("height", 100)
              .attr("stroke", d => d.refConf === d.teamConf ? "#FFCE1B" : "none")
              .attr("stroke-width", d => d.refConf === d.teamConf ? "5" : "0")
              .attr("fill", d => d.mean_card === null ? '#cccccc' : colorScale(d.mean_card))

    cellGroups.append("text")
              .attr("class", "cell-label")
              .attr("x", d => xScale(d.teamConf) + 29)
              .attr("y", d => yScale(d.refConf) + 85)
              .attr("text-anchor", "middle")
              .text(d => d.mean_card === null ? "N/A" : d.mean_card.toFixed(3))

    svg1.append("text")
        .attr("class", "axis-labels")                    
        .text("Team Confederation")
        .attr("transform", `translate(${margin.left * 9.5}, 25)`)
        .style("opacity", 0.5)

    svg1.append("text")
        .attr("class", "axis-labels")                    
        .text("Referee Confederation")
        .attr("transform", d => "translate(190, 480), rotate(-90)")
        .style("opacity", 0.5)
        
    const defs = svg1.append("defs")
    
    const linearGradient = defs.append("linearGradient")
                               .attr("id", "legend-gradient");

    linearGradient.selectAll("stop")
                  .data([
                    { offset: "0%", color: "#43aa8b" },
                    { offset: "100%", color: "#e84855" }
                  ])
                  .enter()
                  .append("stop")
                  .attr("offset", d => d.offset)
                  .attr("stop-color", d => d.color);

    const legendWidth = 300;
    const legendHeight = 15;

    const legendX = 500;
    const legendY = 750;

    svg1.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#legend-gradient)");

    const legendScale = d3.scaleLinear()
                          .domain([d3.min(values), d3.max(values)])
                          .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
                         .tickSize(0)
                         .tickFormat("");

    svg1.append("g")
        .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
        .call(legendAxis);

    svg1.append("text")
        .attr("class", "legend-labels") 
        .text("Less Cards")
        .attr("transform", "translate(460, 790)")
        .attr("font-family", "Source Sans 3")

    svg1.append("text")
        .attr("class", "legend-labels") 
        .text("More Cards")
        .attr("transform", "translate(760, 790)")
})