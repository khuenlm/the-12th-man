const width = document.getElementById('tab-1').clientWidth;
const height = document.getElementById('tab-1').clientHeight;

const margin = {
  top: 50,
  right: 40,
  bottom: 30,
  left: 60
}

let svg1 = d3.select("#tab-1").append("svg").attr("width", '100%').attr("height", 750)
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

    let cellTip = d3.tip()
                    .attr("class", "d3-tip")
                    .direction("s")
                    .offset([103, 60])

    svg1.call(cellTip)

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
                                cellTip.html(function() {return`<strong>${d.refConf} REF &#8594; ${d.teamConf} TEAM</strong><br>
                                                            Mean cards: ${d.mean_card === null ? "N/A" : d.mean_card.toFixed(3)}<br>
                                                            Matches: ${d.match_count}`})
                                cellTip.show(event, d3.select(this).select("rect").node())
                                svg1.selectAll("g.cell rect")
                                    .attr("opacity", "0.6")
                                d3.select(this)
                                  .select("rect")
                                  .attr("opacity", 1)
                                  .attr("stroke", "black")
                                  .attr("stroke-width", "3")
                                  .attr("cursor", "pointer")
                           })
                           .on("mouseout", function(event, d) {
                                cellTip.hide(event, d3.select(this).select("rect").node())
                                svg1.selectAll("g.cell rect")
                                    .attr("opacity", 1)
                                    .attr("stroke", d => d.refConf === d.teamConf ? "#FFCE1B" : "none")
                                    .attr("stroke-width", d => d.refConf === d.teamConf ? "5" : "0")
                            })

    cellGroups.append("rect")
              .attr("x", d => xScale(d.teamConf) - 23)
              .attr("y", d => yScale(d.refConf) + 28)
              .attr("width", margin.top * 2)
              .attr("height", margin.top * 2)
              .attr("stroke", d => d.refConf === d.teamConf ? "#FFCE1B" : "none")
              .attr("stroke-width", d => d.refConf === d.teamConf ? "5" : "0")
              .attr("fill", d => d.mean_card === null ? '#cccccc' : colorScale(d.mean_card))

    cellGroups.append("text")
              .attr("class", "cell-label")
              .attr("x", d => xScale(d.teamConf) + 29)
              .attr("y", d => yScale(d.refConf) + 85)
              .attr("text-anchor", "middle")
              .text(d => d.mean_card === null ? "N/A" : d.mean_card.toFixed(3))
        
})