[**🌐 View the Live Interactive Visualisation →**](https://gitlexia.github.io/wealth-education-visualisation/)

# Wealth & Education: Interactive Global Data Visualisation

**D3.js · JavaScript · Data Visualisation · Interactive Web Development**

An interactive data visualisation exploring a central question:

> **Which countries consistently deviate from their expected education levels relative to their IWI, and what do these countries have in common?**

The project uses an interactive residual scatterplot and a linked multi-dimensional comparison view to identify countries whose educational outcomes are consistently higher or lower than expected relative to their wealth level.

Users can filter countries geographically, isolate large deviations, inspect individual countries, and compare structural education indicators across up to five countries simultaneously.

**Developed by Alexia Riner · 2026**

---

## Overview

National wealth and educational outcomes are related, but wealth alone does not fully explain how countries perform educationally.

This visualisation focuses on the countries that **deviate from that expected relationship**.

Rather than simply asking which countries have the highest educational indicators, the project asks:

* Which countries perform **better than expected** relative to their IWI?
* Which perform **worse than expected**?
* Are these deviations persistent over time?
* What structural educational characteristics do unusually performing countries share?

The interface combines two linked visualisations:

1. A **Residual Constellation Scatterplot** showing educational deviation relative to IWI.
2. A **Structural Factor "DNA" Comparison** allowing selected countries to be compared across five education-related indicators.

Together, the views support both high-level pattern discovery and detailed country-level investigation.

---

# Key Features

### Interactive Residual Analysis

Countries are positioned according to:

```text
X-axis → IWI
Y-axis → Education residual
```

The horizontal zero line represents the expected education level.

Countries above the line are performing above expectation, while countries below it are performing below expectation.

---

### Regional Filtering

The scatterplot can be filtered interactively across six geographic regions:

* Asia/Pacific
* Europe
* Latin America
* Sub-Saharan Africa
* North America
* Middle East/North Africa

Users can also return to a global view using the **All** filter.

---

### Strong-Deviation Filtering

The interface includes two deviation modes:

```text
All deviations
```

and:

```text
Strong deviations |residual| ≥ 10
```

The strong-deviation view is enabled by default to make unusually performing countries easier to identify.

---

### Long-Term Consistency Encoding

The visualisation distinguishes between countries that deviate occasionally and countries whose performance remains consistently above or below expectation.

Countries must have at least **five years** of corresponding above- or below-expected performance to be displayed.

The visual encoding differentiates:

* ★ **Consistent overachievers** — at least 10 years above expected
* ● **Occasional over/under-achievers** — 5–9 years above or below expected
* ● **Consistent underperformers** — at least 10 years below expected

This allows the visualisation to emphasize persistent patterns rather than isolated annual fluctuations.

---

# Residual Constellation Scatterplot

The primary visualisation plots each country according to its IWI and scaled educational residual.

Conceptually:

```text
 Education
 above
 expectation
      ↑
      │          ★ Country A
      │
      │    ●
──────┼────────────────────── Expected performance
      │
      │              ●
      │       ●
      ↓
 Education
 below
 expectation

      └─────────────────────→ IWI
```

A residual close to zero indicates that educational performance is relatively close to what would be expected at that IWI level.

A positive residual indicates:

```text
Education performance > expected performance
```

while a negative residual indicates:

```text
Education performance < expected performance
```

---

# Interactive Country Exploration

Each scatterplot point supports several interactions.

### Hover

Hovering over a country enlarges its mark and displays a detail card containing information including:

* Country
* Region
* IWI
* Educational deviation
* Consistency above or below expectation

### Click

Clicking a country adds it to the structural comparison panel.

### Country Search

Countries can also be selected using an alphabetically sorted dropdown.

Selecting a country:

1. Locates it in the scatterplot
2. Temporarily highlights the corresponding point
3. Adds it to the structural comparison

---

# Linked Visualisations

One of the central interaction features is the connection between the scatterplot and the structural-factor chart.

Users can select up to:

```text
5 countries
```

at once.

The same selection state is shared between both visualisations.

This means that selecting a country from the scatterplot automatically updates the lower comparison chart.

Selected countries are also given distinctive visual styling in the scatterplot.

The interface supports:

* Adding countries
* Removing individual countries
* Clearing the complete comparison
* Country selection chips
* Dynamic legends
* Cross-view highlighting

---

# Structural Factor "DNA" Comparison

The second visualisation examines potential structural differences between selected countries.

Each country is compared across five indicators:

| Indicator              | Unit  |
| ---------------------- | ----- |
| Primary enrolment      | %     |
| Secondary enrolment    | %     |
| Tertiary enrolment     | %     |
| Completion rate        | %     |
| Government expenditure | % GDP |

The indicators are averaged across the available **2000–2020** period to emphasize longer-term patterns rather than short-term variation.

---

## Parallel Comparison

Each vertical axis represents a different structural metric.

For example:

```text
Primary     Secondary     Tertiary     Completion     Govt.
Enrolment   Enrolment     Enrolment       Rate       Spend
    │           │             │             │           │
    ●───────────●─────────────●─────────────●───────────●
    │           │             │             │           │
    │     ●─────●─────────────●──────●──────●           │
    │           │             │             │           │
```

Each selected country receives its own line and colour, allowing structural profiles to be compared directly.

---

## Global Average Reference

Each metric contains a dashed reference indicating the global average.

This makes it possible to see not only how selected countries compare with each other but also whether they fall above or below the overall dataset average.

Hovering over a data point provides:

* Exact value
* Country
* IWI
* Difference from the corresponding global average

---

# Cross-View Interaction

The two charts are designed as a linked system rather than independent graphics.

For example:

```text
Hover country in DNA chart
            ↓
Corresponding scatterplot point enlarges

Click country in scatterplot
            ↓
Country added to DNA comparison

Remove country chip
            ↓
Both visualisations update
```

This allows users to move naturally between identifying statistical outliers and investigating their structural characteristics.

---

# Dataset

The visualisation uses a processed country-level dataset stored in:

```text
data/education_iwi_summary4.csv
```

The final dataset contains **191 country records** across six geographical regions.

The processed data includes fields for:

```text
Country
ISO code
Region
GDP PPP
IWI
IWI source
Education composite
Expected education
Residual performance
Scaled residual
Primary enrolment
Secondary enrolment
Tertiary enrolment
Completion rate
Government expenditure as % GDP
Years above expectation
Years below expectation
Years of available data
Minimum year
Maximum year
```

The data represented in the interface covers observations spanning **2000–2020**.

---

# Data Representation

Several processed variables drive the visualisation.

### IWI

```text
iwi
```

provides the wealth-related position used on the horizontal axis.

### Expected Education

```text
edu_expected
```

represents the education value expected relative to the underlying wealth relationship.

### Education Residual

The dataset contains:

```text
residual_performance
residual_z
residual_scaled
```

The interactive visualisation uses:

```text
residual_scaled
```

as the displayed residual measure.

Positive values indicate performance above expectation.

Negative values indicate performance below expectation.

---

# Consistency Over Time

The project does not classify countries solely from their aggregate residual.

Two additional variables are used:

```text
yearsAbove
yearsBelow
```

These record how consistently a country falls above or below expectation across the available observations.

The interface therefore separates:

```text
Magnitude of deviation
        +
Persistence of deviation
```

rather than treating a large one-time difference and a long-running pattern as equivalent.

---

# Technology Stack

## Front-End Development

* HTML5
* CSS3
* JavaScript
* DOM manipulation

## Data Visualisation

* D3.js v7
* SVG
* Dynamic scales and axes
* Data joins
* Transitions
* Interactive tooltips
* Symbol encoding
* Linked views
* Parallel-coordinate-style comparison

## Data

* CSV
* D3 CSV parsing
* Automatic type conversion

## UI / Interaction

* Dynamic filtering
* Multi-selection
* Hover interactions
* Linked highlighting
* Country dropdown
* Theme switching
* Dynamic legends
* Selection chips

---

# D3.js Implementation

The visualisations are created programmatically using **D3.js** rather than being rendered as static images.

The project makes use of functionality including:

```javascript
d3.csv()
d3.autoType()
d3.scaleLinear()
d3.scalePoint()
d3.axisBottom()
d3.axisLeft()
d3.symbol()
d3.symbolStar()
d3.line()
d3.curveLinear()
```

D3 is also used to manage:

* SVG creation
* Data binding
* Attribute updates
* Transitions
* Event handling
* Tooltips
* Interactive filtering
* Dynamic legends
* Cross-chart state changes

---

# Application Architecture

The application follows a lightweight client-side architecture:

```text
education_iwi_summary4.csv
            │
            ▼
       D3 CSV Loader
            │
            ▼
      Data Mapping
            │
            ▼
    ┌───────┴────────┐
    │                │
    ▼                ▼
Scatterplot     Shared Selection
                     State
                      │
                      ▼
                DNA Comparison
```

Shared application state is maintained through:

```javascript
let selectedCountries = [];
```

with a maximum comparison size of:

```javascript
const MAX_SELECTED = 5;
```

When selection state changes, the relevant views are re-rendered or restyled.

---

# Visual Encoding

The scatterplot uses both **shape and colour** to communicate consistency.

### Consistent Overachiever

```text
★
```

A star identifies countries with at least ten years of above-expected performance.

### Occasional Deviation

A circular mark represents countries with 5–9 years of corresponding above- or below-expected performance.

### Consistent Underperformance

Countries with at least ten years below expectation use a distinct darker colour.

The structural comparison uses a separate five-colour palette so that selected countries remain distinguishable.

---

# Light and Dark Modes

The application supports both:

```text
☀ Light mode
```

and:

```text
☾ Dark mode
```

Theme colours are controlled using CSS custom properties:

```css
--bg
--panel
--text
--muted
--axis
--baseline
--button-border
--dot-opacity
```

The D3 visualisations read these CSS properties dynamically so that axes, reference lines, text, and chart elements update when the theme changes.

This keeps the SVG visualisations synchronized with the surrounding interface rather than maintaining separate hard-coded themes.

---

# User Experience Considerations

Several design choices were made to prevent a large international dataset from becoming visually overwhelming.

### Progressive Filtering

The application initially emphasizes strong deviations:

```text
|residual| ≥ 10
```

while allowing users to reveal smaller deviations when desired.

### Maximum Comparison Size

The structural comparison is limited to five countries.

This prevents excessive overlapping lines and preserves readability.

### Linked Highlighting

Hovering and selecting objects in one view affects the corresponding representation elsewhere.

### Contextual Details

Detailed values are displayed on demand through tooltips instead of permanently adding labels to every country.

### Persistent Reference Points

The residual zero line and structural global averages provide visual anchors throughout exploration.

---

# Project Structure

```text
wealth-education-visualisation/
│
├── index.html
├── style.css
├── script.js
│
└── data/
    ├── education_iwi_summary3.csv
    └── education_iwi_summary4.csv
```

### `index.html`

Defines the application structure, controls, chart containers, legends, and D3 dependency.

### `style.css`

Controls layout, themes, visual styling, tooltips, buttons, legends, selection elements, and chart presentation.

### `script.js`

Contains the D3 visualisation logic and application interactions, including:

* Data loading
* Scatterplot construction
* Filtering
* Tooltips
* Country selection
* Theme management
* Structural comparison chart
* Cross-chart highlighting
* Legends

### `data/`

Contains the processed country-level data used by the visualisation.

---

# Running Locally

Because the project loads its CSV using JavaScript, it should be served through a local web server rather than opened directly from the filesystem.

## Option 1 — Python

From the repository directory:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

in a browser.

---

## Option 2 — VS Code Live Server

If using Visual Studio Code:

1. Install the **Live Server** extension.
2. Open `index.html`.
3. Select **Open with Live Server**.

---

# No Build Step Required

The project intentionally uses a lightweight front-end stack.

There is no:

```text
npm install
```

or framework build process required.

D3 v7 is loaded from its CDN:

```html
<script src="https://d3js.org/d3.v7.min.js"></script>
```

and the application can run directly from a static web server.

This also makes the project suitable for static hosting such as GitHub Pages.

---

# Implementation Highlights

This project demonstrates several concepts beyond producing a basic D3 chart.

### Shared Interactive State

Selections are synchronized across multiple visualisations.

### Coordinated Views

The scatterplot and structural comparison respond to one another.

### Dynamic Filtering

Filters change mark visibility without requiring the page to reload.

### Dynamic DOM Generation

Country chips, legends, dropdown entries, SVG marks, axes, and tooltips are generated or updated programmatically.

### Data-Driven Styling

Country appearance depends directly on residual direction, persistence, filter state, and selection state.

### Animated Interaction

D3 transitions provide visual feedback when countries are hovered or selected.

### Multi-Dimensional Comparison

A second view transforms selected countries into comparable profiles across heterogeneous indicators with independent scales.

---

# Accessibility & Visual Design

The interface incorporates several accessibility-oriented design choices, including:

* Explicit light and dark themes
* A colour-conscious comparison palette
* Shape as well as colour encoding for important categories
* Large interactive controls
* Descriptive chart hints
* ARIA labels on key interface elements
* Textual legends explaining visual encodings
* Hover detail cards for precise values

Important information such as consistent overperformance is therefore not communicated by colour alone.

---

# Limitations

## Processed Data

This repository contains the **processed country-level summaries used by the visualisation**, but it does not contain the upstream data-processing code used to construct every derived variable.

As a result, the repository is primarily a visualisation and interactive-analysis project rather than a fully reproducible raw-data analysis pipeline.

## Country-Level Aggregation

National averages can hide substantial variation within countries.

The visualisation should therefore be interpreted as a comparison of country-level patterns rather than individual educational experiences.

## Residual Interpretation

A residual identifies a difference between observed and expected educational performance within the underlying model.

It does not by itself establish why that difference exists.

The structural-factor comparison is intended to support exploration rather than establish causality.

## Missing and Unequal Data Coverage

Countries may have differing amounts of available historical data.

The dataset therefore includes variables such as:

```text
years_data
year_min
year_max
```

to retain information about temporal coverage.

## Desktop-Oriented Layout

The current visualisation uses large fixed SVG dimensions and is best viewed on a desktop or laptop display.

Responsive SVG scaling would be a useful future improvement.

---

# Future Improvements

Potential extensions include:

* Fully responsive chart sizing
* Mobile-specific interaction design
* Keyboard navigation for visualisation elements
* More comprehensive screen-reader support
* Search-based country filtering
* Animated transitions between regional filters
* URL-based state sharing
* Exportable country comparisons
* Downloadable chart images
* Additional structural indicators
* Time-series exploration
* Per-year residual analysis
* Regional aggregate comparisons
* Confidence or uncertainty information
* Direct display of data availability
* Integration of the upstream preprocessing pipeline
* Automated tests for interaction logic

A particularly useful extension would be allowing users to move between the long-term aggregate view and individual yearly observations to see **when** a country's deviation emerged and whether it changed over time.

---

# What This Project Demonstrates

This project demonstrates practical experience across both **data visualisation and front-end development**.

### JavaScript

* Application state
* Event-driven interaction
* DOM manipulation
* Data transformation
* Modular visualisation logic

### D3.js

* Data joins
* SVG graphics
* Scales
* Axes
* Symbols
* Lines
* Transitions
* Dynamic filtering
* Interactive tooltips
* Linked views

### Data Visualisation

* Residual plots
* Multi-dimensional comparison
* Visual encoding
* Reference baselines
* Information hierarchy
* Interactive exploratory analysis

### Front-End Development

* HTML
* CSS
* JavaScript
* Theme switching
* Interactive controls
* UI state synchronization

### UX & Information Design

* Progressive disclosure
* Coordinated interactions
* Selection constraints
* Visual feedback
* Comparative analysis
* Dark/light theme design

### Data Communication

* Translating statistical relationships into interactive visuals
* Distinguishing magnitude from persistence
* Presenting complex international data in an explorable interface
* Supporting both overview and detailed comparison

---

# References & Inspiration

The implementation draws on established D3 and Observable interaction patterns for elements such as:

* Residual visualisation
* Interactive scatterplots
* Hover effects
* Tooltips
* Country-selection controls
* Parallel-coordinate-style comparison
* Custom legends
* Dark-mode implementation

Specific reference links are documented alongside the relevant implementation sections in `script.js`.

---

# Author

**Alexia Riner**

Developed in 2026 as an interactive data-visualisation project exploring the relationship between wealth and educational performance across countries.
