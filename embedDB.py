from sentence_transformers import SentenceTransformer
import psycopg2
import os
from dotenv import load_dotenv
import torch
from tqdm import tqdm

load_dotenv()

# LOADING ALL OF THE POSTGRES CREDENTIALS 
pg_password = os.environ.get('PG_PASSWORD')
pg_host = os.environ.get('PG_HOST')
pg_admin = os.environ.get('PG_ADMIN')

# HUGGING FACE SENTENCE TRANSFORMER!
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

connection = psycopg2.connect(database="Tarix", user=pg_admin, password=pg_password, host=pg_host, port=20073)
cursor = connection.cursor()

# QUERIES FROM HTS TABLE 
cursor.execute('''SELECT * FROM hts;''')
records = cursor.fetchall()

column_names = ['htsnumber', 'indent', 'description', 'unitofquantity', 'generalrateofduty', 
                'specialrateofduty', 'extrarateofduty', 'quotaquantity', 'additionalduties']

concatenated_records = []
for record in records:
    concatenated_record = []
    for i in range(len(record)-1):
        record_with_col = column_names[i] + ": " + str(record[i]) if record[i] is not None else column_names[i] + ": None" # CONCATENATING EACH RECORD TO READY FOR EMBEDDING
        concatenated_record.append(record_with_col)
    concatenated_records.append('|'.join(concatenated_record))

# CHANGE BATCH SIZE TO INCREASE PERFORMANCE
def process_text_array(text_array, batch_size=64):
    all_embeddings = []
    for i in tqdm(range(0, len(text_array), batch_size)):
        batch = text_array[i:i + batch_size]
        embeddings = model.encode(batch, device='cuda' if torch.cuda.is_available() else 'cpu', show_progress_bar=True) 
        all_embeddings.extend(embeddings)
    return all_embeddings

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = model.to(device)

# GETS EMBEDDINGS FOR ALL OF THE RECORDS CAN SPLIT LIST TO PROCESS LESS IF NEEDED
embeddings = process_text_array(concatenated_records)


insert_query = """
    INSERT INTO hts (htsnumber, indent, description, unitquantity, 
                                generalrateofduty, specialrateofduty, extrarateofduty, 
                                quotaquantity, additionalduties, embeddings)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
"""

parsed_records = 0
for record, embedding in zip(concatenated_records, embeddings):
    parsed_records += 1
    record_columns = record.split('|')    


    htsnumber = record_columns[0].split(": ")[1]
    indent = record_columns[1].split(": ")[1]
    description = record_columns[2].split(": ")[1]
    unitofquantity = record_columns[3].split(": ")[1]
    generalrateofduty = record_columns[4].split(": ")[1]
    specialrateofduty = record_columns[5].split(": ")[1]
    extrarateofduty = record_columns[6].split(": ")[1]
    quotaquantity = record_columns[7].split(": ")[1]
    additionalduties = record_columns[8].split(": ")[1]
    
    embedding_list = embedding.tolist()

    cursor.execute(insert_query, (htsnumber, indent, description, unitofquantity, 
                                  generalrateofduty, specialrateofduty, extrarateofduty, 
                                  quotaquantity, additionalduties, embedding_list))

connection.commit()

cursor.close()
connection.close()

print("Embeddings successfully inserted")
