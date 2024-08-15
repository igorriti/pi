import json
import os
from datetime import datetime

# Function to convert duration string to a datetime object
def parse_duration(duration_str):
    try:
        return datetime.strptime(duration_str, "%H:%M:%S") if duration_str else None
    except ValueError:
        return None

# Directory containing the JSON files
directory_path = './scrapped'

# List to store all the filtered videos
filtered_videos = []

# Iterate through all files in the directory
for filename in os.listdir(directory_path):
    if filename.endswith('.json'):  # Ensure we're processing only JSON files
        file_path = os.path.join(directory_path, filename)
        try:
            # Open the file with the correct encoding
            with open(file_path, 'r', encoding='utf-8') as file:
                data = json.load(file)

                # Process each entry in the JSON array
                for entry in data:
                    duration = parse_duration(entry.get("duration"))
                    if duration and duration.hour >= 1:  # Check if the duration is more than an hour
                        video_info = {
                            "id": entry.get("id"),
                            "title": entry.get("title"),
                            "thumbnailUrl": entry.get("thumbnailUrl")
                        }
                        filtered_videos.append(video_info)

        except UnicodeDecodeError as e:
            print(f"Error decoding file {filename}: {e}")

# Output the filtered and merged data
for video in filtered_videos:
    print(video)

# Optionally, save the merged result to a new JSON file
output_file = './merged_videos.json'
with open(output_file, 'w', encoding='utf-8') as outfile:
    json.dump(filtered_videos, outfile, indent=2)
