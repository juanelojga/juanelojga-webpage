---
title: 'Construyendo Pipelines RAG que Realmente Funcionan'
date: 2026-03-10
tags: ['rag', 'ia', 'python', 'bases-de-datos-vectoriales']
summary: 'La mayoría de tutoriales de RAG se saltan las partes difíciles. Esto es lo que realmente se necesita para construir un pipeline de generación aumentada por recuperación que maneje documentos reales, escale más allá de datasets de demo y dé respuestas confiables.'
language: es
slug: building-rag-pipelines-that-actually-work
category: ai
draft: false
readingTime: 8
---

## La brecha entre demo y producción

Todos los tutoriales de RAG empiezan igual: fragmentar documentos, generar embeddings, meterlos en un prompt. Funciona de maravilla con el dataset de ejemplo. Después le lanzas documentos reales y todo se desmorona.

He construido sistemas RAG que sirven tráfico en producción — plataformas de búsqueda indexando millones de registros, bases de conocimiento internas para equipos de ingeniería y sistemas de preguntas y respuestas para usuarios finales. El patrón que funciona en un notebook rara vez es el que funciona a escala.

Esto es lo que he aprendido sobre esas brechas.

## La fragmentación es donde la mayoría de pipelines fallan silenciosamente

El consejo estándar es "dividir en 500 tokens con 50 tokens de solapamiento". Funciona para texto limpio y bien estructurado. Falla catastróficamente con:

- **Tablas y datos estructurados** — una tabla cortada a mitad de fila se convierte en dos fragmentos sin sentido
- **Bloques de código** — media función es peor que ninguna función
- **Listas con contexto** — el ítem 7 de una lista no significa nada sin el encabezado

```python
def smart_chunk(document: Document) -> list[Chunk]:
    """Fragmentar basándose en la estructura del documento, no en conteos arbitrarios de tokens."""
    sections = extract_sections(document)
    chunks = []
    for section in sections:
        if section.token_count <= MAX_CHUNK_SIZE:
            chunks.append(Chunk(content=section.text, metadata=section.metadata))
        else:
            # Solo dividir dentro de secciones, preservando encabezados
            sub_chunks = split_with_context(section, MAX_CHUNK_SIZE)
            chunks.extend(sub_chunks)
    return chunks
```

La idea clave: **los límites de fragmentación deben seguir la estructura del documento, no los conteos de tokens**. Primero parsea tus documentos en secciones semánticas, luego decide cómo dividir dentro de esas secciones.

## La calidad de recuperación no es la calidad de embeddings

Mejores embeddings ayudan, pero no son el cuello de botella que la mayoría cree. Los problemas reales de recuperación son:

1. **Desajuste consulta-documento** — los usuarios hacen preguntas en lenguaje natural; los documentos declaran hechos de forma declarativa
2. **Colapso de especificidad** — "¿cómo configuro X?" recupera cada documento que menciona X
3. **Contexto faltante** — la respuesta requiere información de múltiples fragmentos que no co-ocurren

### La búsqueda híbrida resuelve los dos primeros

La búsqueda vectorial pura es frágil. Combinarla con búsqueda por palabras clave (BM25) captura los casos donde la similitud semántica falla:

```python
def hybrid_search(query: str, k: int = 10) -> list[Result]:
    vector_results = vector_store.similarity_search(query, k=k * 2)
    keyword_results = bm25_index.search(query, k=k * 2)
    return reciprocal_rank_fusion(vector_results, keyword_results, k=k)
```

La fusión de ranking recíproco es simple y notablemente efectiva. No requiere ajustar pesos entre los dos conjuntos de resultados.

## El prompt de generación importa más de lo que piensas

Una vez que tienes buena recuperación, el paso de generación es donde se construye o se rompe la confianza. Dos reglas:

1. **Siempre citar fuentes** — decirle al modelo que referencie qué fragmentos usó
2. **Admitir ignorancia** — "No tengo suficiente información" es mejor que una respuesta alucinada

```
Dado el siguiente contexto, responde la pregunta del usuario.
Si el contexto no contiene suficiente información, dilo.
Siempre referencia qué secciones usaste.

Contexto:
{retrieved_chunks}

Pregunta: {user_query}
```

## La evaluación es la parte más difícil

No puedes mejorar lo que no puedes medir. Construye un conjunto de evaluación temprano:

- **Evaluación de recuperación**: para cada pregunta, ¿aparecen los fragmentos correctos en el top-k?
- **Evaluación de respuestas**: ¿es la respuesta generada correcta, completa y fundamentada?
- **Pruebas de regresión**: ¿un cambio en la fragmentación o recuperación rompe respuestas previamente correctas?

Esto no es opcional. Sin evaluación, estás ajustando hiperparámetros por intuición.

## Lo que haría diferente la próxima vez

Empezar con el conjunto de evaluación. Escribir 50 pares de pregunta-respuesta antes de escribir cualquier código del pipeline. Cambia cada decisión que tomas después — estrategia de fragmentación, modelo de embeddings, enfoque de recuperación, diseño de prompts.

RAG no es difícil porque las piezas individuales sean complejas. Es difícil porque las piezas interactúan de formas difíciles de predecir. La única forma de avanzar es medir todo e iterar rápido.
