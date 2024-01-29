# 测试 Solid

要在生产中使用您的 Solid 代码，需要对其进行测试。 由于您不想手动测试所有内容，因此您需要自动化测试。 本指南介绍了如何设置所有内容以及一些用于测试 Solid 代码的有用模式。

## 测试设置

我们为两个测试运行器提供支持：

- jest - 非常完善，具有许多功能

- uvu - 只带来必需品

两者都基于 [solid-testing-library](https://github.com/solidjs/solid-testing-library)，将 [Testing Library](https://testing-library.com/) 集成到 Solid 中。测试库模仿轻量级浏览器，并提供一个 API 来与您的测试进行交互。

我们为 Solid 和 Jest 测试维护了一个入门模板。我们建议您将项目基于它，或者将启动器模板安装在临时项目中并将配置从它复制到您自己的项目中。

模板使用 [degit](https://github.com/Rich-Harris/degit) 进行安装。

### 设置 Jest

Jest 集成基于 [solid-jest/preset/browser](https://github.com/solidjs/solid-jest) Jest 配置预设，它允许您在浏览器中使用 Solid。这使用 babel 来转换 Solid 代码。

它使用 [jest-dom](https://github.com/testing-library/jest-dom) 使用一堆自定义匹配器来扩展 `expect` 来帮助您编写测试。

#### Jest 与 TypeScript (`ts-jest`)

```bash
$ npx degit solidjs/templates/ts-jest my-solid-project
$ cd my-solid-project
$ npm install # or pnpm install or yarn install
```

请注意，此模板在测试期间不进行类型检查；您可以使用 IDE 或 `package.json` 中的自定义 `tsc --noEmit` 脚本来触发此类检查。

### 设置 uvu

我们还为 `uvu` 维护了一个入门模板。

它包括 [solid-dom-testing](https://www.npmjs.com/package/solid-dom-testing) 以帮助您编写对测试库有用的断言。

#### Uvu 与 TypeScript (`ts-uvu`)

```bash
$ npx degit solidjs/templates/ts-uvu my-solid-project
$ cd my-solid-project
$ npm install # or pnpm install or yarn install
```

#### Uvu 覆盖率报告

> 不幸的是，由于 [babel 的限制](https://github.com/babel/babel/issues/4289)，我们无法获得转译 JSX 的源映射输出，这将导致组件显示零覆盖。不过，它适用于非 JSX 代码。

如果您想检查测试的代码覆盖率，最喜欢的 uvu 工具是 c8。要安装和设置它，请运行：

```sh
> npm i --save-dev c8 # or yarn add -D or pnpm
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

现在，如果你 `npm run test:coverage`，你会看到测试覆盖率。

如果你想要漂亮的 HTML 覆盖率报告，你可以使用 `c8 -r html` 而不是 `c8` 来启用 html 报告器。

#### Watch Mode

`uvu` 没有开箱即用的监视模式，但您可以使用 `chokidar-cli` 来做同样的事情：

```sh
> npm i --save-dev chokidar-cli # or yarn add -D or pnpm
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# use .js/.jsx instead of .ts/.tsx
```

现在，如果您运行 `npm run test:watch`，每次更改文件时都会运行测试。

## 测试模式和最佳实践

现在您已经安装了测试工具，您应该开始使用它们。为了使这更容易，Solid 支持一些不错的模式。

### 测试响应状态

您可能希望将部分状态与组件分开，以便于维护或能够支持多个视图。在这种情况下，您正在测试的接口就是状态本身。请记住，在 [reactive root](https://www.solidjs.com/docs/latest/api#createroot) 之外，您的状态不会被跟踪，更新不会触发 effect 和 memo。

此外，由于 effect 是异步触发的，它可以帮助将我们的断言包装在最终 effect 中。或者，要观察多个更改的一系列 effect，它可以帮助从 `createRoot` 返回必要的工具并在异步测试函数中执行它们（因为`createRoot`本身不能接受`async`函数）。

作为示例，让我们测试 [todo 示例](https://www.solidjs.com/examples/todos) 中的 `createLocalStore`：

```ts
import { createEffect } from "solid-js";
import { createStore, Store, SetStoreFunction } from "solid-js/store";

export function createLocalStore<T>(
  initState: T
): [Store<T>, SetStoreFunction<T>] {
  const [state, setState] = createStore(initState);
  if (localStorage.todos) setState(JSON.parse(localStorage.todos));
  createEffect(() => (localStorage.todos = JSON.stringify(state)));
  return [state, setState];
}
```

我们可以单独测试这个模型，而不是创建一个 TODO 组件；当我们这样做时，我们需要记住 1. 响应式更改只有在它们具有由 `render` 或 `createRoot` 提供的跟踪上下文时才有效，并且 2. 是异步的，但我们可以使用 `createEffect` 来捕获它们。使用 `createRoot` 的好处是我们可以手动触发处理：

#### 用 Jest 进行测试

```ts
import { createLocalStore } from "./main.tsx";
import { createRoot, createEffect } from "solid-js";

describe("createLocalStore", () => {
  beforeEach(() => {
    localStorage.removeItem("todos");
  });

  const initialState = {
    todos: [],
    newTitle: "",
  };

  test("it reads pre-existing state from localStorage", () =>
    createRoot((dispose) => {
      const savedState = { todos: [], newTitle: "saved" };
      localStorage.setItem("todos", JSON.stringify(savedState));
      const [state] = createLocalStore(initialState);
      expect(state).toEqual(savedState);
      dispose();
    }));

  test("it stores new state to localStorage", () =>
    createRoot((dispose) => {
      const [state, setState] = createLocalStore(initialState);
      setState("newTitle", "updated");
      // to catch an effect, use an effect
      return new Promise<void>((resolve) =>
        createEffect(() => {
          expect(JSON.parse(localStorage.todos || "")).toEqual({
            todos: [],
            newTitle: "updated",
          });
          dispose();
          resolve();
        })
      );
    }));

  test("it updates state multiple times", async () => {
    const { dispose, setState } = createRoot((dispose) => {
      const [state, setState] = createLocalStore(initialState);
      return { dispose, setState };
    });
    setState("newTitle", "first");
    // wait a tick to resolve all effects
    await new Promise((done) => setTimeout(done, 0));
    expect(JSON.parse(localStorage.todos || "")).toEqual({
      todos: [],
      newTitle: "first",
    });
    setState("newTitle", "second");
    await new Promise((done) => setTimeout(done, 0));
    expect(JSON.parse(localStorage.todos || "")).toEqual({
      todos: [],
      newTitle: "first",
    });
    dispose();
  });
});
```

#### 使用 uvu 进行测试

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
  newTitle: "",
};

todoTest("it reads pre-existing state from localStorage", () =>
  createRoot((dispose) => {
    const savedState = { todos: [], newTitle: "saved" };
    localStorage.setItem("todos", JSON.stringify(savedState));
    const [state] = createLocalStore(initialState);
    assert.equal(state, savedState);
    dispose();
  })
);

todoTest("it stores new state to localStorage", () =>
  createRoot((dispose) => {
    const [_, setState] = createLocalStore(initialState);
    setState("newTitle", "updated");
    // to catch an effect, we need an effect
    return new Promise<void>((resolve) =>
      createEffect(() => {
        assert.equal(JSON.parse(localStorage.todos || ""), {
          todos: [],
          newTitle: "updated",
        });
        dispose();
        resolve();
      })
    );
  })
);

todoTest.run();
```

### 测试指令

[指令](https://www.solidjs.com/docs/latest/api#use%3A___) 允许以可重用的方式使用 refs。它们基本上是遵循 `(ref: HTMLElement, data: Accessor<any>) => void` 模式的函数。在我们的 [指令教程](https://www.solidjs.com/tutorial/bindings_directives?solved) 中，我们定义了 `clickOutside` 指令，该指令应该调用包装在访问器参数中的回调。

我们现在可以创建一个组件并在其中使用指令，但随后我们将测试指令的使用，而不是直接测试指令。通过提供已安装的节点和访问器来测试指令的表面更简单：

#### 用 Jest 进行测试

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

  test("will trigger on click outside", () =>
    createRoot(
      (dispose) =>
        new Promise<void>((resolve) => {
          let clickedOutside = false;
          clickOutside(ref, () => () => {
            clickedOutside = true;
          });
          document.body.addEventListener("click", () => {
            expect(clickedOutside).toBeTruthy();
            dispose();
            resolve();
          });
          fireEvent.click(document.body);
        })
    ));

  test("will not trigger on click inside", () =>
    createRoot(
      (dispose) =>
        new Promise<void>((resolve) => {
          let clickedOutside = false;
          clickOutside(ref, () => () => {
            clickedOutside = true;
          });
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

#### 使用 uvu 进行测试

```ts
// click-outside.test.ts
import clickOutside from "click-outside.tsx";
import { createRoot } from "solid-js";
import { fireEvent } from "solid-testing-library";

const clickTest = suite("clickOutside");

const ref = document.createElement("div");

clickTest.before(() => {
  document.body.appendChild(ref);
});

clickTest.after(() => {
  document.body.removeChild(ref);
});

clickTest("will trigger on click outside", () =>
  createRoot(
    (dispose) =>
      new Promise<void>((resolve) => {
        let clickedOutside = false;
        clickOutside(ref, () => () => {
          clickedOutside = true;
        });
        document.body.addEventListener("click", () => {
          assert.ok(clickedOutside);
          dispose();
          resolve();
        });
        fireEvent.click(document.body);
      })
  )
);

clickTest("will not trigger on click inside", () =>
  createRoot(
    (dispose) =>
      new Promise<void>((resolve) => {
        let clickedOutside = false;
        clickOutside(ref, () => () => {
          clickedOutside = true;
        });
        ref.addEventListener("click", () => {
          assert.is(clickedOutside, false);
          dispose();
          resolve();
        });
        fireEvent.click(ref);
      })
  )
);

clickTest.run();
```

### 测试组件

让我们来测试一个简单的点击计数器组件：
```ts
// main.tsx
import { createSignal, Component } from "solid-js";

export const Counter: Component = () => {
  const [count, setCount] = createSignal(0);

  return (
    <div role="button" onClick={() => setCount((c) => c + 1)}>
      Count: {count()}
    </div>
  );
};
```

这里我们使用 `solid-testing-library`。最重要的助手是 `render` 以托管方式将组件渲染到 DOM，`fireEvent` 以类似于实际用户事件的方式调度事件和 `screen` 提供全局选择器。我们还使用由 `@testing-library/jest-dom` 提供的添加到 `expect` 的有用断言。

#### 用 Jest 进行测试

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

#### 使用 uvu 进行测试

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
  assert.ok(
    hasTextContent(button, "Count: 1"),
    "not count 1 after first click"
  );
  fireEvent.click(button);
  await Promise.resolve();
  assert.ok(
    hasTextContent(button, "Count: 2"),
    "not count 2 after first click"
  );
});

testCounter.run();
```
