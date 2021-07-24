# Introduction

Welcome to the Solid tutorial! This tutorial will teach you everything you need to know to create performant web applications. You can also refer to the API and guides to learn more about how Solid works.

# What is Solid?

Solid is a JavaScript framework for making interactive web applications. It leverages a custom compiler to transform JSX, an HTML inspired JavaScript XML dialect, into optimal DOM operations. Updates are powered by a fine-grained reactivity system that reduces the overhead of diffing which results in best in class performance.

# Anatomy of a Solid App

A Solid App is composed of functions that we call Components. Component names in Solid follow the Pascal naming convention in which the first letter of each word in a component name is capitalized. This name can then be used as tags within our JSX like `<HelloWorld />`.

A Solid app starts with a `render` function. This is our entry point. It takes 2 arguments, a function wrapping our application code and an element to mount to:

```jsx
render(() => <HelloWorld />, document.getElementById('app'))
```
# Leveraging this Tutorial

Each lesson in the tutorial includes a simple scenario with instructions on how to complete it using the feature highlighted. At any point you can click the solve button to see the solution or click reset to start over. The code editor itself has a console and an output tab where you can see the compiled output generated from your code. Look at it if you are curious to see how Solid generates code.

Have Fun and Good Luck!
