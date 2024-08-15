import json
import csv

def json_to_csv(json_file, csv_file):
    with open(json_file, 'r') as f:
        data = json.load(f)
    filtered_data = [item for item in data if all(key in item for key in ["id", "title", "thumbnailUrl", "caption"])]
    fieldnames = ["id", "title", "thumbnailUrl", "caption"]
    with open(csv_file, 'w', newline='', encoding='utf-8') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(filtered_data)
json_file = 'updated_videos.json'  
csv_file = 'data.csv'  

json_to_csv(json_file, csv_file)
