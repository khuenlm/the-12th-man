const width = document.getElementById('tab-1').clientWidth;
const height = 750;

console.log(width);

const margin = {
  top: 70,
  right: 40,
  bottom: 30,
  left: 62
}

let svg1 = d3.select("#tab-1").append("svg").attr("width", '100%').attr("height", 800)
let svg2 = d3.select("#tab-2").append("svg").attr("width", '100%').attr("height", 850)
let svg3 = d3.select("#tab-3").append("svg").attr("width", '100%').attr("height", 750)
let svg4 = d3.select("#tab-4").append("svg").attr("width", '100%').attr("height", 750)

let description1 = d3.select("#des1")
                     .append("p")
                     .html(`Each cell of the heat map below shows the mean yellow cards issued to teams \
                            from a given confederation (displayed in columns) when refereed by officials from \
                            another confederation (displayed in rows). Diagonal cells, where referee and team are \
                            from the same confederation, are highlighted in gold. Grey cells indicate insufficient data (n < 2).`)

let description2 = d3.select("#des2")
                     .append("p")
                     .html(`Hello from the University of Illinois`)

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
                                tooltip.style("left", (event.pageX - 80) + "px")
                                       .style("top", (event.pageY - 125) + "px")
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
        .attr("transform", d => "translate(190, 450), rotate(-90)")
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

function getCardCounts(data) {
    let count = {}
    data.forEach(d => {
        const key = d.yellow_card;
        count[key] = (count[key] || 0) + 1;
    })

    const sorted = data.map(d => d.yellow_card).sort((a, b) => (a - b));
    const size = sorted.length;
    const median = sorted[Math.floor(size / 2)];
    const q1 = sorted[Math.floor(size / 4)];
    const q3 = sorted[Math.floor(size * 3 / 4)];
    const maxCount = Math.max(...Object.values(count));

    return {count, sorted, size, median, q1, q3, maxCount};
}

const violinWidth = 500;  
const centerSame = 420;
const centerDiff = 920;
const MAX_CARDS = 9; 

function returnPoints(stats, centerX, globalMax, yscale) {
    const maxHalfWidth = 250;
    
    const points = [];

    for (let i = MAX_CARDS; i >= 0; i--) {
        const c = stats.count[i] || 0;
        const halfWidth = c * maxHalfWidth / globalMax;
        const yPos = yscale(i);
        points.push({x: centerX + halfWidth, y: yPos});
    }
    for (let i = 0; i <= MAX_CARDS; i++) {
        const c = stats.count[i] || 0;
        const halfWidth = c * maxHalfWidth / globalMax;
        const yPos = yscale(i);
        points.push({x: centerX - halfWidth, y: yPos});
    }

    return points;
}

function drawViolin(lineGenerator, points, svg, color, fill, yscale, stats, margin) {
    svg.append("path")
       .datum(points)
       .attr("d", lineGenerator)
       .attr("stroke", color)
       .attr("stroke-width", 3)
       .attr("fill", fill)
       .attr("opacity", 0.8)
       .on("mousemove", function(event) {
           const cardValue = Math.round(yscale.invert(event.offsetY));
           const count = stats.count[cardValue] || 0;
           tooltip
               .style("opacity", 1)
               .style("left", (event.pageX + 12) + "px")
               .style("top", (event.pageY - 30) + "px")
               .html(`
                   <strong>${cardValue} yellow cards</strong><br>
                   ${count} matches (${(count / stats.size * 100).toFixed(1)}%)
               `)
               .style("font-size", "20px")
       })
       .on("mouseout", function() {
           tooltip.style("opacity", 0);
       });
}

d3.json("data/viz/beeswarm.json").then(function(data) {

    const sameConf = data.filter(d => d.same_conf == true);
    const diffConf = data.filter(d => d.same_conf == false); 

    const sameStats = getCardCounts(sameConf);
    const diffStats = getCardCounts(diffConf); 
    const globalMax = Math.max(sameStats.maxCount, diffStats.maxCount);

    const yScaleBee = d3.scaleLinear()
                        .domain([0, 9])
                        .range([height - margin.bottom, margin.top])
    
    const yBee = svg2.append("g")
                     .attr("class", "y-axis")
                     .style("font-size", "16px")
                     .style("font-weight", 'bold')
                     .style("font-family", "Source Sans 3")
                     .attr("transform", `translate(150, 0)`)

    const y_grid = svg2.append("g")
                  .attr("class", "y-grid")
                  .attr("transform", "translate(150, 0)")
    
    y_grid.call(d3.axisLeft(yScaleBee)
                  .tickSizeInner(-1200)
                  .tickSizeOuter(0)
                  .tickFormat(""));

    yBee.call(d3.axisLeft(yScaleBee));

    const samePoints = returnPoints(sameStats, centerSame, globalMax, yScaleBee);
    const diffPoints = returnPoints(diffStats, centerDiff, globalMax, yScaleBee); 

    const lineGenerator = d3.line()
                            .x(d => d.x)
                            .y(d => d.y)

    console.log(sameStats.size);
    console.log(diffStats.size);

    drawViolin(lineGenerator, samePoints, svg2, "blue", "lightblue", yScaleBee, sameStats, margin);
    drawViolin(lineGenerator, diffPoints, svg2, "orange", "#FAD5A5", yScaleBee, diffStats, margin);

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("SAME CONFEDERATION")
        .attr("transform", `translate(320, 770)`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("n = 407")
        .attr("transform", `translate(390, 800)`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("DIFFERENT CONFEDERATION")
        .attr("transform", `translate(810, 770)`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("n = 1121")
        .attr("transform", `translate(890, 800)`)

    svg2.append("text")
        .attr("class", "axislabel")                    
        .text("Yellow Cards Issue")
        .attr("transform", d => "translate(100, 450), rotate(-90)")
}) 