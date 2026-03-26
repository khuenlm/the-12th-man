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

df["year"] = df["match_id"].str.extract(r"(\d{4})").astype(int)

def return_match_id(team1, team2, year, stage):
    assert stage in df["stage_name"].unique().tolist(), f"stage name has to match data values: {df["stage_name"].unique().tolist()}"
    assert team1 in df["home_team_name"].unique().tolist() + df["away_team_name"].unique().tolist(), "invalid team1 name"
    assert team2 in df["home_team_name"].unique().tolist() + df["away_team_name"].unique().tolist(), "invalid team2 name"
    df_filter = df[
        (df["year"] == year) &
        (df["stage_name"] == stage) &
        (((df["home_team_name"] == team1) & (df["away_team_name"] == team2)) | 
        ((df["home_team_name"] == team2) & (df["away_team_name"] == team1)))
    ].reset_index()
    assert len(df_filter) == 1, "duplicate matches"
    return df_filter.loc[0, "match_id"]

notorious_id = []
notorious_id.append(return_match_id("South Korea", "Italy", 2002, "round of 16"))
notorious_id.append(return_match_id("South Korea", "Spain", 2002, "quarter-finals"))
notorious_id.append(return_match_id("Argentina", "England", 1986, "quarter-finals"))
notorious_id.append(return_match_id("Australia", "Italy", 2006, "round of 16"))
notorious_id.append(return_match_id("Argentina", "Netherlands", 1978, "final"))
notorious_id.append(return_match_id("England", "Germany", 2010, "round of 16"))
notorious_id.append(return_match_id("France", "Morocco", 2022, "semi-finals"))

df_notorious = df[df["match_id"].isin(notorious_id)]
df_notorious.to_json("../data/viz/notorious.json", orient = "records", indent = 4)