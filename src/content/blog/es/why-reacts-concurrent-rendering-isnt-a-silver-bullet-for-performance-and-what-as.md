---
title: 'Por qué el Renderizado Concurrente de React no es la solución mágica para el rendimiento (y lo que Astro hace bien)'
date: 2026-04-08
tags: ['frontend', 'react', 'astro', 'rendimiento', 'desarrollo web']
summary: 'El Renderizado Concurrente de React mejora la capacidad de respuesta, pero no soluciona el problema de enviar demasiado JavaScript al navegador. Astro ofrece un enfoque distinto, priorizando contenido estático y el uso minimalista de JavaScript, ideal para sitios web centrados en contenido.'
language: es
slug: why-reacts-concurrent-rendering-isnt-a-silver-bullet-for-performance-and-what-as
category: frontend
draft: false
readingTime: 7
---

## Introducción

Cuando se anunció el renderizado concurrente de React, parecía que estábamos en el inicio de una nueva era para el desarrollo frontend. Por fin, React iba a poder manejar interfaces de usuario complejas sin bloquear el navegador ni dejar a los usuarios viendo pantallas congeladas. ¿La promesa? Mejorar la capacidad de respuesta y proporcionar interacciones más fluidas. Y aunque el Renderizado Concurrente **es** un avance técnico importante, si esperas que mágicamente resuelva todos tus problemas de rendimiento, déjame frenarte ahí mismo.

En este artículo, voy a explicar por qué el Renderizado Concurrente no es una solución universal para los problemas de rendimiento y por qué frameworks como Astro ofrecen algo fundamentalmente diferente—y quizás más efectivo.

## ¿Qué es el Renderizado Concurrente?

Comencemos con lo básico. El Renderizado Concurrente es la forma en la que React maneja las actualizaciones, priorizando la capacidad de respuesta. En lugar de bloquear la interfaz mientras renderiza, React divide el trabajo de renderización en fragmentos y los distribuye a lo largo de múltiples frames, permitiendo que el navegador se encargue de tareas más prioritarias (por ejemplo, entrada de usuario o animaciones) entre medio.

Una analogía simplificada: imagina que estás manejando varias tareas en el trabajo. En lugar de enfocarte exclusivamente en una tarea grande durante horas y dejar de contestar correos o mensajes en Slack, divides esa tarea en pedazos más pequeños y los intercalas con otras solicitudes urgentes. El Renderizado Concurrente permite a React hacer este tipo de malabarismos.

### Funciones Clave del Renderizado Concurrente

Estas son las principales ventajas que ofrece el Renderizado Concurrente:

1. **Renderizado Interrumpible**: React puede pausar la renderización de un árbol de componentes para atender tareas más urgentes y reanudar más tarde.
2. **Hidratación Selectiva**: Permite que las partes de tu aplicación se "hidraten" (conectar listeners de eventos y volverse interactivas) solo cuando son visibles o necesarias.
3. **Transiciones**: React introduce el concepto de transiciones para distinguir entre acciones urgentes (como clics en botones) y acciones no urgentes (como la carga de datos tras una navegación).

### Por qué no es una solución mágica

Aunque el Renderizado Concurrente es, sin duda, una innovación, es esencial entender lo que **no hace**. No reduce el trabajo total que tu aplicación necesita realizar. No hace que tu app sea automáticamente más rápida; simplemente la hace sentir más rápida bajo ciertas condiciones. Y no soluciona el problema más crítico: **la cantidad de JavaScript que se está enviando al navegador.**

Aquí es donde muchos desarrolladores se bloquean. Si tu aplicación en React está lastrada por árboles de componentes gigantes, efectos profundamente anidados y megabytes de JavaScript, el Renderizado Concurrente no puede hacer milagros. Es como intentar reparar una tubería con fugas sin arreglar la fontanería subyacente.

Veamos un poco de código para ilustrar:

### Ejemplo: Renderizado Concurrente en acción

```jsx
import React, { useTransition, useState } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');

  const handleChange = e => {
    const value = e.target.value;

    // Inicia una actualización no urgente
    startTransition(() => {
      setText(value);
    });
  };

  return (
    <div>
      <input type="text" onChange={handleChange} />
      {isPending ? <p>Cargando...</p> : <p>{text}</p>}
    </div>
  );
}
```

En este ejemplo, `startTransition` marca la actualización activada por `setText` como no urgente. Si el navegador está ocupado con tareas de mayor prioridad, React podría retrasar la renderización de `<p>{text}</p>` y mostrar `<p>Cargando...</p>` mientras tanto.

Esto es interesante, pero ¿qué resuelve realmente? Si el navegador ya está sobrecargado con exceso de JavaScript o manipulación del DOM, seguirás teniendo problemas de rendimiento. El Renderizado Concurrente optimiza la experiencia, pero no reduce la carga en sí.

## Entra Astro: Un enfoque radical para el rendimiento

Mientras React intenta hacer que la renderización sea más inteligente, Astro adopta una postura diferente: **¿y si evitamos la renderización por completo?**

La filosofía de Astro gira en torno a enviar menos JavaScript al navegador. Se enfoca en la generación de sitios estáticos (SSG por sus siglas en inglés) y en la arquitectura de "islas": renderizar la mayor cantidad de HTML posible durante el tiempo de construcción y enviar solo el JavaScript necesario para las partes de la página que requieren interactividad.

Este enfoque ataca el problema del rendimiento en su raíz: sobrecargar el navegador con JavaScript innecesario. Vamos a profundizar en por qué funciona.

### Lo que Astro hace bien

#### 1. **Cero JavaScript por defecto**

Por defecto, los componentes de Astro se renderizan como HTML puro, sin enviar JavaScript al navegador. Si no necesitas interactividad en un componente, Astro no desperdicia ancho de banda enviando scripts innecesarios. Compáralo con React: incluso los componentes estáticos en React llevan consigo la carga del runtime.

#### 2. **Arquitectura de Islas**

En Astro, los componentes interactivos—como una barra de búsqueda o un carrusel—se tratan como "islas" de JavaScript. Estas islas se hidratan solo cuando es necesario y no bloquean otras partes de la página.

Aquí hay un ejemplo:

```javascript
// archivo-astro.astro
---
const data = await fetchData();
---

<html>
  <body>
    <section>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </section>

    <SearchBar client:load />
  </body>
</html>
```

El componente `<SearchBar>` está marcado con `client:load`, lo que significa que su JavaScript solo se cargará una vez que la página ya esté renderizada. El resto de la página es HTML estático, haciéndola extremadamente rápida.

#### 3. **Primera Pintura Significativa**

Dado que Astro prioriza el HTML, la Primera Pintura Significativa de tu aplicación—el tiempo que tarda en mostrarse contenido útil a los usuarios—sucede mucho más rápido. Esto es esencial para la percepción de rendimiento, y es algo que ningún truco del Renderizado Concurrente puede solucionar si tu aplicación sigue cargando megabytes de JavaScript desde el principio.

### Ejemplo: Astro vs React

Supongamos que necesitas crear un blog con una sección de comentarios. Así es como se vería en Astro versus React:

#### Implementación en React

```jsx
function BlogPost({ title, content, comments }) {
  return (
    <div>
      <h1>{title}</h1>
      <p>{content}</p>
      <CommentsList comments={comments} />
    </div>
  );
}

function CommentsList({ comments }) {
  return (
    <ul>
      {comments.map(comment => (
        <li key={comment.id}>{comment.text}</li>
      ))}
    </ul>
  );
}
```

Incluso si la sección de comentarios está por debajo del pliegue, React aún enviará JavaScript para ella desde el principio. Entonces, el navegador acaba analizando y ejecutando ese código aunque el usuario no interactúe con los comentarios.

#### Implementación en Astro

```javascript
---
const data = await getPostData();
---

<html>
  <body>
    <article>
      <h1>{data.title}</h1>
      <p>{data.content}</p>
    </article>

    <!-- Los comentarios se cargan solo cuando son necesarios -->
    <CommentsList client:idle />
  </body>
</html>
```

Aquí, la sección de comentarios no se hidrata hasta que el navegador está inactivo. Mientras tanto, el contenido del blog es completamente HTML estático, por lo que se renderiza al instante.

## ¿Cuándo usar React vs Astro?

Seamos realistas: React no va a desaparecer. Es excelente para aplicaciones con mucha interactividad, como tableros de control, plataformas de redes sociales o cualquier cosa con actualizaciones dinámicas constantes. El Renderizado Concurrente es una revolución para este tipo de aplicaciones porque la capacidad de respuesta es crucial.

Pero para sitios web centrados en contenido—blogs, documentación, tiendas en línea, páginas de marketing—el enfoque de Astro tiene mucho más sentido. ¿Para qué pagar el precio del JavaScript en componentes que no necesitan ser interactivos? Astro te permite centrarte en entregar contenido estático rápidamente, añadiendo interactividad solo donde realmente importa.

## Conclusión

El Renderizado Concurrente es un gran paso adelante para React y el desarrollo frontend en general. Hace que las aplicaciones se sientan más rápidas al priorizar la experiencia del usuario durante la renderización. Pero no es una excusa para ignorar cuánto JavaScript estás enviando—o para olvidar que, a veces, la mejor manera de mejorar el rendimiento es simplemente enviar **menos cosas**.

El enfoque de Astro, centrado en una arquitectura basada en HTML estático e islas de JavaScript, es un contrapunto refrescante frente a los frameworks modernos de JavaScript. Nos recuerda que, a veces, el código más eficiente es el que ni siquiera se envía.

Si estás diseñando para la web, piensa bien en qué tipo de aplicación estás construyendo. Si es altamente interactiva, React y el Renderizado Concurrente pueden ser tu mejor opción. Pero si está centrada en contenido, Astro podría ser el cambio que necesitas para mejorar drásticamente el rendimiento.

## Recursos

- [Documentación de Renderizado Concurrente en React](https://react.dev/reference/react/concurrent-rendering)
- [Documentación de Astro: Arquitectura de Islas](https://docs.astro.build/en/concepts/islands/)
