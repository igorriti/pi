import json
from openai import OpenAI

# Initialize the OpenAI client
client = OpenAI(api_key='API_KEY')

# Load the JSON data
try:
    with open('updated_videos.json', 'r') as file:
        data = json.load(file)
except FileNotFoundError:
    with open('merged_videos.json', 'r') as file:
        data = json.load(file)

# Function to generate a caption for each item
def generate_caption(item):
    # Example input to guide the model
    example_response = """
    ```json	
    {
        "id": "example_id",
        "title": "Example Title",
        "thumbnailUrl": "https://example.com/thumbnail.jpg",
        "caption": "World war 2 ambience, soldiers marching in formation with tanks and planes flying overhead."
    }
    ```
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": f"""Generate a caption for semantic search of the ambience based on this image and title: {item['title']}
                    It should be neutral and descriptive without any opinions or emotions. Ignore the terms like reading, sleeping, or writing.
                    The captions should be generical as possible and not specific to the image or title, for example if the title its amazonas sound, the caption should be something like: "Rainforest ambience" or "Jungle sounds".
                    You have to made a focus on sound and sfx of the video based on what you see in the image and the title.
                    Example response: 
                    {example_response}
                     """},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": item['thumbnailUrl']
                        },
                    },
                ],
            }
        ],
        max_tokens=1000
    )
    
    # Extract the caption from the response
    caption = response.choices[0].message.content
    caption = caption.replace("```json", "").replace("```", "").strip()

    try:
        caption_data = json.loads(caption)
        caption_text = caption_data.get("caption")
        return caption_text
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return None

# Process each item and add the caption
def process_items(data, start_index=3876):
    for index, item in enumerate(data[start_index:], start=start_index):
        try:
            item['caption'] = generate_caption(item)
            # Save the updated data to a new JSON file after processing each item
            with open('updated_videos.json', 'w') as file:
                json.dump(data, file, indent=4)
            
            print(f"Processed item {index+1}/{len(data)}")
        except Exception as e:
            print(f"Error processing item {index}: {e}")
            break  # Stop processing if an error occurs

process_items(data)

print("Captions generated and JSON file updated.")
