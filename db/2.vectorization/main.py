import pandas as pd
from openai import OpenAI
from pinecone import Pinecone
import time
from pinecone import ServerlessSpec
from tqdm.auto import tqdm

# Load the CSV file
file_path = '../1.dataCreation/files/data.csv'
df = pd.read_csv(file_path)

# Initialize OpenAI client
client = OpenAI(api_key="OPENAI_API_KEY")

# Initialize Pinecone client
pc = Pinecone(api_key="PINECONE_API_KEY")

# Define Pinecone index details
spec = ServerlessSpec(cloud="aws", region="us-east-1")
index_name = 'audio-caption-index'

# Check if the index exists, and create it if not
if index_name not in pc.list_indexes().names():
    pc.create_index(
        index_name,
        dimension=1536,  # dimensionality of text-embed-3-small
        metric='dotproduct',
        spec=spec
    )
    while not pc.describe_index(index_name).status['ready']:
        time.sleep(1)

# Connect to the index
index = pc.Index(index_name)
time.sleep(1)

# Generate embeddings and upsert to Pinecone
batch_size = 32  # Process in batches

for i in tqdm(range(0, len(df), batch_size)):
    # Set end position of batch
    i_end = min(i + batch_size, len(df))
    
    # Get batch of lines (captions) and IDs
    captions_batch = df['caption'][i:i_end].tolist()
    ids_batch = [str(n) for n in range(i, i_end)]
    
    # Create embeddings
    res = client.embeddings.create(input=captions_batch, model="text-embedding-3-small")
    embeds = [record.embedding for record in res.data]
    
    # Prepare metadata and upsert batch
    meta = df.iloc[i:i_end].to_dict(orient='records')
    to_upsert = list(zip(ids_batch, embeds, meta))
    
    # Upsert to Pinecone
    index.upsert(vectors=to_upsert)

# View index stats to verify upsert
index_stats = index.describe_index_stats()
print(index_stats)
