import pandas as pd
from pathlib import Path

current = Path.cwd()
bookings = Path(current.parent/"data/processed/merge_bookings.csv")
teams = Path(current.parent/"data/raw/teams.csv")

df = pd.read_csv(bookings)
df_teams = pd.read_csv(teams)

df_teams = df_teams[["team_id", "team_name"]]

df = df.merge(df_teams, on = "team_id", how = "left").drop(columns = ["Unnamed: 0", "referee_id"])

desired_order = ['match_id', 'team_id', 'team_name', 'team_confederation', 'ref_confederation', 'yellow_card']
df = df.reindex(columns = desired_order)

df["same_conf"] = df["team_confederation"] == df["ref_confederation"]

df.to_json('../data/viz/beeswarm.json', orient='records', indent = 4)