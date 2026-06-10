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

df = df[["match_id", "stage_name", "home_team_id", "home_team_name", "home_team_confederation", "away_team_name", "away_team_id",  "away_team_confederation"]]
df_ref = df_ref[["match_id", "referee_id", "referee_id", "family_name", "given_name", "confederation_code"]]
df = df.merge(df_ref, on = "match_id", how = "left")
df["stage_name"] = df["stage_name"].str.replace("second group stage", "group stage")

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

def same_conf(row):
    if (row["home_team_confederation"] == row["ref_confederation"]) or (row["away_team_confederation"] == row["ref_confederation"]):
        return True
    else: 
        return False
    
df["same_conf"] = df.apply(same_conf, axis = 1)

def card_diff(row):
    if row["home_team_confederation"] == row["ref_confederation"]:
        return row["home_team_yellow_card"] - row["away_team_yellow_card"]
    elif row["away_team_confederation"] == row["ref_confederation"]:
        return row["away_team_yellow_card"] - row["home_team_yellow_card"]
    else: return 0

df["card_difference"] = df.apply(card_diff, axis = 1)

df["year"] = df["match_id"].str.split("-").str[1].astype("int")

def same_conf_team(row):
    if row["home_team_confederation"] == row["ref_confederation"]:
        return row["home_team_name"]
    elif row["away_team_confederation"] == row["ref_confederation"]:
        return row["away_team_name"]
    else: return None

def diff_conf_team(row):
    if row["home_team_confederation"] == row["ref_confederation"]:
        return row["away_team_name"]
    elif row["away_team_confederation"] == row["ref_confederation"]:
        return row["home_team_name"]
    else: return None

df["same_conf_team"] = df.apply(same_conf_team, axis = 1)
df["diff_conf_team"] = df.apply(diff_conf_team, axis = 1)

df.to_json("../data/viz/strip.json", orient = "records", indent = 4)