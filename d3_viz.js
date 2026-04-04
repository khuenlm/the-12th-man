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
let svg2 = d3.select("#tab-2").append("svg").attr("width", '100%').attr("height", 800)
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

function returnBeeData(data, centerX, scaleY, colWidth) {
        groupCard = {}

        data.forEach(d => {
            const key = d.yellow_card;
            if (groupCard[key] === undefined) {
                groupCard[key] = [];
            }
            groupCard[key].push(d);
        })

        const R = 5; 
        const dots = [];
        const maxPerRow = Math.floor(colWidth / (R * 2 + 1)); 

        Object.keys(groupCard).forEach(d => {
            const group = groupCard[d];
            const groupLength = group.length;
            const yPosition = scaleY(+d);
            let place = 0; 
            
            while (place < groupLength) {
                const rowCount = Math.min(groupLength - place, maxPerRow);
                const row = Math.floor(place / maxPerRow);
                const startX = centerX - (rowCount - 1) * (R * 2 + 1) / 2;
                const yPos = yPosition - row * (R * 2 + 1.5);

                for (let i = 0; i < rowCount; i++) {
                    dots.push({
                        x: startX + i*(R*2+1),
                        y: yPos,
                        datum: group[place + i]
                    });
                }
                place += rowCount;
            }
        })

        return dots
    }

d3.json("data/viz/beeswarm.json").then(function(data) {
    console.log(data);

    const yScaleBee = d3.scaleLinear()
                        .domain(d3.extent(data, d => d.yellow_card))
                        .range([700, 0])
    
    const yBee = svg2.append("g")
                     .attr("class", "y-axis")
                     .style("font-size", "16px")
                     .style("font-weight", 'bold')
                     .style("font-family", "Source Sans 3")
                     .attr("transform", `translate(20, 50)`)

    const y_grid = svg2.append("g")
                  .attr("class", "y-grid")
                  .attr("transform", "translate(20, 50)")

    y_grid.call(d3.axisLeft(yScaleBee)
                  .tickSizeInner(-width)
                  .tickSizeOuter(0)
                  .tickFormat(""));
    
    yBee.call(d3.axisLeft(yScaleBee));

    sameConf = data.filter(d => d.same_conf == true);
    diffConf = data.filter(d => d.same_conf == false); 

    const columnWidth = 680;
    const sameCenter = 320;
    const diffCenter = 950;

    const sameDots = returnBeeData(sameConf, sameCenter, yScaleBee, 550);
    const diffDots = returnBeeData(diffConf, diffCenter, yScaleBee, columnWidth);


    svg2.selectAll("circle.same")
        .data(sameDots)
        .enter()
        .append("circle")
        .attr("class", "same")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y + 50)
        .attr("r", 3)
        .attr("fill", "#43aa8b")
        .on("mouseover", function(event, d) {
                                tooltip.style("opacity", 1)
                                       .html(` <strong>${d.datum.team_name}</strong><br>
                                                <span style="color:#888">${d.datum.match_id.split('-')[1]} World Cup</span><br>
                                                ${d.datum.team_confederation} vs ${d.datum.ref_confederation} referee<br>
                                                Yellow cards: ${d.datum.yellow_card}<br>
                                                ✅ Same confederation`)
                                svg2.selectAll("circle")
                                    .attr("opacity", "0.6")
                                d3.select(this)
                                  .attr("r", 10)
                                  .attr("opacity", 1)
                                  .attr("stroke", "black")
                                  .attr("cursor", "pointer")
                           })
                           .on("mousemove", function(event, d) {
                                tooltip.style("left", (event.pageX - 40) + "px")
                                       .style("top", (event.pageY + 10) + "px")
                                       .style("position", "absolute")
                           })
                           .on("mouseout", function(event, d) {
                                tooltip.style("opacity", 0)
                                svg2.selectAll("circle")
                                    .attr("r", 3)
                                    .attr("opacity", 1)
                                    .attr("stroke", "none")
                            })

    svg2.selectAll("circle.diff")
        .data(diffDots)
        .enter()
        .append("circle")
        .attr("class", "diff")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y + 50)
        .attr("r", 3)
        .attr("fill", "#e84855")
        .on("mouseover", function(event, d) {
                                tooltip.style("opacity", 1)
                                       .html(` <strong>${d.datum.team_name}</strong><br>
                                                <span style="color:#888">${d.datum.match_id.split('-')[1]} World Cup</span><br>
                                                ${d.datum.team_confederation} vs ${d.datum.ref_confederation} referee<br>
                                                Yellow cards: ${d.datum.yellow_card}<br>
                                                ❌ Different confederation`)
                                svg2.selectAll("circle")
                                    .attr("opacity", "0.6")
                                
                                d3.select(this)
                                  .attr("r", 10)
                                  .attr("opacity", 1)
                                  .attr("stroke", "black")
                                  .attr("cursor", "pointer")
                           })
                           .on("mousemove", function(event, d) {
                                tooltip.style("left", (event.pageX - 40) + "px")
                                       .style("top", (event.pageY + 10) + "px")
                                       .style("position", "absolute")
                           })
                           .on("mouseout", function(event, d) {
                                tooltip.style("opacity", 0)
                                svg2.selectAll("circle")
                                    .attr("r", 3)
                                    .attr("opacity", 1)
                                    .attr("stroke", "none")
                            })
    
    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("Same Confederation")
        .attr("transform", `translate(${sameCenter - 80}, ${height + 30})`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("Different Confederation")
        .attr("transform", `translate(${diffCenter - 75}, ${height + 30})`)

    svg2.append("text")
        .attr("class", "axislabel")
        .attr("x", margin.left - 35)
        .attr("y", margin.top - 20)
        .text("Yellow Cards Issued")
}) 