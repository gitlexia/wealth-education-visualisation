/* global d3 */
//Author: Alexia Riner - 2026

// this reads the current colours from CSS so the chart can match the theme (light/dark mode)
function getThemeColors() {
    const styles = getComputedStyle(document.body);

    return {
        text: styles.getPropertyValue("--text").trim(),
        muted: styles.getPropertyValue("--muted").trim(),
        axis: styles.getPropertyValue("--axis").trim(),
        baseline: styles.getPropertyValue("--baseline").trim(),
        dotOpacity: +styles.getPropertyValue("--dot-opacity"),
        lineOpacity: +styles.getPropertyValue("--line-opacity"),
        inactiveOpacity: +styles.getPropertyValue("--inactive-opacity")
    };
}

// light/dark mode toggle
// reference code: https://fil.github.io/pangea/support/dark-mode
const themeButton = document.getElementById("theme-button");

//visually updates light/dark toggle button
function updateThemeButton() {
    const isLight = document.body.classList.contains("light-mode");
    if (isLight) {
        themeButton.textContent = "☾ Dark mode";
    } else {
        themeButton.textContent = "☀ Light mode";
    }
}

// stores selected countries from scatterplot clicks
let selectedCountries = [];
const MAX_SELECTED = 5;

//colour-blind safe palette
const COMPARISON_COLOURS = [
    "#0f65a1",
    "#ffbe6a",
    "#40b0a6",
    "#db4c77",
    "#295e11"
];
// defines variables, labels, and scales used to construct each axis in the bottom DNA chart
const DNA_METRICS = [
    { key: "primary_avg", label: "Primary enrol.", unit: "%", min: 0, max: 145, avg: 102.18 },
    { key: "secondary_avg", label: "Secondary enrol.", unit: "%", min: 0, max: 160, avg: 78.26 },
    { key: "tertiary_avg", label: "Tertiary enrol.", unit: "%", min: 0, max: 115, avg: 35.35 },
    { key: "completion_avg", label: "Completion rate", unit: "%", min: 0, max: 121, avg: 88 },
    { key: "gov_expenditure_pct_gdp", label: "Govt. spend", unit: "% GDP", min: 0, max: 13, avg: 4.4 }
];


// load the summary csv from the project folder
d3.csv("data/education_iwi_summary4.csv", d3.autoType).then(rawData => {

    // create variables for each needed column in the data
    const data = rawData.map(d => ({
        country: d.country,
        iwi: d.iwi,
        residual_scaled: d.residual_scaled,
        yearsAbove: d.yearsAbove,
        yearsBelow: d.yearsBelow,
        region: d.region,

        // bottom chart metrics only
        primary_avg: d.primary_avg,
        secondary_avg: d.secondary_avg,
        tertiary_avg: d.tertiary_avg,
        completion_avg: d.completion_avg,
        gov_expenditure_pct_gdp: d.gov_expenditure_pct_gdp
    }));

    buildScatter(data);
}).catch(error => {
});
function buildScatter(data) {
    // default region filtering is set to all to show all regions
    let activeRegion = "all";
    // default deviation filtering is set to strong to help reader digest data more easily
    let activeDeviation = "strong";

    // checks whether a country should be shown or faded based on current region and deviation filters
    function isVisible(d) {
        return (
            (activeRegion === "all" || d.region === activeRegion) &&
            (activeDeviation === "all" || Math.abs(d.residual_scaled) >= 10)
        );
    }

    // temporarily highlight the selected country from the dropdown
    function highlightCountryFromList(countryData) {
        if (!countryData) return;

        // find the specific dot (country)
        const target = svg.selectAll(".dot-g")
            .filter(d => d.country === countryData.country);

        if (target.empty()) return;

        // raise the targeted dot up and back down
        target.raise()
            .transition().duration(200)
            .attr("transform", d => `translate(${xScale(d.iwi)}, ${yScale(d.residual_scaled)}) scale(1.6)`)
            .transition().delay(1000).duration(200)
            .attr("transform", d => `translate(${xScale(d.iwi)}, ${yScale(d.residual_scaled)}) scale(1)`);
    }

// accessors to make the code easier to read
// reference code: https://observablehq.com/@yjunechoe/animating-residuals-wip
    const access = {
        predictor: d => d.iwi,
        residual_scaled: d => d.residual_scaled
    };

    // control how much marks grow on hover
    const defaultMarkScale = 1;     // normal size
    const hoverMarkScale = 1.6;     // enlarged size on hover

    // decide colour of stars and dots based on consistency over time
    function getColour(d) {
        if (d.yearsAbove >= 10 && d.residual_scaled > 0) return "#fab721";     // yellow (strong overperformer)
        if (d.yearsBelow >= 10 && d.residual_scaled < 0) return "#5a2716";     // dark orange (strong underperformer)
        return "#f4823f";                             // gold (mixed / occasional)
    }

    // add or remove a country from the selection (up to 5 for max limit) and updates linked views
    function toggleCountrySelection(countryName) {
        const alreadySelected = selectedCountries.includes(countryName);

        if (alreadySelected) {
            selectedCountries = selectedCountries.filter(name => name !== countryName);
        } else {
            if (selectedCountries.length >= MAX_SELECTED) return;
            selectedCountries.push(countryName);
        }
        renderSelectedCountries();
        renderDNALegend();
        renderDNA();
        updateScatterSelectionStyles();
    }

    // remove all selected countries from the comparison and resets the DNA legend and selected country bubbles
    function clearAllCountries() {
        selectedCountries = [];
        renderSelectedCountries();
        renderDNALegend();
        renderDNA();
        updateScatterSelectionStyles();
    }

    // return only the full data rows for currently selected countries
    function getSelectedData() {
        return selectedCountries
            .map(name => data.find(d => d.country === name))
            .filter(Boolean);
    }

    // create removable tags for countries selected from scatterplot
    // reference code: https://observablehq.com/@ambassadors/interactive-plot-dashboard
    function renderSelectedCountries() {
        const container = d3.select("#dna-selected");

        // display placeholder text if no countries have been selected yet
        if (!selectedCountries.length) {
            container.html(`
                <span class="dna-selected-empty">No countries selected yet</span>
            `);
            return;
        }

        const remaining = MAX_SELECTED - selectedCountries.length;

        container.html("");

        selectedCountries.forEach((countryName, i) => {
            const colour = COMPARISON_COLOURS[i % COMPARISON_COLOURS.length];

            const chip = container.append("div")
                .attr("class", "dna-chip")
                .style("border-color", colour)
                .style("color", colour);

            chip.append("span")
                .attr("class", "dna-chip-name")
                .text(countryName);

            chip.append("button")
                .attr("class", "dna-chip-remove")
                .attr("type", "button")
                .text("×")
                // create remove button option for country and refresh linked views
                .on("click", function () {
                    selectedCountries = selectedCountries.filter(name => name !== countryName);
                    renderSelectedCountries();
                    renderDNALegend();
                    renderDNA();
                    updateScatterSelectionStyles();
                });
        });

        // show how many selection slots are left
        container.append("span")
            .attr("class", "dna-slots-left")
            .text(
                remaining > 0
                    ? `${remaining} slot${remaining === 1 ? "" : "s"} remaining`
                    : "max selected"
            );
    }

    // visually update countries when they are selected by updating stroke and opacity of circles/stars
    function updateScatterSelectionStyles() {
        svg.selectAll(".dot-g path, .dot-g circle")
            .attr("stroke", d => selectedCountries.includes(d.country)
                ? getThemeColors().text
                : "rgba(255,255,255,0.3)")
            .attr("stroke-width", d => selectedCountries.includes(d.country) ? 2.2 : 0.8)
            .attr("opacity", d => isVisible(d) ? getThemeColors().dotOpacity : 0);
    }

    //The code below uses snippets of the following template to create the scatterplot
    // reference code: https://observablehq.com/@yjunechoe/animating-residuals-wip
    // chart size + margins
    const dims = {
        width: 900,
        height: 550,
        margin: {t: 30, r: 30, b: 60, l: 70}
    };

    dims.panel = {
        width: dims.width - dims.margin.l - dims.margin.r,
        height: dims.height - dims.margin.t - dims.margin.b
    };

    // get the svg from the html file
    const svg = d3.select("#chart")
        .attr("width", dims.width)
        .attr("height", dims.height);

    // get detail card from html file
    const detailCard = d3.select("#detail-card");

    // create inner group shifted by the margins
    const panel = svg.append("g")
        .attr("class", "panel")
        .attr("transform", `translate(${dims.margin.l}, ${dims.margin.t})`);

    // create inner group to hold the visual marks (circles and stars)
    const geoms = panel.append("g")
        .attr("class", "geoms");

    // add padding so points don't sit right on the edges
    function expand(domain) {
        const range = domain[1] - domain[0];
        const padding = range * 0.08;
        return [domain[0] - padding, domain[1] + padding];
    }

    // x scale = IWI
    const xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, dims.panel.width]);

    // y scale = residual
    const yScale = d3.scaleLinear()
        .domain(expand(d3.extent(data, access.residual_scaled)))
        .range([dims.panel.height, 0])
        .nice();

    // create the horizontal baseline at residual = 0 - this is the "expected" reference line
    geoms.append("line")
        .attr("class", "zero-line")
        .attr("x1", 0)
        .attr("x2", dims.panel.width)
        .attr("y1", yScale(0))
        .attr("y2", yScale(0))
        .attr("stroke", getThemeColors().baseline)
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "5,4")
        .style("opacity", 0.6);

    // make a group for each point so the dot and label move together
    const dotGroups = geoms.append("g")
        .attr("class", "dots")
        .selectAll(".dot-g")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "dot-g")
        .attr("transform", d =>
            `translate(${xScale(access.predictor(d))}, ${yScale(access.residual_scaled(d))})`
        );

    //make star symbol
    // reference code: https://d3js.org/d3-shape/symbol
    const starSymbol = d3.symbol()
        .type(d3.symbolStar)
        .size(150);

    // draw stars for consistent overperformers and circles for occasional over- or under-achievers
    dotGroups.each(function (d) {
        const group = d3.select(this);

        if (d.yearsAbove >= 10 && d.residual_scaled > 0) {
            group.append("path")
                .attr("d", starSymbol())
                .attr("fill", getColour(d))
                .attr("stroke", "rgba(255,255,255,0.3)")
                .attr("stroke-width", 0.8)
                .attr("opacity", isVisible(d) ? getThemeColors().dotOpacity : 0);

        } else if (
            (d.residual_scaled > 0 && d.yearsAbove >= 5) ||
            (d.residual_scaled < 0 && d.yearsBelow >= 5)
        ) {
            group.append("circle")
                .attr("r", 7)
                .attr("fill", getColour(d))
                .attr("stroke", "rgba(255,255,255,0.3)")
                .attr("stroke-width", 0.8)
                .attr("opacity", isVisible(d) ? getThemeColors().dotOpacity : 0);
        }
    });

// The code below uses bits from the following templates:
// reference code: https://observablehq.com/@d3/line-with-tooltip/2 and https://observablehq.com/@javpascal/scatterplot-with-hover-effect
    // attach interactions to each scatterplot point
    dotGroups
        // when mouse hovers over a country, scale up point so that it stands out
        .on("mouseover", function (event, d) {
            d3.select(this)
                .raise()
                .transition()
                .duration(150)
                .attr(
                    "transform",
                    `translate(${xScale(access.predictor(d))}, ${yScale(access.residual_scaled(d))}) scale(${hoverMarkScale})`
                );

            // show the detail card
            showScatterTooltip(event, d);
        })
        // anchor tooltip to mouse while hovering over a point
        .on("mousemove", function (event) {
            moveScatterTooltip(event);
        })
        // when mouse leaves a country, return point to original size and hide the detail card
        .on("mouseleave", function (event, d) {
            d3.select(this)
                .transition()
                .duration(150)
                .attr(
                    "transform",
                    `translate(${xScale(access.predictor(d))}, ${yScale(access.residual_scaled(d))}) scale(${defaultMarkScale})`
                );
            hideScatterTooltip();
        })
        // toggle clicked country in the selection
        .on("click", function (event, d) {
            toggleCountrySelection(d.country);
        });

    // draw the x-axis
    panel.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${dims.panel.height})`)
        .call(d3.axisBottom(xScale).ticks(8));

    // draw the y-axis
    panel.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale).ticks(8));

    // format x axis label
    panel.append("text")
        .attr("class", "axis-label")
        //center IWI horizontally
        .attr("x", dims.panel.width / 1.8)
        // push below x-axis
        .attr("y", dims.panel.height + 50)
        .attr("text-anchor", "end")
        .style("fill", getThemeColors().text)
        .style("font-size", "16px")
        .text("Wealth (IWI) ");

    // format y axis label
    panel.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        //vertically center Residual
        .attr("x", -400)
        .attr("y", -50)
        // push left of y-axis
        .style("fill", getThemeColors().text)
        .style("font-size", "16px")
        .text("Residual (edu above/below expected)");

    // use current theme colours for axis lines and labels
    svg.selectAll(".axis path, .axis line")
        .attr("stroke", getThemeColors().axis);

    svg.selectAll(".axis text")
        .attr("fill", getThemeColors().text)
        .style("font-size", "12px");

    // update colour themes for dark and light modes
    function updateTheme() {
        const theme = getThemeColors();

        // axis lines
        svg.selectAll(".axis path, .axis line")
            .attr("stroke", theme.axis);

        // axis tick labels
        svg.selectAll(".axis text")
            .style("fill", theme.text)
            .style("font-size", "12px");

        // axis titles
        svg.selectAll(".axis-label")
            .style("fill", theme.text);

        // zero line
        svg.select(".zero-line")
            .attr("stroke", theme.baseline);
    }

    function updateVisibility() {
        // fade the stars/circles inside each group
        svg.selectAll(".dot-g path, .dot-g circle")
            .transition()
            .duration(250)
            .attr("opacity", d => isVisible(d) ? getThemeColors().dotOpacity : 0);

        // disable hover for filtered out groups
        svg.selectAll(".dot-g")
            .style("pointer-events", d => isVisible(d) ? "all" : "none");
    }

    // hook up region filter button created in HTML
    document.querySelectorAll(".filter-button").forEach(button => {
        button.addEventListener("click", () => {
            activeRegion = button.dataset.region;

            document.querySelectorAll(".filter-button").forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");

            updateVisibility();
            renderCountrySelect();
        });
    });

    // hook up deviation button created in HTML
    document.querySelectorAll(".deviation-button").forEach(button => {
        button.addEventListener("click", () => {
            activeDeviation = button.dataset.deviation;

            document.querySelectorAll(".deviation-button").forEach(btn => {
                btn.classList.remove("active");
            });
            button.classList.add("active");

            updateVisibility();
            renderCountrySelect();
        });
    });

    // formats and returns a label describing a country's performance relative to expected
    function getPerformanceLabel(d) {
        if (d.residual_scaled > 0) {
            if (d.yearsAbove >= 10) {
                return `★ Consistent overachievers - ${d.yearsAbove} yrs above`;
            }
            return `${d.yearsAbove} yrs above expected`;
        }
        if (d.residual_scaled < 0) {
            return `${d.yearsBelow} yrs below expected`;
        }
        return "On expected line";
    }

    // formats the residual with a sign and above/below expected label
    // reference code: https://observablehq.com/@yjunechoe/animating-residuals-wip
    function getResidualLabel(d) {
        if (d.residual_scaled > 0) return `+${d.residual_scaled} pts above expected`;
        return `${d.residual_scaled} pts below expected`;
    }

    // show and position the tooltip for scatterplot with details for the hovered country
    // reference code: https://observablehq.com/@javpascal/scatterplot-with-hover-effect
    function showScatterTooltip(event, d) {
        detailCard
            .style("display", "block")
            .style("opacity", 1)
            // populate tooltip content
            .html(`
                <div class="detail-title">${d.country}</div>
                <div class="detail-line">${d.region}</div>
                <div class="detail-line">IWI: ${d3.format(".2f")(d.iwi)}</div>
                <div class="detail-line">${getPerformanceLabel(d)}</div>
                <div class="detail-line">${getResidualLabel(d)}</div>
                <div class="detail-line">Click to add to comparison</div>
            `)
            .style("left", `${event.offsetX + 40}px`)
            .style("top", `${event.offsetY + 40}px`);
    }

    // move tooltip to follow cursor in the scatterplot
    function moveScatterTooltip(event) {
        detailCard
            .style("left", `${event.offsetX + 40}px`)
            .style("top", `${event.offsetY + 40}px`);
    }

    // fade out and hide the tooltip for scatterplot
    function hideScatterTooltip() {
        detailCard
            .transition()
            .duration(200)
            .style("opacity", 0)
            .on("end", function () {
                detailCard.style("display", "none");
            });
    }

    // DNA tooltip based on the scatter hover reference pattern:
    // reference code: https://observablehq.com/@d3/line-with-tooltip/2 and https://observablehq.com/@javpascal/scatterplot-with-hover-effect
    // get dna tooltip card from html file
    const dnaTooltip = d3
        .select("#dna-tooltip")
        .html("")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    // show and position the tooltip for parallel dot plot (DNA chart) with details for the hovered country
    function showDNATooltip(event, d) {
        const diff = d.value - d.avg;
        const diffLabel = `${diff >= 0 ? "+" : ""}${d3.format(".1f")(diff)}`;
        dnaTooltip
            .style("opacity", 1)
            .html(`
                <div class="detail-title">${d.country}</div>
                <div class="detail-line">${d.metricLabel}</div>
                <div class="detail-line">Value: ${d3.format(".2f") (d.value)} ${d.metricUnit}</div>
                <div class="detail-line">IWI: ${d3.format(".2f")(d.iwi)}</div>
                <div class="detail-line">${diffLabel} vs average</div>
            `)
            .style("left", `${event.offsetX + 40}px`)
            .style("top", `${event.offsetY + 40}px`);
    }

    // move tooltip to follow cursor in DNA chart
    function moveDNATooltip(event) {
        dnaTooltip
            .style("left", `${event.offsetX + 40}px`)
            .style("top", `${event.offsetY + 40}px`);
    }

    // fade out and hide the tooltip in DNA chart
    function hideDNATooltip() {
        dnaTooltip
            .transition()
            .duration(200)
            .style("opacity", 0);
    }

    // clear button for DNA chart (parallel dot plot/coordinates)
    document.getElementById("clear-comparison").addEventListener("click", clearAllCountries);

    // when user hovers over country in DNA chart, enlarge the same country in scatterplot to show a connection
    function highlightScatterCountry(countryName) {
        svg.selectAll(".dot-g")
            .filter(d => d.country === countryName)
            .raise()
            .transition()
            .duration(150)
            .attr("transform", d =>
                `translate(${xScale(access.predictor(d))}, ${yScale(access.residual_scaled(d))}) scale(${hoverMarkScale})`
            );
    }

    // return country to normal size once hovering stops in DNA chart
    function resetScatterCountry(countryName) {
        svg.selectAll(".dot-g")
            .filter(d => d.country === countryName)
            .transition()
            .duration(150)
            .attr("transform", d =>
                `translate(${xScale(access.predictor(d))}, ${yScale(access.residual_scaled(d))}) scale(${defaultMarkScale})`
            );
    }

    // builds the DNA chart showing selected countries across education and structural metrics
    // reference code: https://observablehq.com/@miralemd/parallel-coordinates-plot
    function renderDNA() {
        const selectedData = getSelectedData();
        const wrap = d3.select("#dna-wrap");
        // clear previous chart contents
        wrap.html("");

        // show hint if no countries are selected
        if (!selectedData.length) {
            wrap.html(`
                <div class="dna-empty">
                    Click countries in the constellation scatterplot above to compare them here
                </div>
            `);
            return;
        }

        // set dimensions for the DNA parallel coordinates/dot plot
        const dnaDims = {
            width: 1000,
            height: 300,
            margin: {t: 55, r: 30, b: 45, l: 30}
        };

        dnaDims.panel = {
            width: dnaDims.width - dnaDims.margin.l - dnaDims.margin.r,
            height: dnaDims.height - dnaDims.margin.t - dnaDims.margin.b
        };

        const svgDNA = wrap.append("svg")
            .attr("id", "dna-chart")
            .attr("width", dnaDims.width)
            .attr("height", dnaDims.height);

        const panelDNA = svgDNA.append("g")
            .attr("transform", `translate(${dnaDims.margin.l}, ${dnaDims.margin.t})`);

        // evenly space metric positions across the width - this follows the same basic parallel-coordinates layout idea
        const xMetric = d3.scalePoint()
            .domain(DNA_METRICS.map(d => d.key))
            .range([0, dnaDims.panel.width])
            .padding(0.2);

        // one y-scale per metric
        const yScales = {};
        DNA_METRICS.forEach(metric => {
            yScales[metric.key] = d3.scaleLinear()
                .domain([metric.min, metric.max])
                .range([dnaDims.panel.height, 0]);
        });

        // subtle alternating column backgrounds
        panelDNA.selectAll(".dna-column-bg")
            .data(DNA_METRICS)
            .enter()
            .append("rect")
            .attr("class", "dna-column-bg")
            .attr("x", d => xMetric(d.key) - 45)
            .attr("y", 0)
            .attr("width", 90)
            .attr("height", dnaDims.panel.height)
            .attr("fill", document.body.classList.contains("light-mode")
                ? "rgba(0,0,0,0.06)"
                : "rgba(255,255,255,0.06)"
            )
            // highlight columns is hidden by default
            .style("opacity", 0)
            .style("cursor", "pointer")

            // hover over each column to isolate it
            // reference code: https://observablehq.com/@y3l2n/scatterplot-with-brushing
            .on("mouseenter", function (event, metric) {

                // show only hovered column
                d3.selectAll(".dna-column-bg")
                    .style("opacity", d => d.key === metric.key ? 0.9 : 0);

                // fade other dots
                d3.selectAll(".dna-dot")
                    .style("opacity", d =>
                        d.metricKey === metric.key
                            ? getThemeColors().dotOpacity
                            : getThemeColors().inactiveOpacity
                    );
            })

            // when user stops hovering, hide all column highlights again
            .on("mouseleave", function () {
                d3.selectAll(".dna-column-bg")
                    .style("opacity", 0);

                // restore dots
                d3.selectAll(".dna-dot")
                    .style("opacity", 0.7);
            });

        // draw each vertical axis
        DNA_METRICS.forEach(metric => {
            panelDNA.append("g")
                .attr("class", "dna-axis")
                .attr("transform", `translate(${xMetric(metric.key)}, 0)`)
                .call(d3.axisLeft(yScales[metric.key]).ticks(5));

            // show average reference tick across each axis
            panelDNA.append("line")
                .attr("class", "dna-avg-line")
                .attr("x1", xMetric(metric.key) - 28)
                .attr("x2", xMetric(metric.key) + 28)
                .attr("y1", yScales[metric.key](metric.avg))
                .attr("y2", yScales[metric.key](metric.avg));

            // create axis title for current metric
            panelDNA.append("text")
                .attr("class", "dna-axis-label")
                .attr("x", xMetric(metric.key))
                .attr("y", -26)
                .attr("text-anchor", "middle")
                .style("fill", getThemeColors().text)
                .style("font-size", "14px")
                .style("font-weight", "600")
                .text(metric.label);

            // create unit label shown below axis title
            panelDNA.append("text")
                .attr("class", "dna-axis-unit")
                .attr("x", xMetric(metric.key))
                .attr("y", -12)
                .attr("text-anchor", "middle")
                .style("fill", getThemeColors().muted)
                .style("font-size", "10px")
                .text(`(${metric.unit})`);

            //create label for global average reference line
            panelDNA.append("text")
                .attr("class", "dna-axis-unit")
                .attr("x", xMetric(metric.key) + 33)
                .attr("y", yScales[metric.key](metric.avg) + 3)
                .attr("text-anchor", "start")
                .style("fill", getThemeColors().muted)
                .style("font-size", "12px")
                .text(`avg ${metric.avg}`);
        });

        // define how connector lines are drawn - if structural factor is missing, do not draw a line
        const connectorLine = d3.line()
            .defined(d => d != null)
            .x(d => xMetric(d.metric))
            .y(d => d.y)
            .curve(d3.curveLinear);

        // create a group for each selected country to hold its line and points
        const countryGroups = panelDNA.selectAll(".dna-country")
            .data(selectedData, d => d.country)
            .enter()
            .append("g")
            .attr("class", "dna-country");

        // draw connector lines between structural factors using designated colour palette
        countryGroups.append("path")
            .attr("class", "dna-connector")
            .attr("fill", "none")
            .attr("stroke", (d, i) => COMPARISON_COLOURS[i % COMPARISON_COLOURS.length])
            .attr("stroke-width", 2)
            .attr("opacity", getThemeColors().lineOpacity)
            .attr("d", d => {
                const coords = DNA_METRICS
                    .map(metric => {
                        const val = d[metric.key];
                        if (val == null || isNaN(val)) return null;

                        return {
                            metric: metric.key,
                            y: yScales[metric.key](val)
                        };
                    })
                    .filter(Boolean);

                return connectorLine(coords);
            });

        // draw dots on each axis for each selected country
        const dnaDots = countryGroups.selectAll(".dna-dot")
            .data((d, i) => DNA_METRICS.map(metric => {
                const val = d[metric.key];
                if (val == null || isNaN(val)) return null;

                return {
                    country: d.country,
                    iwi: d.iwi,
                    metricKey: metric.key,
                    metricLabel: metric.label,
                    metricUnit: metric.unit,
                    value: val,
                    avg: metric.avg,
                    x: xMetric(metric.key),
                    y: yScales[metric.key](val),
                    colour: COMPARISON_COLOURS[i % COMPARISON_COLOURS.length]
                };
            }).filter(Boolean))
            .enter()
            .append("circle")
            .attr("class", "dna-dot")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 8)
            .attr("fill", d => d.colour)
            .attr("opacity", getThemeColors().dotOpacity);

        dnaDots
            // when mouse hovers over a country, scale up point so that it stands out
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .raise()
                    .transition()
                    .duration(120)
                    .attr("r", 10)
                    .attr("opacity", 1);

                //enlarge country in scatterplot when selected on DNA chart
                highlightScatterCountry(d.country);
                // show tooltip
                showDNATooltip(event, d);
            })

            // anchor tooltip to mouse while hovering over a point
            .on("mousemove", function (event) {
                moveDNATooltip(event);
            })
            // when mouse leaves a country, return point to original size and hide the detail card
            .on("mouseleave", function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(120)
                    .attr("r", 8)
                    .attr("opacity", getThemeColors().dotOpacity);

                //return country in scatterplot to normal size
                resetScatterCountry(d.country);
                hideDNATooltip();
            });
    }

    // builds a dynamic legend for the DNA chart where selected countries appear as coloured circles
    // the dashed global average reference is always shown
    // reference code: https://d3-legend.susielu.com/ and https://d3-graph-gallery.com/graph/custom_legend.html
    function renderDNALegend() {
        const legend = d3.select("#dna-legend");

        legend.html("");

        // always show the global average legend item first
        const avgItem = legend.append("div")
            .attr("class", "dna-legend-item");

        avgItem.append("span")
            .attr("class", "dna-legend-dash");

        avgItem.append("span")
            .text("Global avg");

        // if no countries are selected, show hint after the '---Global avg'
        if (!selectedCountries.length) {
            legend.append("span")
                .attr("class", "dna-legend-empty")
                .text("Selected countries will appear here");
            return;
        }

        // add one coloured circle item per selected country in the legend
        selectedCountries.forEach((countryName, i) => {
            const colour = COMPARISON_COLOURS[i % COMPARISON_COLOURS.length];

            const item = legend.append("div")
                .attr("class", "dna-legend-item");

            item.append("span")
                .attr("class", "dna-legend-dot")
                .style("background", colour);

            item.append("span")
                .text(countryName);
        });
    }
    // writes the explanatory note below the DNA chart
    function renderDNAFooterNote() {
        d3.select("#dna-footer-note").html(`
            Structural factors are averaged across 2000–2020 to show long-term patterns and reduce noise. The dashed line marks the global average across all countries.
        `);
    }

    // build country list so user can manually select from list of available countries shown
    // reference code: https://stackoverflow.com/questions/32177431/d3js-map-selectable-country-list
    function renderCountrySelect() {
        d3.select("#selectContainer").html("");

        d3.select("#selectContainer")
            .append("div")
            .attr("id", "selection");

        d3.select("#selection")
            .append("label")
            .attr("for", "countrySelect")
            .attr("class", "labelSelect")
            .text("Select a country:");

        const refSelect = d3.select("#selection")
            .append("select")
            .attr("id", "countrySelect")
            .attr("aria-label", "Select a country")
            .on("change", changeCountry);

        //returns alphabetically sorted list of countries that pass the selected filters
        const visibleCountries = data
            .filter(isVisible)
            .sort((a, b) => a.country.localeCompare(b.country));

        // add placeholder option 'Choose a country'
        refSelect.append("option")
            .attr("value", "")
            .property("selected", true)
            .text("Choose a country");

        // populate the dropdown with visible countries only
        const refOptions = refSelect.selectAll(".country-option")
            .data(visibleCountries, d => d.country);
        refOptions.enter()
            .append("option")
            .attr("class", "country-option")
            .attr("value", d => d.country)
            .text(d => d.country);
    }

    // when a country is chosen from the dropdown, briefly highlight it in the scatterplot and add to DNA chart
    function changeCountry() {
        const s = d3.select(this);
        const i = s.property("selectedIndex");
        const d = s.selectAll("option").data()[i];

        if (!d) return;

        // briefly highlight selected scatter point without showing tooltip
        highlightCountryFromList(d);

        // add country to DNA chart if it is not already selected
        if (!selectedCountries.includes(d.country) && selectedCountries.length < MAX_SELECTED) {
            selectedCountries.push(d.country);
            renderSelectedCountries();
            renderDNALegend();
            renderDNA();
            updateScatterSelectionStyles();
        }

        // reset dropdown back to placeholder after country is selected
        s.property("selectedIndex", 0);
    }
    // legend to explain colour + shape encodings used in the scatterplot
    // reference code: https://d3-graph-gallery.com/graph/custom_legend.html
    const legend = d3.select("#legend");
    legend.html(`
  <div class="legend-item">
    <div class="legend-star">★</div>
    <div class="legend-text">
      <div class="legend-title">Consistent overachievers</div>
      <div class="legend-sub">≥10 years above expected line</div>
    </div>
  </div>

  <div class="legend-item">
    <div class="legend-symbol" style="background:#f4823f;"></div>
    <div class="legend-text">
      <div class="legend-title">Occasional over/under-achiever</div>
      <div class="legend-sub"> 5-9 years above or below expected</div>
    </div>
  </div>

  <div class="legend-item">
    <div class="legend-symbol" style="background:#5a2716;"></div>
    <div class="legend-text">
      <div class="legend-title">Below expected</div>
      <div class="legend-sub">≥10 years below expected</div>
    </div>
  </div>

  <div class="legend-item">
    <div class="legend-line"></div>
    <div class="legend-text">
      <div class="legend-title">Zero line (expected)</div>
    </div>
  </div>
`);
    // regenerate plot style and controls when light/dark mode changes
    themeButton.onclick = () => {
        document.body.classList.toggle("light-mode");
        updateThemeButton();
        updateTheme();
        updateVisibility();
        renderCountrySelect();
        renderSelectedCountries();
        renderDNAFooterNote();
        renderDNALegend();
        renderDNA();
        updateScatterSelectionStyles();
    };

    // initial render on page load
    updateThemeButton();
    updateTheme();
    updateVisibility();
    renderCountrySelect();
    renderSelectedCountries();
    renderDNAFooterNote();
    renderDNALegend();
    renderDNA();
    updateScatterSelectionStyles();
}
