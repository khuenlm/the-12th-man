import pandas as pd
import numpy as np
import json
from pathlib import Path
from scipy.stats import norm
import math

current = Path.cwd()
bookings = Path(current.parent/"data/processed/merge_bookings.csv")

df = pd.read_csv(bookings).drop(columns = "Unnamed: 0")
df["year"] = df["match_id"].str.extract(r"(\d{4})").astype(int)
df["same_conf"] = df["team_confederation"] == df["ref_confederation"]

years = df["year"].unique()
confs = ["AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"]

def clean_nan(value):
  if value is None: 
    return None
  if isinstance(value, float) and math.isnan(value):
    return None
  return value

def return_json(data, year):
  df_year = data[data["year"] == year]
  df_same = df_year[df_year["same_conf"] == True]
  df_diff = df_year[df_year["same_conf"] == False]
  match_same = int(df_same.shape[0])
  match_diff = int(df_diff.shape[0])
  cards_same = int(df_same["yellow_card"].sum())
  cards_diff = int(df_diff["yellow_card"].sum())

  if match_same == 0 or match_diff == 0:
    bias_index = None
    lower_bound = None
    upper_bound = None
  else: 
    bias_index = (cards_same / match_same) - (cards_diff / match_diff) 
    se_same = df_same["yellow_card"].std() / (match_same ** (1/2))
    se_diff = df_diff["yellow_card"].std() / (match_diff ** (1/2))
    se = (se_same ** 2 + se_diff ** 2) ** (1/2)
    lower_bound = round(bias_index - se * norm.ppf(0.025), 5)
    upper_bound = round(bias_index + se * norm.ppf(0.975), 5)

  d = {
      "year": int(year),
      "match_same": match_same,
      "cards_same": cards_same,
      "match_diff": match_diff,
      "cards_diff": cards_diff, 
      "bias_index": bias_index,
      "lower_bound": clean_nan(lower_bound),
      "upper_bound": clean_nan(upper_bound)
  }
  return d

big_data = {}
for i, conf in enumerate(confs):
  df_conf = df[df["ref_confederation"] == conf]
  data = []

  for year in years: 
    d = return_json(df_conf, year)
    data.append(d)
  big_data[conf] = data

data2 = []
for year in years: 
  d = return_json(df, year)
  data2.append(d)

data2 = sorted(data2, key=lambda x: x["year"])

for i, d in enumerate(data2):
    window = data2[max(0, i-1):min(len(data2), i+2)]
    valid = [w["bias_index"] for w in window if w["bias_index"] is not None]
    d["rolling_avg"] = round(sum(valid) / len(valid), 5) if valid else None

big_data["overall"] = data2

for conf in confs:
    conf_data = sorted(big_data[conf], key=lambda x: x["year"])
    for i, d in enumerate(conf_data):
        window = conf_data[max(0, i-1):min(len(conf_data), i+2)]
        valid = [w["bias_index"] for w in window if w["bias_index"] is not None]
        d["rolling_avg"] = round(sum(valid) / len(valid), 5) if valid else None
    big_data[conf] = conf_data

with open("../data/viz/timeline.json", 'w') as f: 
  json.dump(big_data, f, indent = 4)