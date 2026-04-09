---
title: 'Why React’s Re-Renders Are Ruining Your Performance (And How To Fix Them)'
date: 2026-03-18
tags: ['react', 'performance', 'frontend']
summary: "Learn why React's re-renders can tank your app's performance, how to diagnose them with practical tools, and most importantly, how to fix them with memoization, proper state management, and optimized component design."
language: en
slug: why-reacts-re-renders-are-ruining-your-performance-and-how-to-fix-them
category: frontend
draft: false
readingTime: 6
---

## React’s Re-Renders: A Double-Edged Sword

Let’s set the stage: React’s declarative UI model is awesome. It abstracts away DOM manipulation, giving us a clean way to express how UIs should look based on the component’s state and props. But with that abstraction comes a cost—re-renders. If you’re not careful, React’s virtual DOM diffing and reconciliation can quietly become your performance bottleneck.

And let me tell you, if you’re not paying attention to re-renders, it’s almost certainly causing subtle (or not-so-subtle) performance issues in your app. The good news? Most of these issues are fixable once you understand why they happen.

In this post, we’re going to:

1. Understand why React re-renders happen in the first place.
2. Diagnose unnecessary re-renders in your app.
3. Implement practical fixes to keep React performant when things start to scale.

---

## Why Does React Re-Render So Much?

React re-renders a component whenever its state or props change. Simple enough, right? But there’s a gotcha: a re-render triggers React to re-run the component function (or invoke the `render()` method for class components), which in turn cascades into rendering child components. This is usually fine for small apps, but in a real-world app with hundreds or thousands of components? It can get ugly.

Here’s a quick example:

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  console.log('App rendered');

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child />
    </div>
  );
}

function Child() {
  console.log('Child rendered');
  return <div>I'm a child component</div>;
}
```

If you click the "Increment" button, both `App` and `Child` re-render. But why? `Child` has no dependency on `count`, yet React still re-renders it because `App` re-runs, and in turn, it re-creates the `Child` tree.

On small scales, this is fine. But if `Child` is a complex component, or if it has its own deeply nested child components, you’ve got a problem.

---

## How to Spot Unnecessary Re-Renders

The most essential tool for spotting re-renders is **React DevTools**. It has a feature to highlight components that re-rerender in the browser. You can enable it like this:

1. Open React DevTools.
2. Go to the ⚛️ "Settings" tab.
3. Enable **Highlight updates when components render**.

Now, every time you interact with your app, components that re-render will briefly flash on the screen. If you see components lighting up even though their data hasn’t changed, you know you’ve got unnecessary re-renders.

Alternatively, you can sprinkle some `console.log` statements in your components to monitor renders. This is manual and noisy, but it works in a pinch.

---

## Fixing React Re-Renders

Here’s the good stuff. Let’s dive into practical methods for preventing unnecessary re-renders.

### 1. Use `React.memo` to Prevent Unnecessary Updates

`React.memo` is a higher-order component that prevents re-renders if the props haven’t changed. It’s like `React.PureComponent` but for functional components.

Here’s how you use it:

```jsx
const Child = React.memo(function Child() {
  console.log('Child rendered');
  return <div>I'm a memoized child component</div>;
});

function App() {
  const [count, setCount] = React.useState(0);

  console.log('App rendered');

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child />
    </div>
  );
}
```

Now, if you click the button, only `App` will re-render. `Child` is memoized and will skip rendering unless its props change.

#### When Not to Use `React.memo`

- If your component is very simple, the performance gain might be negligible.
- If the props change frequently, memoization overhead can outweigh its benefits.
- If your component depends on external state (like context), you need to ensure it’s memoized properly.

### 2. Optimize Functions and Objects Used as Props

One of the most common causes of re-renders is passing a new function or object as a prop on every render. Why? Because React compares props using shallow equality. Creating a new function or object means the reference changes, so React thinks the prop has changed.

Here’s an example of what _not_ to do:

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    console.log('Clicked!');
  };

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleClick} />
    </div>
  );
}

function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click Me</button>;
}
```

The `Child` component will re-render every time `App` re-renders, even though `handleClick` is functionally the same.

The fix? Use `useCallback` for functions and `useMemo` for objects:

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  const handleClick = React.useCallback(() => {
    console.log('Clicked!');
  }, []);

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Child onClick={handleClick} />
    </div>
  );
}

const Child = React.memo(function Child({ onClick }) {
  console.log('Child rendered');
  return <button onClick={onClick}>Click Me</button>;
});
```

By memoizing `handleClick`, we ensure the function reference remains stable across renders, and `Child` will only re-render if its props truly change.

### 3. Lift State Only When Necessary

It’s tempting to lift state as high as possible to make it accessible to multiple components. But every time that parent component re-renders, all its children will re-render too—even if they don’t depend on the state.

Instead, keep state as close to where it’s used as possible. For example, let’s say you have this structure:

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

Here, `ChildB` will re-render every time `count` changes, even though it doesn’t use `count`. To fix this, move `count` into `ChildA` if possible.

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
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Count: {count}</p>
    </div>
  );
}
```

### 4. Use `React.Context` Carefully

React Context is great for passing data without prop-drilling, but it’s another common source of re-renders. When a context value changes, **every component that consumes that context will re-render**, even if they don’t care about the part of the value that changed.

To avoid this, split your context into smaller, more focused contexts. For example:

```jsx
const UserContext = React.createContext();
const ThemeContext = React.createContext();
```

This way, if the user context changes, it won’t unnecessarily trigger re-renders in components that only care about the theme context.

---

## Final Thoughts

React’s rendering model is powerful, but it’s not magic. If you’re not careful, it can lead to inefficiencies that are painful to debug. The key is understanding when and why React re-renders, and applying techniques like `React.memo`, `useCallback`, and state colocation to minimize the impact.

Remember: not all re-renders are bad. Some are necessary. Optimization is about reducing unnecessary work, not eliminating all re-renders. Start small, measure performance, and iterate.

If you take away one thing from this post, let it be this: **React doesn’t slow your app down—your code does.** But hey, that’s good news, because it means you can fix it.

Got a favorite performance tip I missed? Let me know—I’m always looking to learn new tricks!
