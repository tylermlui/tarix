from flask import Flask, request, jsonify
import psycopg2
from langchain.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv
import requests
app = Flask(__name__)


load_dotenv()

# LOADING ALL OF THE POSTGRES CREDENTIALS
pg_password = os.environ.get('PG_PASSWORD')
pg_host = os.environ.get('PG_HOST')
pg_admin = os.environ.get('PG_ADMIN')
# LOADING TOKENS
hf_token = os.environ.get('HF_TOKEN')
model_id = "sentence-transformers/all-MiniLM-L6-v2"
api_url = f"https://api-inference.huggingface.co/pipeline/feature-extraction/{model_id}"
headers = {"Authorization": f"Bearer {hf_token}"}


@app.route("/api/python")
def handle_query():
    #GETS QUERY FROM REQUEST ADDRESS
    query_text = request.args.get('query', '')

    if not query_text:
        return jsonify({"error": "Query text is required"}), 400
    
    connection = psycopg2.connect(database="Tarix", user=pg_admin, password=pg_password, host=pg_host, port=20073)
    cursor = connection.cursor()

    def query(query_text):
        response = requests.post(api_url, headers=headers, json={"inputs": query_text, "options": {"wait_for_model": True}})
        return response.json()

    #EMBEDDING WIHT MINILM
    query_embedding = query(query_text)

    query_embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'

    PROMPT_TEMPLATE = """
        Answer the question based only on the following context:
        {context}

        ---

        Answer the question based on the above context: {question}

        Give detailed responses.
    """

    # SIMILARITY SEARCH 
    cursor.execute("""
        SELECT htsnumber, description, unitquantity, 
               generalrateofduty, specialrateofduty, extrarateofduty, 
               quotaquantity, additionalduties, embeddings
        FROM hts
        WHERE embeddings IS NOT NULL
        ORDER BY embeddings <=> %s
        LIMIT 5;
    """, (query_embedding_str,))

    results = cursor.fetchall()

    context_text = "\n\n---\n\n".join([
        f"HTS Number: {row[0]}\nDescription: {row[1]}\nUnit of Quantity: {row[2]}\nGeneral Rate of Duty: {row[3]}\nSpecial Rate of Duty: {row[4]}\nExtra Rate of Duty: {row[5]}\nQuota Quantity: {row[6]}\nAdditional Duties: {row[7]}"
        for row in results
    ])

    if not context_text:
        response_text = "No relevant data found based on the context."
    else:
        #PROMPTS MODEL IF THERE IS CONTEXT DATA FOUND
        prompt_template = ChatPromptTemplate.from_template(PROMPT_TEMPLATE)
        prompt = prompt_template.format(context=context_text, question=query_text)

        model = ChatOpenAI()
        response = model.invoke(prompt)

        response_text = response.content

    sources = [f"https://hts.usitc.gov/search?query={row[0]}" if row[0] is not None else "No valid HTS number" for row in results]
    if not sources:
        sources.append("Source not available for relevant data.")

    formatted_response = {
        "response": response_text,
        "sources": sources
    }

    cursor.close()
    connection.close()

    return jsonify(formatted_response)

