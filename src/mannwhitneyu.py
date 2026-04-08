import pandas as pd
from scipy.stats import mannwhitneyu
from pathlib import Path

data = Path.cwd().parent.joinpath("data", "viz", "beeswarm.json")
df = pd.read_json(data)

df_same = df[df["same_conf"] == True]
df_diff = df[df["same_conf"] == False]
significance_level = 0.05 

print("Hypothesis:")
print("- Null hypothesis: Same-confederation teams receive yellow cards at the same rate as cross-confederation teams — any observed difference is due to chance")
print("- Alternative hypothesis: Same-confederation teams receive fewer yellow cards than cross-confederation teams — consistent with referee bias")

print(f"\nSample sizes:")
print(f"Same confederation: n = {len(df_same)}")
print(f"Different confederation: n = {len(df_diff)}")

test_results = mannwhitneyu(df_same["yellow_card"], df_diff["yellow_card"], alternative = "less")
print("\nTest results:")
print(f"Test statistic: {test_results.statistic}")
print(f"p_value: {test_results.pvalue}")

if test_results.pvalue < significance_level: 
    print("Reject null hypothesis")
else: 
    print("Fail to reject null hypothesis")