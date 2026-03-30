import pandas as pd
import json
from pathlib import Path

current = Path.cwd()
bookings = Path(current.parent/"data/processed/merge_bookings.csv")

df_merge = pd.read_csv(bookings)


df_ref_team_match = pd.crosstab(
    index = df_merge["ref_confederation"],
    columns = df_merge["team_confederation"],
    values = df_merge["yellow_card"],
    aggfunc = "mean"
).fillna(0).reset_index()
df_ref_team_match.columns = ["ref_confederation", "AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"]
df_ref_team_match = df_ref_team_match.set_index("ref_confederation")


df_match_count = pd.crosstab(
    index = df_merge["ref_confederation"],
    columns = df_merge["team_confederation"],
    values = df_merge["yellow_card"],
    aggfunc = "count"
).fillna(0).reset_index()
df_match_count.columns = ["ref_confederation", "AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"]
df_match_count = df_match_count.set_index("ref_confederation")

# json structure

export = {}
for ref_conf in df_ref_team_match.index:
    export[ref_conf] = {}
    for team_conf in df_ref_team_match.columns:
        match_count = int(df_match_count.loc[ref_conf, team_conf])
        mean_card = df_ref_team_match.loc[ref_conf, team_conf]
        export[ref_conf][team_conf] = {
            "mean_card": round(mean_card, 5) if match_count >= 1 else None,
            "match_count": match_count 
        }

# export json

with open('../data/viz/heatmap.json', 'w') as f:
    json.dump(export, f, indent = 4)
