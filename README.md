# The Twelfth Man

Live Demo is available <a href = "https://khuenlm.github.io/the-12th-man/">here</a>.

## Overview

A data visualization project exploring whether World Cup referees issue fewer cards to teams from their own confederation and whether FIFA's integrity reforms have reduced this effect over time.

## Visualizations

- **Layer 1 - Confederation Bias Matrix**: a heatmap showing mean yellow cards issued across all referee-team confederation pairings
- **Layer 2 - Compare Card Distribution**: distribution of yellow cards for same-confederation vs. cross-confederation matchups, supported by statistical test
- **Layer 3 - Bias Over Time**: bias index tracked across all tournaments since 1970, with a rolling average to reveal the pattern over five decades
- **Layer 4 - High Stakes Spotlight**: individual match card difference by tournament stage, examining if referee bias persists under the highest pressure.

## Data Used
- Data Source: [World Cup datasets compiled by Joshua C. Fjelstul](https://github.com/jfjelstul/worldcup), including all matches, bookings, and referee appointments. 
- Key files: `bookings.csv`, `matches.csv`, `referee.csv`. All located in `data/processed`. 

## Tech Stack
- Interactive data visualizations built using [D3.js](https://d3js.org).
- Data processing and analysis done using [Pandas](https://https://pandas.pydata.org/docs/).
- Hypothesis testing done using [Scipy](https://scipy.org).

## Repository Structure

```
the-12th-man/
├── index.html
├── style.css
├── d3_viz.js
├── data/
│   ├── processed/         # processed data
│   └── viz/               # data in json for visualizations
│   └── raw/               # raw data
├── src/                   # data processing
└── notebooks/             # eda notebooks
└── results/               # data visualization
```

## Contact

Please contact me at [khueln2@illinois.edu](mailto:khueln2@illinois.edu) for any questions. 