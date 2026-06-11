const width = document.getElementById('tab-1').clientWidth;
const height = 750;

console.log(width);

const margin = {
  top: 70,
  right: 40,
  bottom: 30,
  left: 100
}

let svg1 = d3.select("#tab-1").append("svg").attr("width", '100%').attr("height", 800)
let svg2 = d3.select("#tab-2").insert("svg", "#results").attr("width", '90%').attr("height", 750)
let svg3 = d3.select("#tab-3").append("svg").attr("width", '100%').attr("height", 800)
let svg4 = d3.select("#tab-4").append("svg").attr("width", '100%').attr("height", 750)

let description1 = d3.select("#des1")
                     .append("p")
                     .html(`Each cell of the heat map below shows the mean yellow cards issued to teams \
                            from a given confederation (displayed in columns) when refereed by officials from \
                            another confederation (displayed in rows). Diagonal cells, where referee and team are \
                            from the same confederation, are highlighted in gold. Grey cells indicate insufficient data (n < 2).`)

let description2 = d3.select("#des2")
                     .append("p")
                     .html(`Each violin represents the full distribution of yellow cards issued per team per match — 
                            blue for matches where the referee shared a confederation with the team, orange for 
                            cross-confederation assignments. The width of the violin at each card count encodes 
                            how many matches produced that outcome. The visual difference between the two groups is subtle but consistent — 
                            scroll down to see whether it holds up statistically.`)

let description3 = d3.select("#des3")
                     .append("p")
                     .html(`The bias index measures the difference in mean yellow cards between same-confederation 
                            and cross-confederation referee assignments per tournament. A negative value indicates 
                            same-confederation teams received fewer cards — consistent with referee bias. The orange 
                            line smooths year-to-year volatility using a 3-tournament rolling average, revealing the 
                            long-term trend. Vertical markers indicate significant moments in FIFA's officiating history. 
                            Hover over each dot to explore individual tournament statistics. <br>(<em>Bias Index = μ<sub>same</sub> 
                            − μ<sub>diff</sub></em>)`)
                
let description4 = d3.select("#des4")
                     .append("p")
                     .html(`There is (slight) evidence in previous layers suggesting referee bias at the FIFA Men’s 
                        World Cup by confederation. Does this bias persist under higher stakes, or does it fade as the 
                        tournament progresses? In this last visualization, each dot represents one World Cup match where 
                        the referee came from the same confederation as one of the two teams. The card difference axis 
                        indicates how many more or fewer cards the same-confederation team received compared to their opponents. 
                        Hover over any dot for match details. <br>(<em>Card Difference = Yellow Cards<sub>same-conf team</sub> 
                        − Yellow Cards<sub>diff-conf team</sub></em>)`)

const xScale = d3.scaleBand()
                 .domain(["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"])
                 .range([250, 950])
                 .padding(0.5)

const gx = svg1.append("g")
              .attr("class", "x-axis")
              .style("font-size", "16px")
              .style("font-weight", 'bold')
              .style("font-family", "Source Sans 3")
              .attr("transform", "translate(0, 60)")

const yScale = d3.scaleBand()
                 .domain(["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"])
                 .range([0, 700])
                 .padding(0.5)

const gy = svg1.append("g")
               .attr("class", "y-axis")
               .style("font-size", "16px")
               .style("font-weight", 'bold')
               .style("font-family", "Source Sans 3")
               .attr("transform", `translate(260, 50)`)

const tooltip = d3.select("body")
                  .append("div")
                  .attr("class", "tooltip")
                  .style("position", "absolute")
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
        .attr("transform", `translate(530, 25)`)
        .style("opacity", 0.5)

    svg1.append("text")
        .attr("class", "axis-labels")                    
        .text("Referee Confederation")
        .attr("transform", d => "translate(140, 470), rotate(-90)")
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

    const legendX = 450;
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
        .attr("transform", "translate(410, 790)")
        .attr("font-family", "Source Sans 3")

    svg1.append("text")
        .attr("class", "legend-labels") 
        .text("More Cards")
        .attr("transform", "translate(710, 790)")
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

const violinWidth = 300;  
const centerSame = 400;
const centerDiff = 770;
const MAX_CARDS = 9; 

function returnPoints(stats, centerX, globalMax, yscale) {
    const maxHalfWidth = 150;
    
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
                        .range([600, margin.top])
    
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
                  .tickSizeInner(-1100)
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

    svg2.append("rect")
        .attr("x", centerSame - 20)
        .attr("y", yScaleBee(sameStats.q3))
        .attr("width", 40)
        .attr("height", yScaleBee(sameStats.q1) - yScaleBee(sameStats.q3))
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("fill", "transparent")
        .on("mouseover", function(event) {
            tooltip.style("opacity", 1)
                   .html(`<strong>Interquartile Range</strong><br>
                            The middle 50% of matches fall between<br>
                            <strong>${sameStats.q1}</strong> and <strong>${sameStats.q3}</strong> yellow cards<br>
                            <span style="color:#999; font-size:11px">25% of matches had ≤ ${sameStats.q1} cards<br>
                            75% of matches had ≤ ${sameStats.q3} cards</span>`)
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX - 120) + "px")
                   .style("top", (event.pageY - 140) + "px")
        })
        .on("mouseout", function(event) {
            tooltip.style("opacity", 0)
        })

    svg2.append("circle")
        .attr("cx", centerSame)
        .attr("cy", d => yScaleBee(sameStats.median))
        .attr("r", 8)
        .attr("fill", "blue")  
        .on("mouseover", function(event) {
            tooltip.style("opacity", 1)
                   .html(` <strong>Median: ${sameStats.median} yellow cards</strong><br>
                            Half of all matches with team and referee <br> from the same confederation received<br>
                            ${sameStats.median} or fewer yellow cards<br>
                            <span style="color:#999; font-size:11px">n = ${sameStats.size} matches total</span>`)
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX - 120) + "px")
                   .style("top", (event.pageY - 140) + "px")
        })
        .on("mouseout", function(event) {
            tooltip.style("opacity", 0)
        })
        
    svg2.append("rect")
        .attr("x", centerDiff - 20)
        .attr("y", yScaleBee(diffStats.q3))
        .attr("width", 40)
        .attr("height", yScaleBee(diffStats.q1) - yScaleBee(diffStats.q3))
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("fill", "transparent")
        .on("mouseover", function(event) {
            tooltip.style("opacity", 1)
                   .html(`<strong>Interquartile Range</strong><br>
                            The middle 50% of matches fall between<br>
                            <strong>${diffStats.q1}</strong> and <strong>${diffStats.q3}</strong> yellow cards<br>
                            <span style="color:#999; font-size:11px">25% of matches had ≤ ${diffStats.q1} cards<br>
                            75% of matches had ≤ ${diffStats.q3} cards</span>`)
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX - 120) + "px")
                   .style("top", (event.pageY - 140) + "px")
        })
        .on("mouseout", function(event) {
            tooltip.style("opacity", 0)
        })
    
    svg2.append("circle")
        .attr("cx", centerDiff)
        .attr("cy", d => yScaleBee(diffStats.median))
        .attr("r", 8)
        .attr("fill", "orange")  
        .on("mouseover", function(event) {
            tooltip.style("opacity", 1)
                   .html(` <strong>Median: ${diffStats.median} yellow cards</strong><br>
                            Half of all matches with team and referee <br> from the same confederation received<br>
                            ${diffStats.median} or fewer yellow cards<br>
                            <span style="color:#999; font-size:11px">n = ${diffStats.size} matches total</span>`)
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX - 120) + "px")
                   .style("top", (event.pageY - 140) + "px")
        })
        .on("mouseout", function(event) {
            tooltip.style("opacity", 0)
        })
    
    svg2.append("line")
        .attr("x1", centerSame - 55)
        .attr("x2", centerSame + 55)
        .attr("y1", yScaleBee(sameStats.median))
        .attr("y2", yScaleBee(sameStats.median))
        .attr("stroke", "blue")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,4")

    svg2.append("line")
        .attr("x1", centerDiff - 125)
        .attr("x2", centerDiff + 125)
        .attr("y1", yScaleBee(diffStats.median))
        .attr("y2", yScaleBee(diffStats.median))
        .attr("stroke", "orange")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,4")

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("Same Confederation")
        .attr("transform", `translate(320, 650)`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("n = 407")
        .attr("transform", `translate(370, 680)`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("Different Confederation")
        .attr("transform", `translate(670, 650)`)

    svg2.append("text")
        .attr("class", "same-conf-labels") 
        .text("n = 1121")
        .attr("transform", `translate(740, 680)`)

    svg2.append("text")
        .attr("class", "axis-labels")                    
        .text("Yellow Cards Issued")
        .attr("transform", d => "translate(110, 410), rotate(-90)")
        .style("opacity", 0.5)
}) 

d3.json("data/viz/timeline.json").then(function(data) {

    const years = [1970,1974,1978,1982,1986,1990,1994,1998,2002,2006,2010,2014,2018,2022];

    const xScaleTime = d3.scaleLinear()
                        .domain([1968, 2022])
                        .range([margin.left, width - margin.right])
    
    const x_grid_time = svg3.append("g")
                  .attr("class", "x-grid")
                  .attr("transform", `translate(0, 700)`)
    
    x_grid_time.call(d3.axisBottom(xScaleTime)
                  .tickSizeInner(-600)
                  .tickSizeOuter(0)
                  .tickValues(years)
                  .tickFormat(""));

    const xTime = svg3.append("g")
                     .attr("class", "x-axis")
                     .style("font-size", "16px")
                     .style("font-weight", 'bold')
                     .style("font-family", "Source Sans 3")
                     .attr("transform", `translate(0, 700)`)
    
    xTime.call(d3.axisBottom(xScaleTime)
                 .tickValues(years)
                 .tickFormat(d => d));

    const yScaleTime = d3.scaleLinear()
                        .domain([- 0.8, d3.max(data["overall"], d => d.bias_index + d.dispersion) + 0.1])
                        .range([700, 100])

    const y_grid_time = svg3.append("g")
                  .attr("class", "y-grid")
                  .attr("transform", `translate(${margin.left}, 0)`)
    
    y_grid_time.call(d3.axisLeft(yScaleTime)
                  .tickSizeInner(-width + 140)
                  .tickSizeOuter(0)
                  .tickFormat(""));
    
    const yTime = svg3.append("g")
                     .attr("class", "y-axis")
                     .style("font-size", "16px")
                     .style("font-weight", 'bold')
                     .style("font-family", "Source Sans 3")
                     .attr("transform", `translate(${margin.left}, 0)`)

    yTime.call(d3.axisLeft(yScaleTime));

    svg3.append("line")
        .attr("x1", margin.left)
        .attr("y1", yScaleTime(0))
        .attr("x2", width - margin.right)
        .attr("y2", yScaleTime(0))
        .attr("stroke", "")
        .attr("stroke", "#999")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "5,4")

    svg3.append("text")
        .attr("class", "axis-labels")                    
        .text("Year of Tournament")
        .attr("transform", `translate(550, ${height - margin.bottom + 40})`)
        .attr("opacity", 0.5)

    svg3.append("text")
        .attr("class", "axis-labels")                    
        .text("Bias Index")
        .attr("transform", d => `translate(${margin.left - 50}, ${height / 2 + 60}), rotate(-90)`)
        .attr("opacity", 0.5)

    svg3.append("line")
        .attr("x1", xScaleTime(2018))
        .attr("y1", 100)
        .attr("x2", xScaleTime(2018))
        .attr("y2", 700)
        .attr("stroke", "")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,4")

    svg3.append("line")
        .attr("x1", xScaleTime(1990))
        .attr("y1", 100)
        .attr("x2", xScaleTime(1990))
        .attr("y2", 700)
        .attr("stroke", "")
        .attr("stroke", "red")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,4")

    svg3.append("line")
        .attr("x1", xScaleTime(1974))
        .attr("y1", 30)
        .attr("x2", xScaleTime(1978))
        .attr("y2", 30)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 5)

    svg3.append("line")
        .attr("x1", xScaleTime(1988))
        .attr("y1", 30)
        .attr("x2", xScaleTime(1992))
        .attr("y2", 30)
        .attr("stroke", "darkorange")
        .attr("stroke-width", 5)
        .attr("opacity", 0.7)

    svg3.append("line")
        .attr("x1", xScaleTime(2004))
        .attr("y1", 30)
        .attr("x2", xScaleTime(2008))
        .attr("y2", 30)
        .attr("stroke", "steelblue")
        .attr("stroke-width", 5)
        .attr("opacity", 0.3)

    svg3.append("text")
        .text("Year-by-year bias index")
        .attr("class", "legendTime")
        .attr("x", d => xScaleTime(1978.5))
        .attr("y", 35)

    svg3.append("text")
        .text("3-tournament rolling average")
        .attr("class", "legendTime")
        .attr("x", d => xScaleTime(1992.5))
        .attr("y", 35)

    svg3.append("text")
        .text("Match-level spread (±1 SD)")
        .attr("class", "legendTime")
        .attr("x", d => xScaleTime(2008.5))
        .attr("y", 35)

    svg3.append("text")
        .html("<a href = 'https://en.wikipedia.org/wiki/Video_assistant_referee' target = 'blank'>VAR</a> Introduced")
        .attr("class", "landmark")
        .attr("x", d => xScaleTime(2018))
        .attr("y", 95)

    svg3.append("text")
        .text("Assistant Referees Expansion")
        .attr("class", "landmark")
        .attr("x", d => xScaleTime(1990))
        .attr("y", 95)
    
    const line = d3.line()
                   .x(d => xScaleTime(d.year))
                   .y(d => yScaleTime(d.bias_index))

    const line_rolling = d3.line()
                           .x(d => xScaleTime(d.year))
                           .y(d => yScaleTime(d.rolling_avg))
                           .curve(d3.curveCatmullRom)

    svg3.append("path")
        .datum(data["overall"])
        .attr("d", line_rolling)
        .attr("fill", "none")
        .attr("stroke", "darkorange")
        .attr("stroke-width", 5)
        .attr("opacity", 0.7)

    svg3.selectAll("line.dispersion")
        .data(data["overall"])
        .enter()
        .append("line")
        .attr("class", "dispersion")
        .attr("x1", d => xScaleTime(d.year))
        .attr("x2", d => xScaleTime(d.year))
        .attr("y1", d => yScaleTime(d.bias_index + d.dispersion))
        .attr("y2", d => yScaleTime(d.bias_index - d.dispersion))
        .attr("stroke", "steelblue")
        .attr("stroke-width", 7)
        .attr("opacity", 0.3)

    svg3.append("path")
        .datum(data["overall"])
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 5)

    svg3.selectAll("circle")
        .data(data["overall"])
        .enter()
        .append("circle")
        .attr("cx", d => xScaleTime(d.year))
        .attr("cy", d => yScaleTime(d.bias_index))
        .attr("r", d => 7)
        .attr("fill", "navy")
        .attr("stroke", "black")
        .on("mouseover", function(event, d) {
            tooltip.style("opacity", 1)
                   .html(`<strong>FIFA World Cup ${d.year}</strong><br>
                            <strong>Bias Index</strong> = ${d.bias_index.toFixed(3)} <br>
                            Same-conf matches: ${d.match_same}<br>
                            Diff-conf matches: ${d.match_diff}`)
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX - 90) + "px")
                   .style("top", (event.pageY - 120) + "px")
        })
        .on("mouseout", function(event) {
            tooltip.style("opacity", 0)
        })

}) 

d3.json("data/viz/strip.json").then(function(data) {

    const stripColorScaleLegend = d3.scaleSequential()
                                    .domain([10, 14])
                                    .interpolator(d3.interpolateLab("#d7445cff", "#3866d1ff"));

    [10, 11, 12, 13, 14].forEach(point => {
        svg4.append("circle")
            .attr("cx", point * 40 - 40)
            .attr("cy", 20)
            .attr("r", 10)
            .attr("fill", stripColorScaleLegend(point))
            .attr("opacity", 0.7)
    })

    svg4.append("text")
        .attr("x", 230)
        .attr("y", 15)
        .append("tspan")
        .attr("font-size", 14)
        .text("Same-conf team")
        .append("tspan")
        .text("got fewer cards")
        .attr("x", 235)
        .attr("y", 30)

    svg4.append("text")
        .attr("x", 545)
        .attr("y", 15)
        .append("tspan")
        .attr("font-size", 14)
        .text("Same-conf team")
        .append("tspan")
        .text("got more cards")
        .attr("x", 550)
        .attr("y", 30)

    svg4.append("circle")
        .attr("cx", 760)
        .attr("cy", 20)
        .attr("r", 10)
        .attr("fill", "gold")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("opacity", 0.7)

    svg4.append("text")
        .attr("x", 780)
        .attr("y", 15)
        .append("tspan")
        .attr("font-size", 14)
        .text("Mean card difference")
        .append("tspan")
        .text("of each stage")
        .attr("x", 785)
        .attr("y", 30)

    const stageOrder = ["group stage", "round of 16", "quarter-finals", "semi-finals", "third-place match", "final"];
    const labels = ["Group Stage", "Round of 16", "Quarter-finals", "Semi-finals", "Third-place Match", "Final"];
    
    const stages = stageOrder.filter(s => data.some(d => d.stage_name === s));

    const xScaleStrip = d3.scaleBand()
                          .domain(stages)
                          .range([150, 1050])

    const xGridStrip = svg4.append("g")
                        .attr("class", "x-grid")
                        .style("font-size", "16px")
                        .style("font-weight", 'bold')
                        .style("font-family", "Source Sans 3")
                        .style("stroke-opacity", 0.2)
                        .attr("transform", `translate(${xScaleStrip.bandwidth() / 2}, 650)`)

    xGridStrip.call(d3.axisBottom(xScaleStrip)
                      .tickFormat("")
                      .tickSizeOuter(0)
                      .tickSizeInner(-(650 - margin.top)))
           
    const gxStrip = svg4.append("g")
                        .attr("class", "x-axis")
                        .style("font-size", "16px")
                        .style("font-weight", 'bold')
                        .style("font-family", "Source Sans 3")
                        .attr("transform", "translate(0, 650)")

    gxStrip.call(d3.axisBottom(xScaleStrip)
                   .tickFormat((d, i) => labels[i])
                   .tickSizeOuter(0))

    const yScaleStrip = d3.scaleLinear()
                          .domain([-6, 5])
                          .range([650, margin.top])

    const gyStrip = svg4.append("g")
                        .attr("class", "y-axis")
                        .style("font-size", "16px")
                        .style("font-weight", 'bold')
                        .style("font-family", "Source Sans 3")
                        .attr("transform", "translate(150, 0)")

    gyStrip.call(d3.axisLeft(yScaleStrip)
                   .tickSizeOuter(0))            

    svg4.append("text")
        .attr("class", "axis-labels")                    
        .text("Stages")
        .attr("transform", `translate(570, ${height - margin.bottom - 10})`)
        .style("opacity", 0.5)

    svg4.append("text")
        .attr("class", "axis-labels")                    
        .text("Card Difference")
        .attr("transform", d => "translate(100, 400), rotate(-90)")
        .style("opacity", 0.5)

    svg4.append("text")
        .attr("class", "axis-labels") 
        .attr("x", 0)
        .attr("y", 100)                   
        .text("Favor different-")
        .attr("fill", "#3866d1ff")
    
    svg4.append("text")
        .attr("class", "axis-labels") 
        .attr("x", 0)
        .attr("y", 115)                   
        .text("confederation →")
        .attr("fill", "#3866d1ff")

    svg4.append("text")
        .attr("class", "axis-labels") 
        .attr("x", 0)
        .attr("y", 130)                   
        .text("team matches")
        .attr("fill", "#3866d1ff")

    svg4.append("text")
        .attr("class", "axis-labels")  
        .attr("x", 0)
        .attr("y", 580)                   
        .text("Favor same-")
        .attr("fill", "#d7445cff")

    svg4.append("text")
        .attr("class", "axis-labels") 
        .attr("x", 0)
        .attr("y", 595)                   
        .text("confederation →")
        .attr("fill", "#d7445cff")

    svg4.append("text")
        .attr("class", "axis-labels") 
        .attr("x", 0)
        .attr("y", 610)                   
        .text("team matches")
        .attr("fill", "#d7445cff")

    const stripColorScale = d3.scaleSequential()
                              .interpolator(d3.interpolateLab("#d7445cff", "#3866d1ff"));

    function returnCardDiffText(d) {
        if (d.card_difference > 1) {
            return `${d.same_conf_team} receives ${d.card_difference} cards more than ${d.diff_conf_team}`;
        } else if (d.card_difference < -1) {
            return `${d.same_conf_team} receives ${Math.abs(d.card_difference)} cards fewer than ${d.diff_conf_team}`;
        } else if (d.card_difference == 1) {
            return `${d.same_conf_team} receives ${d.card_difference} card more than ${d.diff_conf_team}`;
        } else if (d.card_difference == -1) {
            return `${d.same_conf_team} receives ${Math.abs(d.card_difference)} card fewer than ${d.diff_conf_team}`;
        } else if (d.home_team_yellow_card == 1) {
            return `Equal Cards (${d.home_team_yellow_card} yellow card each team)`; 
        } else {
            return `Equal Cards (${d.home_team_yellow_card} yellow cards each team)`; 
        }
    }

    svg4.append("line")
        .attr("x1", 150)
        .attr("x2", 1050)
        .attr("y1", yScaleStrip(0))
        .attr("y2", yScaleStrip(0))
        .attr("stroke", "gray")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,4")
        .attr("opacity", 0.6)

    cells = [-5.5, -4.5, -3.5, -2.5, -1.5, -0.5, 0.5, 1.5, 2.5, 3.5, 4.5];
    cells.forEach(cell => {
        svg4.append("line")
            .attr("x1", 150)
            .attr("x2", 1050)
            .attr("y1", yScaleStrip(cell))
            .attr("y2", yScaleStrip(cell))
            .attr("stroke", "gray")
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.2)
    })
    
    svg4.append("line")
        .attr("x1", 1050)
        .attr("x2", 1150)
        .attr("y1", 650)
        .attr("y2", 650)
        .attr("stroke", "white")
        .attr("stroke-width", 1.5)

    svg4.selectAll("circle")
        .data(data.filter(d => d.same_conf == true))
        .enter()
        .append("circle")
        .attr("cy", d => {
            return yScaleStrip(d["card_difference"]) + (Math.random() - 0.5) * 0.1 * xScaleStrip.bandwidth()})
        .attr("cx", d => {
            if (d.stage_name == "group stage") {
                return xScaleStrip(d["stage_name"]) + (Math.random() - 0.5) * xScaleStrip.bandwidth() * 0.8 + xScaleStrip.bandwidth() / 2;
            } else {
                return xScaleStrip(d["stage_name"]) + (Math.random() - 0.5) * xScaleStrip.bandwidth() * 0.6 + xScaleStrip.bandwidth() / 2;
            }
        })
        .attr("r", 5)
        .attr("opacity", 0.5)
        .attr("stroke", "white")
        .attr("stroke-weight", 0.6)
        .attr("fill", d => stripColorScale(d.card_difference))
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 13)
            tooltip.style("opacity", 1)
                   .html(`<b>FIFA World Cup ${d.year}</b><br> 
                    ${d.stage_name.charAt(0).toUpperCase() + d.stage_name.slice(1)} <br>
                    <b>${d.home_team_name}</b> (${d.home_team_confederation}) vs <b>${d.away_team_name}</b> (${d.away_team_confederation}) <br>
                    Referee: ${d.referee_name} (${d.ref_confederation}) <br> 
                    ${returnCardDiffText(d)}`);
        })
        .on("mousemove", function(event, d) {
            tooltip.style("left", (event.pageX - 140) + "px")
                   .style("top", (event.pageY - 150) + "px")
        })
        .on("mouseout", function(event, d) {
            d3.select(this).attr("r", 5)
            tooltip.style("opacity", 0);
        })

    const stagess = [...new Set(data.map(d => d.stage_name))];

    stagess.forEach(stage => {
        const stageData = data.filter(d => d.stage_name === stage);
        const mean = d3.mean(stageData, d => d.card_difference);

        svg4.append("circle")
            .attr("cx", xScaleStrip(stage) + xScaleStrip.bandwidth() / 2)
            .attr("cy", yScaleStrip(mean))
            .attr("r", 9)
            .attr("fill", "gold")
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("opacity", 0.7)
            .on("mouseover", function(event, d) {
                d3.select(this).attr("r", 15)
                tooltip.style("opacity", 1)
                       .html(`Mean card difference in <b>${stage.charAt(0).toUpperCase() + stage.slice(1)}</b>: <br> ${Math.abs(mean.toFixed(3))} yellow cards`);
            })
            .on("mousemove", function(event, d) {
                tooltip.style("left", (event.pageX - 120) + "px")
                    .style("top", (event.pageY - 90) + "px")
            })
            .on("mouseout", function(event, d) {
                d3.select(this).attr("r", 9)
                tooltip.style("opacity", 0);
            })
        });

    })