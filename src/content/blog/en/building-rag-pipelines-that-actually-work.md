---
title: 'Building RAG Pipelines That Actually Work'
date: 2026-03-10
tags: ['rag', 'ai', 'python', 'vector-databases']
summary: "Most RAG tutorials skip the hard parts. Here's what it actually takes to build a retrieval-augmented generation pipeline that handles real-world documents, scales beyond demo datasets, and gives answers people can trust."
language: en
slug: building-rag-pipelines-that-actually-work
category: ai
draft: false
readingTime: 8
---

## The gap between demo and production

Every RAG tutorial starts the same way: chunk some documents, embed them, stuff them into a prompt. It works beautifully on the demo dataset. Then you throw real documents at it and everything falls apart.

I've built RAG systems that serve production traffic — search platforms indexing millions of records, internal knowledge bases for engineering teams, and customer-facing Q&A systems. The pattern that works in a notebook is rarely the pattern that works at scale.

Here's what I've learned about the gaps.

## Chunking is where most pipelines silently fail

The default advice is "split on 500 tokens with 50-token overlap." This works for clean, well-structured text. It fails catastrophically on:

- **Tables and structured data** — a table split mid-row becomes two meaningless chunks
- **Code blocks** — half a function is worse than no function
- **Lists with context** — item 7 of a list means nothing without the list header

```python
def smart_chunk(document: Document) -> list[Chunk]:
    """Chunk based on document structure, not arbitrary token counts."""
    sections = extract_sections(document)
    chunks = []
    for section in sections:
        if section.token_count <= MAX_CHUNK_SIZE:
            chunks.append(Chunk(content=section.text, metadata=section.metadata))
        else:
            # Only split within sections, preserving headers
            sub_chunks = split_with_context(section, MAX_CHUNK_SIZE)
            chunks.extend(sub_chunks)
    return chunks
```

The key insight: **chunk boundaries should follow document structure, not token counts**. Parse your documents into semantic sections first, then decide how to split within those sections.

## Retrieval quality is not embedding quality

Better embeddings help, but they're not the bottleneck most people think they are. The real retrieval problems are:

1. **Query-document mismatch** — users ask questions in natural language; documents state facts declaratively
2. **Specificity collapse** — "how do I configure X?" retrieves every document that mentions X
3. **Missing context** — the answer requires information from multiple chunks that don't co-occur

### Hybrid search solves the first two

Pure vector search is fragile. Combining it with keyword search (BM25) catches the cases where semantic similarity fails:

```python
def hybrid_search(query: str, k: int = 10) -> list[Result]:
    vector_results = vector_store.similarity_search(query, k=k * 2)
    keyword_results = bm25_index.search(query, k=k * 2)
    return reciprocal_rank_fusion(vector_results, keyword_results, k=k)
```

Reciprocal rank fusion is simple and remarkably effective. It doesn't require tuning weights between the two result sets.

## The generation prompt matters more than you think

Once you have good retrieval, the generation step is where trust is built or broken. Two rules:

1. **Always cite sources** — tell the model to reference which chunks it used
2. **Admit ignorance** — "I don't have enough information" is better than a hallucinated answer

```
Given the following context, answer the user's question.
If the context doesn't contain enough information, say so.
Always reference which sections you used.

Context:
{retrieved_chunks}

Question: {user_query}
```

## Evaluation is the hardest part

You can't improve what you can't measure. Build an evaluation set early:

- **Retrieval evaluation**: for each question, do the right chunks appear in the top-k?
- **Answer evaluation**: is the generated answer correct, complete, and grounded?
- **Regression testing**: does a change to chunking or retrieval break previously correct answers?

This isn't optional. Without evaluation, you're tuning hyperparameters by vibes.

## What I'd do differently next time

Start with the evaluation set. Write 50 question-answer pairs before writing any pipeline code. It changes every decision you make downstream — chunking strategy, embedding model, retrieval approach, prompt design.

RAG isn't hard because the individual pieces are complex. It's hard because the pieces interact in ways that are difficult to predict. The only way through is to measure everything and iterate fast.
