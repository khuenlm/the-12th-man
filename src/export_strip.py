import pandas as pd
import json
from pathlib import Path

current = Path.cwd()
matches = Path(current.parent/"data/processed/matches.csv")
refs = Path(current.parent/"data/processed/referee.csv")
bookings = Path(current.parent/"data/processed/merge_bookings.csv")

df = pd.read_csv(matches)
df_ref = pd.read_csv(refs)
df_bookings = pd.read_csv(bookings)

df = df[["match_id", "home_team_id", "home_team_name", "home_team_confederation", "away_team_name", "away_team_id",  "away_team_confederation"]]
df_ref = df_ref[["match_id", "referee_id", "referee_id", "family_name", "given_name", "confederation_code"]]
df = df.merge(df_ref, on = "match_id", how = "left")

df_booking1 = df_bookings.head(764)
df_booking2 = df_bookings.tail(764)
df_bookings = df_booking1.merge(df_booking2, on = "match_id", how = "left")

df_bookings = df_bookings[['match_id', 'yellow_card_x', 'yellow_card_y']]
df_bookings.columns = ["match_id", "home_team_yellow_card", "away_team_yellow_card"]

df = df.merge(df_bookings, on = "match_id", how = "left")
df["referee_name"] = df["given_name"] + " " + df["family_name"]
df["card_difference"] = df["home_team_yellow_card"] - df["away_team_yellow_card"]
df = df.drop(columns = ["family_name", "given_name", "referee_id"])
df = df.rename(columns = {"confederation_code": "ref_confederation"})

def return_group(row):
    if row['home_team_confederation'] == row['ref_confederation'] and row['away_team_confederation'] != row['ref_confederation']:
        return -1
    elif row['home_team_confederation'] != row['ref_confederation'] and row['away_team_confederation'] == row['ref_confederation']:
        return 1
    else:
        return 0

df["group"] = df.apply(return_group, axis = 1)

df.to_json("../data/viz/strip.json", orient = "records", indent = 4)