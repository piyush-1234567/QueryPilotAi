# QueryPilot AI

An LLM-powered Text-to-SQL RAG chatbot that enables users to query cloud databases using natural language.

## Problem Statement
Accessing structured database information often requires SQL knowledge, creating barriers for non-technical users.

## Objectives
- Convert natural-language questions into SQL queries.
- Use RAG to retrieve relevant database schemas and SQL examples.
- Validate and execute queries securely.
- Implement self-healing SQL and query optimization.
- Display results through interactive tables and charts.

## Tech Stack
- Frontend: React + Tailwind CSS
- Backend: Python + FastAPI
- LLM: Groq API
- RAG: LangChain
- Embeddings: Sentence Transformers
- Vector Database: ChromaDB
- Database: PostgreSQL
- SQL Validation: SQLGlot

## Planned Features
- Natural-language database querying
- RAG-based schema retrieval
- Self-healing SQL
- Query optimization
- Confidence-aware responses
- Data visualization

## Development Status
Planning and initial setup.

## Future Scope
Support additional database systems and local databases through a secure local agent.



## System Workflow
1. User connects a supported cloud database.
2. Backend extracts its schema and stores embeddings in ChromaDB.
3. User submits a natural-language question.
4. RAG retrieves relevant schema details and SQL examples.
5. The LLM generates SQL, which is validated before execution.
6. Self-healing logic corrects eligible SQL errors with bounded retries.
7. Query optimization analyzes execution plans and suggests improvements.
8. Results, generated SQL, and optional visualizations appear in the UI.

## Agentic AI Features
- Self-healing SQL with bounded retries.
- Query execution and error analysis through tools.
- Query-plan analysis and optimization suggestions.
- Safety guardrails for read-only execution.

## Website Pages
1. Landing Page
2. Login / Signup
3. Dashboard
4. Connect Database
5. AI Chat Workspace
6. Query History
7. Query Analysis
8. Settings

## Development Scope
**Version 1:** Website supporting a demo database and supported cloud PostgreSQL connections.

**Future Scope:** MySQL support and local database connectivity through a secure local agent.