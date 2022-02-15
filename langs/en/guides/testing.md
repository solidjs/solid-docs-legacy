---
title: Testing Solid 
description: How to test your Solid app
sort: 4
---
# Testing Solid 

To use your Solid code in production, it needs to be tested. Since you don't want to test everything manually, you need automated tests. Testing Solid code can be simple, once you got everything set up and know a few useful patterns for testing.

## Testing Setup

Before you set up testing, you need to choose your test runner. There is an abundance of choices, but we'll focus on two very different projects that are opposite extremes, jest and uvu. Jest is heavily integrated, uvu only brings the bare necessities. If you want to use another test runner, the setup for uvu should work for most other test runners.

### Setting up Jest

Unfortunately, integrated though it may be, jest will not support esm or typescript out of the box, but needs its transformer configuration set up.

The main options are solid-jest, which uses babel to transform the Solid code, omitting type checks on testing if TypeScript is used, and ts-jest, which uses the TypeScript compiler and checks the types within the tests.

If you are not using TypeScript, use solid-jest, otherwise choose if you want to check for types while running your tests or not.

#### Using solid-jest

Install the required dependencies:

```sh
> npm i --save-dev jest solid-jest # or yarn add -D or pnpm
```

Or for TypeScript:

```sh
> npm i --save-dev jest solid-jest @types/jest # or yarn add -D or pnpm
```

Next, you need to define your `.babelrc` if you haven't already done so:

```js
{
  "presets": [
    "@babel/preset-env",
    "babel-preset-solid",
    // only if you use TS with solid-jest
    "@babel/preset-typescript"
  ]
}
```

And amend your `package.json` so that it looks like this:

```js
{
  "scripts": {
    // your other scripts go here
    "test": "jest"
  },
  "jest": {
    "preset": "solid-jest/preset/browser",
    // insert setupFiles and other config
  }
}
```

#### Using ts-jest

To use ts-jest, you need first to install it:

```sh
> npm i --save-dev jest ts-jest @types/jest # or yarn add -D or pnpm
```

And then configure it in `package.json`:

```js
{ 
  "scripts": {
    // your other scripts go here
    "test": "jest"
  },
  "jest": {
    "preset": "ts-jest",
    "globals": {
      "ts-jest": {
        "tsconfig": "tsconfig.json",
        "babelConfig": {
          "presets": [
            "babel-preset-solid",
            "@babel/preset-env"
          ]
        }
      }
    },
    // insert setupFiles and other config
    // you probably want to test in browser mode:
    "testEnvironment": "jsdom",
    // unfortunately, solid cannot detect browser mode here,
    // so we need to manually point it to the right versions:
    "moduleNameMapper": {
      "solid-js/web": "<rootDir>/node_modules/solid-js/web/dist/web.cjs",
      "solid-js": "<rootDir>/node_modules/solid-js/dist/solid.cjs"
    }
    // windows users have to replace "/" with "\"
  }
}
```

### TypeScript and Jest

Since jest is injecting its testing facilities into the global scope, you need to load its types into tsconfig.json to satisfy the typescript compiler:

```js
{
  // part of tsconfig.json
  "types": ["jest"]
}
```

This requires the installation of `@types/jest` as mentioned before.

### Setting up uvu

First, you need to install the required packages:

```sh
> npm i --save-dev uvu solid-register jsdom # or yarn add -D or pnpm
```

Then setup your test script in `package.json`:

```sh
> npm set-script test "uvu -r solid-register"
```

Additional setup files can be added via `-r setup.ts`, ignore non-tests with `-i not-a-test.test.ts`.

### Coverage Reports

> Unfortunately, due to a [limitation of babel](https://github.com/babel/babel/issues/4289), we cannot get source maps output for transpiled JSX, which will result in components to show zero coverage. It will work for non-JSX code, though.

If you want to check code coverage of your tests, the favorite tool for uvu is c8. To install and set it up, run:

```sh
> npm i --save-dev c8 # or yarn add -D or pnpm
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

Now if you `npm run test:coverage`, you'll see the test coverage.

If you want nice HTML coverage reports, you can use `c8 -r html` instead of `c8` to enable the html reporter.

### Watch Mode

Neither `uvu` nor `tape` have a watch mode out of the box, but you can use `chokidar-cli` to do the same:

```sh
> npm i --save-dev chokidar-cli # or yarn add -D or pnpm
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# use .js/.jsx instead of .ts/.tsx
```

Now if you run `npm run test:watch`, the tests will run every time you change a file.

### solid-testing-library

If you want to test components, you should definitely install `solid-testing-library`:

```sh
> npm i --save-dev solid-testing-library # or yarn add -D or pnpm
```

This allows you to render your components, fire events and select elements from a user's perspective.

### @testing-library/jest-dom

If you are using jest, `solid-testing-library` works very well with `@testing-library/jest-dom`:

```sh
> npm i --save-dev @testing-library/jest-dom # or yarn add -D or pnpm
```

And import the extensions to expect in a setup file:

```ts
// test/jest-setup.ts
import '@testing-library/jest-dom/extend-expect';
```

And load that in jest using the following entry in package.json:

```js
{
  "jest": {
    // your other settings here
    setupFiles: ["@testing-library/jest-dom/extend-expect", "regenerator-runtime"]
  }
}
```

Also don't forget to include the types in `tsconfig.json`:

```js
{
  // part of tsconfig.json
  "types": ["jest", "@testing-library/jest-dom"]
}
```

### solid-dom-testing

If you are using another test runner, e.g. uvu or tape, there are a few assertion helpers in `solid-dom-testing` that support similar assertions:

```sh
> npm i --save-dev solid-dom-testing # or yarn add -D or pnpm
```

There's no setup required, you can just import and use the helpers in your tests as you see fit.

## vitest

There's a new kid on the block of unit testing called [vitest](https://vitest.dev/) and it aims to replace jest with something faster, yet providing almost the same feature set.

Unfortunately, at the time of writing, there is an issue in the module resolution that causes solid's server and client version loaded at the same time, which causes the reactive system to fail. Hopefully, this issue will be resolved at some point in the near future.

## Testing Patterns and Best Practices

Now that you have installed your testing tools, you should start to use them. In order to make this easier, solid supports a few nice patterns.

### Testing Reactive State

You may want to keep parts of your state separate from the components for ease of maintenance or being able to support multiple views. In this case, the interface against which you are testing is the state itself. Keep in mind that out of a [reactive root](https://www.solidjs.com/docs/latest/api#createroot) your state is not tracked and updates won't trigger effects and memos.

Also, since effects trigger asynchronously, it can help to wrap our assertions in a final effect. Alternatively, to observe a sequence of effects over multiple changes, it can help to return the necessary tools from `createRoot` and execute them in an async test function (as `createRoot` itself cannot take an `async` function).

As an example, let's test `createLocalStorage` from the [todo example](https://www.solidjs.com/examples/todos):

```ts
import { createEffect } from "solid-js";
import { createStore, Store, SetStoreFunction } from "solid-js/store";

export function createLocalStore<T>(initState: T): [Store<T>, SetStoreFunction<T>] {
	const [state, setState] = createStore(initState);
	if (localStorage.todos) setState(JSON.parse(localStorage.todos));
	createEffect(() => (localStorage.todos = JSON.stringify(state)));
	return [state, setState];
}
```

Instead of creating a TODO component, we can test this model in isolation; when we do that, we need to keep in mind that 1. reactive changes only work when they have a tracking context provided by `render` or `createRoot` and 2. are asynchronous, but we can use `createEffect` to catch them. Using `createRoot` has the advantage that we can trigger the disposal manually:

#### Testing in Jest

```ts
import { createLocalStore } from "./main.tsx";
import { createRoot, createEffect } from "solid-js";

describe("createLocalStore", () => {
  beforeEach(() => { 
    localStorage.removeItem("todos");
  });

  const initialState = {
    todos: [],
    newTitle: ""
  };

  test("it reads pre-existing state from localStorage", () => createRoot(dispose => {
    const savedState = { todos: [], newTitle: "saved" };
    localStorage.setItem("todos", JSON.stringify(savedState));
    const [state] = createLocalStore(initialState);
    expect(state).toEqual(savedState);
    dispose();
  }));

  test("it stores new state to localStorage", () => createRoot(dispose => {
    const [state, setState] = createLocalStore(initialState);
    setState("newTitle", "updated");
    // to catch an effect, use an effect
    return new Promise<void>((resolve) => createEffect(() => {
      expect(JSON.parse(localStorage.todos || ""))
        .toEqual({ todos: [], newTitle: "updated" });
      dispose();
      resolve();
    }));
  }));

  test("it updates state multiple times", async () => {
    const {dispose, setState} = createRoot(dispose => {
      const [state, setState] = createLocalStore(initialState);
      return {dispose, setState};
    });
    setState("newTitle", "first");
    // wait a tick to resolve all effects
    await new Promise((done) => setTimeout(done, 0));
    expect(JSON.parse(localStorage.todos || ""))
      .toEqual({ todos: [], newTitle: "first" });
    setState("newTitle", "second");
    await new Promise((done) => setTimeout(done, 0));
    expect(JSON.parse(localStorage.todos || ""))
      .toEqual({ todos: [], newTitle: "first" });
    dispose();
  });
});
```

#### Testing in uvu

```ts
import { createLocalStore } from "./main";
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { createEffect, createRoot } from "solid-js";

const todoTest = suite("createLocalStore");

todoTest.before.each(() => { 
  localStorage.removeItem("todos");
});

const initialState = {
  todos: [],
  newTitle: ""
};

todoTest("it reads pre-existing state from localStorage", () => 
  createRoot(dispose => {
    const savedState = { todos: [], newTitle: "saved" };
    localStorage.setItem("todos", JSON.stringify(savedState));
    const [state] = createLocalStore(initialState);
    assert.equal(state, savedState);
    dispose();
  }));

todoTest("it stores new state to localStorage", () =>
  createRoot(dispose => {
    const [_, setState] = createLocalStore(initialState);
    setState("newTitle", "updated");
    // to catch an effect, we need an effect
    return new Promise<void>((resolve) => createEffect(() => {
      assert.equal(
        JSON.parse(localStorage.todos || ""),
        { todos: [], newTitle: "updated" }
      );
      dispose();
      resolve();
    }));
  }));

todoTest.run();
```

### Testing directives

[Directives](https://www.solidjs.com/docs/latest/api#use%3A___) allow using refs in a reusable way. They are basically functions that follow the pattern `(ref: HTMLElement, data: Accessor<any>) => void`. In our [directives tutorial](https://www.solidjs.com/tutorial/bindings_directives?solved), we define the `clickOutside` directive that should call the callback wrapped in the accessor argument.

We could now create a component and use the directive in there, but then we'd be testing the use of directives instead of directly testing the directive. It's simpler to test the surface of the directive by providing a mounted node and the accessor:

#### Testing in Jest

```ts
// click-outside.test.ts
import clickOutside from "click-outside";
import { createRoot } from "solid-js";
import { fireEvent } from "solid-testing-library";

describe("clickOutside", () => {
  const ref = document.createElement("div");
  
  beforeAll(() => {
    document.body.appendChild(ref);
  });

  afterAll(() => {
    document.body.removeChild(ref);
  });

  test("will trigger on click outside", () => createRoot((dispose) =>
    new Promise<void>((resolve) => {
      let clickedOutside = false;
      clickOutside(ref, () => () => { clickedOutside = true; });
      document.body.addEventListener("click", () => {
        expect(clickedOutside).toBeTruthy();
        dispose();
        resolve();
      });
      fireEvent.click(document.body);
    })
  ));

  test("will not trigger on click inside", () => createRoot((dispose) =>
    new Promise<void>((resolve) => {
      let clickedOutside = false;
      clickOutside(ref, () => () => { clickedOutside = true; });
      ref.addEventListener("click", () => {
        expect(clickedOutside).toBeFalsy();
        dispose();
        resolve();
      });
      fireEvent.click(ref);
    })
  ));
});
```

#### Testing in uvu

```ts
// click-outside.test.ts
import clickOutside from 'click-outside.tsx';
import { createRoot } from 'solid-js';
import { fireEvent } from 'solid-testing-library';

const clickTest = suite('clickOutside');

const ref = document.createElement('div');
  
clickTest.before(() => {
  document.body.appendChild(ref);
});

clickTest.after(() => {
  document.body.removeChild(ref);
});

clickTest('will trigger on click outside', () => createRoot((dispose) =>
  new Promise<void>((resolve) => {
    let clickedOutside = false;
    clickOutside(ref, () => () => { clickedOutside = true; });
    document.body.addEventListener('click', () => {
      assert.ok(clickedOutside);
      dispose();
      resolve();
    });
    fireEvent.click(document.body);
  })
));

clickTest('will not trigger on click inside', () => createRoot((dispose) =>
  new Promise<void>((resolve) => {
    let clickedOutside = false;
    clickOutside(ref, () => () => { clickedOutside = true; });
    ref.addEventListener('click', () => {
      assert.is(clickedOutside, false);
      dispose();
      resolve();
    });
    fireEvent.click(ref);
  })
));

clickTest.run();
```

### Testing components

Let's take a very simple click-counter component that we want to test:

```ts
// main.tsx
import { createSignal, Component } from "solid-js";

export const Counter: Component = () => {
  const [count, setCount] = createSignal(0);

  return <div role="button" onClick={() => setCount(c => c + 1)}>
    Count: {count()}
  </div>;
}
```

You should definitely install `solid-testing-library`, if you haven't already done that; it's most important helpers are `render` to render a component to the dom in a managed way, `fireEvent` to dispatch events in a way that resembles actual user events and `screen` to provide global selectors. If you use jest, you should also install `@testing-library/jest-dom` and set it up to have some helpful assertions, otherwise install `solid-dom-testing` as described above.

#### Testing in Jest

```ts
// main.test.tsx
import { Counter } from "./main";
import { cleanup, fireEvent, render, screen } from "solid-testing-library";

describe("Counter", () => {
  afterEach(cleanup);

  test("it starts with zero", () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Count: 0");
  });

  test("it increases its value on click", async () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // the event loop takes one Promise to resolve to be finished
    await Promise.resolve();
    expect(button).toHaveTextContent("Count: 1");
    fireEvent.click(button);
    await Promise.resolve();
    expect(button).toHaveTextContent("Count: 2");
  });
});
```

#### Testing in uvu

```ts
// main.test.tsx
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Counter } from "main";
import { fireEvent, render, screen } from "solid-testing-library";
import { isInDocument, hasTextContent } from "solid-dom-testing";


const testCounter = suite("Counter");

testCounter.after.each(cleanup);

testCounter("it starts with zero", () => {
  const { getByRole } = render(() => <Counter />);
  const button = getByRole("button");
  assert.ok(isInDocument(button), "button not in dom");
  assert.ok(hasTextContent(button, "Count: 0"), "wrong text content");
});

testCounter("it increases its value on click", async () => {
  render(() => <Counter />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  // the event loop takes one Promise to resolve to be finished
  await Promise.resolve();
  assert.ok(hasTextContent(button, "Count: 1"), "not count 1 after first click");
  fireEvent.click(button);
  await Promise.resolve();
  assert.ok(hasTextContent(button, "Count: 2"), "not count 2 after first click");
});

testCounter.run();
```
