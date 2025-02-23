Tarix

Tarix is a web application designed to help consumers, businesses, and policymakers make more informed decisions about the tariffs applied to the exports of various foreign countries. By providing detailed information on the tariffs associated with different products, Tarix enables users to better understand how tariffs impact prices and their purchasing decisions.
Inspiration

The inspiration for this project came from my interest in learning about how tariffs affect the global trade system. I discovered that many tariffs, while intended to protect local economies, ultimately harm consumers by increasing prices. It became clear that understanding how tariffs impact the consumer is crucial to minimizing their effects. Tarix helps make these impacts more visible by providing detailed information on tariffs and how they are applied.
What it does

Tarix helps users better understand the products they are purchasing and the tariffs placed on them. With a user-friendly interface, Tarix provides instant access to tariff rates, HTS code information, and product descriptions, empowering users to make smarter decisions when buying or selling goods internationally.
How we built it

Tarix was built using:

    Frontend: Next.js – A React framework for building server-side rendered (SSR) web applications.
    Backend: Flask – A micro web framework for Python that handles the logic for interacting with the database and API endpoints.
    Embeddings & NLP: Hugging Face transformer models, particularly sentence-transformers/all-MiniLM-L6-v2 – Used to embed product data and queries for efficient retrieval-augmented generation (RAG).
    Database: Postgres hosted on Aiven – Stores product and tariff information and facilitates queries to find relevant tariff data.
    CUDA: Used for local GPU-accelerated embeddings to improve performance.

The application utilizes Retrieval-Augmented Generation (RAG) to provide insights based on user queries, leveraging a combination of pre-trained transformer models and a local database to offer responses that are tailored to user requests.

Features

    Product Tariff Search: Users can search for products by HTS codes and view detailed tariff information, including duty rates and product descriptions.
    Retrieval-Augmented Generation (RAG): The app provides enhanced answers by combining both data retrieval from the database and AI-generated insights, giving users a complete understanding of tariffs related to their queries.
    Global Reach: Tarix supports a wide range of tariffs across different countries and regions, enabling international trade analysis.

Future Improvements

    Enhanced Search Features: More refined search options, including filters based on country, product type, or tariff rate.
    Visualizations: Adding charts or graphs to help users better understand tariff trends and their economic impact.
    Broader Data Sources: Integrating more data sources for additional tariff-related insights.
