---
title: 'Por qué los Re-Renders en React están arruinando tu rendimiento (y cómo solucionarlo)'
date: 2026-04-08
tags: ['react', 'rendimiento', 'frontend', 'optimización']
summary: 'Descubre por qué los re-renders en React pueden afectar el rendimiento de tu aplicación, cómo identificarlos usando herramientas prácticas y, lo más importante, cómo solucionarlos aplicando memoización, gestión eficiente del estado y diseño optimizado de componentes.'
language: es
slug: why-reacts-re-renders-are-ruining-your-performance-and-how-to-fix-them
category: frontend
draft: false
readingTime: 6
---

## Los re-renders en React: un arma de doble filo

Pongámonos en contexto: el modelo declarativo de interfaces de usuario de React es una maravilla. Nos permite abstraer la manipulación directa del DOM, ofreciéndonos una forma limpia y eficiente de definir cómo debería lucir nuestra interfaz según el estado y las props de los componentes. Pero con esa abstracción viene un costo: los re-renders. Si no prestamos atención, el proceso de "diffing" y reconciliación del virtual DOM puede convertirse en un cuello de botella para el rendimiento.

Y te lo digo desde ya: si no te has detenido a pensar en los re-renders, lo más probable es que estén generando problemas de rendimiento, ya sea de forma sutil o bastante notable en tu aplicación. ¿La buena noticia? La mayoría de estos problemas se pueden solucionar una vez que entiendes por qué ocurren.

En este post, vamos a:

1. Comprender por qué suceden los re-renders en React.
2. Diagnosticar re-renders innecesarios en tu app.
3. Implementar soluciones prácticas para mantener el rendimiento de React bajo control.

---

## ¿Por qué React hace tantos re-renders?

React vuelve a renderizar un componente cada vez que cambian su estado o sus props. Sencillo, ¿verdad? Pero hay un pequeño inconveniente: un re-render significa que React vuelve a ejecutar la función del componente (o el método `render()` en componentes de clase), lo que a su vez desencadena el re-renderizado de los componentes hijos. Esto suele ser manejable en aplicaciones pequeñas, pero ¿y en una app del mundo real con cientos o miles de componentes? Ahí es donde las cosas se complican.

Aquí tienes un ejemplo rápido:

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  console.log('App rendered');

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <Child />
    </div>
  );
}

function Child() {
  console.log('Child rendered');
  return <div>Soy un componente hijo</div>;
}
```

Si haces clic en el botón "Incrementar", tanto `App` como `Child` se vuelven a renderizar. Pero ¿por qué? `Child` no depende en absoluto de `count`, y aun así React lo vuelve a renderizar porque `App` se ejecuta nuevamente, y eso recrea todo el árbol del componente `Child`.

En aplicaciones pequeñas, esto no es un gran problema. Pero si `Child` es un componente complejo o tiene su propio árbol profundo de hijos, esto puede convertirse en un verdadero dolor de cabeza.

---

## Cómo detectar re-renders innecesarios

La herramienta más esencial para identificar re-renders es **React DevTools**. Esta incluye una función que resalta los componentes que se vuelven a renderizar en el navegador. Puedes habilitarla así:

1. Abre React DevTools.
2. Ve a la pestaña ⚛️ "Settings".
3. Habilita **Resaltar actualizaciones cuando los componentes se rendericen**.

Ahora, cada vez que interactúes con tu app, los componentes que se vuelvan a renderizar parpadearán brevemente en la pantalla. Si notas que algunos componentes se están iluminando sin razón aparente, probablemente tengas re-renders innecesarios.

Alternativamente, puedes usar `console.log` en tus componentes para monitorear su renderizado. Aunque sea un poco más manual y engorroso, funciona en caso de apuro.

---

## Cómo solucionar los re-renders en React

Ahora viene la parte buena. Veamos algunos métodos prácticos para prevenir los re-renders innecesarios.

### 1. Usa `React.memo` para evitar actualizaciones innecesarias

`React.memo` es un higher-order component (HOC) que evita los re-renders si las props no cambian. Es similar a `React.PureComponent`, pero pensado específicamente para componentes funcionales.

Así es como se usa:

```jsx
const Child = React.memo(function Child() {
  console.log('Child rendered');
  return <div>Soy un componente hijo memoizado</div>;
});

function App() {
  const [count, setCount] = React.useState(0);

  console.log('App rendered');

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <Child />
    </div>
  );
}
```

Ahora, si haces clic en el botón, solo `App` se volverá a renderizar. `Child` está memoizado y solo se renderizará si cambian sus props.

#### Cuándo evitar `React.memo`

- Si tu componente es muy simple, el beneficio de rendimiento probablemente sea insignificante.
- Si las props cambian con frecuencia, el costo de la memoización podría superar sus beneficios.
- Si tu componente depende de estados externos (como un contexto), asegúrate de manejar correctamente su memoización.

### 2. Optimiza las funciones y objetos usados como props

Una de las causas más comunes de los re-renders es pasar una nueva función u objeto como prop en cada renderizado. ¿Por qué? Porque React compara las props usando igualdad superficial. Si creas una nueva función u objeto, la referencia cambia, y React asume que las props han cambiado.

Ejemplo de lo que **no** debes hacer:

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    console.log('¡Click!');
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <Child onClick={handleClick} />
    </div>
  );
}

function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Haz clic aquí</button>;
}
```

En este caso, el componente `Child` se volverá a renderizar cada vez que `App` se renderice, aunque `handleClick` siga siendo funcionalmente el mismo.

La solución: usa `useCallback` para funciones y `useMemo` para objetos:

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  const handleClick = React.useCallback(() => {
    console.log('¡Click!');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <Child onClick={handleClick} />
    </div>
  );
}

const Child = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Haz clic aquí</button>;
});
```

Al memoizar `handleClick`, nos aseguramos de que la referencia de la función sea estable entre renderizados, y `Child` solo se renderizará si sus props realmente cambian.

### 3. Eleva el estado solo cuando sea necesario

Es tentador elevar el estado lo más alto posible para hacerlo accesible a múltiples componentes. Pero cada vez que ese componente padre se re-renderiza, todos sus hijos también lo harán, incluso si no dependen de ese estado.

En su lugar, mantén el estado lo más cerca posible de donde se usa. Por ejemplo:

```jsx
function Parent() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <ChildA count={count} />
      <ChildB />
    </div>
  );
}
```

Aquí, `ChildB` se volverá a renderizar cada vez que cambie `count`, aunque no use ese estado. Para solucionarlo, mueve `count` dentro de `ChildA` si es posible:

```jsx
function Parent() {
  return (
    <div>
      <ChildA />
      <ChildB />
    </div>
  );
}

function ChildA() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <p>Contador: {count}</p>
    </div>
  );
}
```

### 4. Usa `React.Context` con cuidado

React Context es ideal para pasar datos sin prop-drilling, pero también puede ser una fuente común de re-renders. Cuando cambia el valor de un contexto, **cada componente que lo consuma se volverá a renderizar**, incluso si no le afecta directamente.

Para evitarlo, divide tu contexto en partes más específicas. Por ejemplo:

```jsx
const UserContext = React.createContext();
const ThemeContext = React.createContext();
```

De este modo, si el contexto del usuario cambia, no activará re-renders innecesarios en componentes que solo dependan del tema.

---

## Reflexión final

El modelo de renderizado de React es realmente potente, pero no es magia. Si no tienes cuidado, puede llevarte a ineficiencias que son difíciles de depurar. La clave está en entender cuándo y por qué React vuelve a renderizar, y aplicar técnicas como `React.memo`, `useCallback` y la colocación estratégica del estado para minimizar el impacto.

Recuerda: no todos los re-renders son malos. Algunos son necesarios. La optimización se trata de reducir el trabajo innecesario, no de eliminar todos los re-renders. Comienza con pequeños pasos, mide el rendimiento y mejora progresivamente.

Si hay algo que te lleves de este artículo, que sea esto: **React no hace tu aplicación lenta, es tu código el que lo hace.** Pero, oye, eso es una buena noticia, porque significa que puedes solucionarlo.

¿Tienes algún consejo extra sobre rendimiento que me haya perdido? ¡Compártelo! Siempre estoy buscando aprender más trucos.
