# Solid 테스트

프로덕션에서 Solid 코드를 사용하려면 테스트가 필요합니다. 모든 테스트를 수동으로 하고 싶지는 않을테니, 자동화된 테스트가 필요합니다. 이 가이드에는 모든 설정 방법과 함께 Solid 코드 테스트를 위한 몇 가지 유용한 테스트 패턴에 대해 설명합니다.

## 테스트 설정

테스트 환경을 설정하기 전에, 테스트 Runner를 먼저 선택해야 합니다. 많은 선택지가 있지만, 매우 극단적으로 반대되는 두 개의 프로젝트인 uvu와 Jest, 그리고 vitest라는 새로운 선택지에 촛점을 맞출 것입니다. Jest 는 강력하게 통합되어 있으며, uvu는 필수적인 기능만 제공하고, vitest는 모든 기능을 갖추고 있지만 단순합니다. 다른 테스트 Runner를 사용하고 싶다면, uvu 설정 방법을 적용하면 다른 대부분의 테스트 Runner에서도 작동할 것입니다.

### Jest 설정

안타깝게도, 통합이 되더라도, jest는 esm 이나 타입스크립트를 바로 지원하지 않으며, 변환을 위한 설정이 필요합니다.

첫번째 옵션은 babel을 사용해 Solid 코드를 변환하고 타입스크립트 사용시 타입 체크를 제거하는 solid-jest 입니다. 다른 옵션은 타입스크립트 컴파일러를 사용해 테스트내에서 타입을 체크하는 ts-jest입니다.

타입스크립트를 사용하지 않는다면 solid-jest를 사용하고, 테스트 실행시 타입을 체크하려면 ts-jest를 선택하세요.

#### solid-jest 사용하기

필요한 디펜던시를 설치합니다:

```sh
> npm i --save-dev jest solid-jest # yarn add -D 또는 pnpm
```

타입스크립트 사용시:

```sh
> npm i --save-dev jest solid-jest @types/jest # yarn add -D 또는 pnpm
```

다음으로, `.babelrc`가 설정되어 있지 않다면 다음과 같이 정의해야합니다:

```js
{
  "presets": [
    "@babel/preset-env",
    "babel-preset-solid",
    // solid-jest와 타입스크립트 사용시
    "@babel/preset-typescript"
  ]
}
```

`package.json`를 아래와 같이 수정합니다:

```js
{
  "scripts": {
    // ...
    "test": "jest"
  },
  "jest": {
    "preset": "solid-jest/preset/browser",
    // ...
  }
}
```

#### ts-jest 사용하기

ts-jest를 사용하려면, 먼저 설치가 필요합니다:

```sh
> npm i --save-dev jest ts-jest @types/jest # yarn add -D 또는 pnpm
```

`package.json` 파일에서 다음과 같이 설정합니다:

```js
{ 
  "scripts": {
    // ...
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
    // ...
    // 브라우저 모드에서 테스트:
    "testEnvironment": "jsdom",
    // 불행히도 solid는 브라우저 모드를 감지하지 못하기 때문에, 직접 사용할 버전을 지정해야합니다:
    "moduleNameMapper": {
      "solid-js/web": "<rootDir>/node_modules/solid-js/web/dist/web.cjs",
      "solid-js": "<rootDir>/node_modules/solid-js/dist/solid.cjs"
    }
    // 윈도우 사용자는 "/"를 "\"로 변경해야합니다.
  }
}
```

### 타입스크립트와 Jest

jest는 테스트 기능을 전역 스코프에 주입하기 때문에, 타입스크립트 사용시 jest 타입을 tsconfig.json 파일에 로드해야 합니다:

```js
{
  // ...
  "types": ["jest"]
}
```

이 설정을 위해서는 앞에서 설명한대로 `@types/jest`를 설치되어 있어야 합니다.

### uvu 설정하기

먼저 필요한 패키지를 설치해야 합니다:

```sh
> npm i --save-dev uvu solid-register jsdom # yarn add -D 또는 pnpm
```

`package.json` 파일에 테스트 스크립트를 설정합니다:

```sh
> npm set-script test "uvu -r solid-register"
```

추가 설정 파일은 `-r setup.ts`을 사용해 추가하며, 테스트 제외 파일들은 `-i not-a-test.test.ts`를 사용합니다.

### 커버리지 리포트

> 안타깝게도 [babel의 한계](https://github.com/babel/babel/issues/4289)로 인해 트랜스파일된 JSX 파일에 대해 소스맵을 얻을 수 없으며, 이로 인해 컴포넌트 커버리지가 0이 되는 문제가 있습니다. 하지만 JSX가 아닌 코드에 대해서는 정상 작동합니다.

테스트 코드 커버리지를 확인하려 할 떄, uvu에서 선호하는 도구는 c8 입니다. 설치 후 설정을 위해서는 다음과 같이 실행합니다:

```sh
> npm i --save-dev c8 # yarn add -D 또는 pnpm
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

이제 `npm run test:coverage`를 실행하면, 테스트 커버리지를 확인할 수 있습니다.

멋진 HTML 커버리지 리포트를 원하신다면, `c8` 대신 `c8 -r html`을 사용해 HTML 리포터를 활성화할 수 있습니다.

### 워치 모드

`uvu` 나 `tape` 는 워치 모드를 지원하지 않지만, `chokidar-cli` 를 사용해 워치 모드로 실행할 수 있습니다:

```sh
> npm i --save-dev chokidar-cli # yarn add -D 또는 pnpm
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# use .js/.jsx instead of .ts/.tsx
```

이제 `npm run test:watch`를 실행하면, 파일이 변경시마다 테스트를 실행하게 됩니다.

### solid-testing-library

컴포넌트 테스트를 위해서는 `solid-testing-library`를 설치합니다:

```sh
> npm i --save-dev solid-testing-library # yarn add -D 또는 pnpm
```

이 라이브러리를 사용하면 컴포넌트를 렌더링하고, 사용자 입장에서 이벤트를 발생하고 엘리먼트를 선택할 수 있습니다.

### @testing-library/jest-dom

jest를 사용중이라면, `solid-testing-library` 는 `@testing-library/jest-dom`와 잘 작동합니다:

```sh
> npm i --save-dev @testing-library/jest-dom # yarn add -D 또는 pnpm
```

jest 셋업 파일에서 익스텐션을 임포트합니다:

```ts
// test/jest-setup.ts
import '@testing-library/jest-dom/extend-expect';
```

`package.json` 파일에서 다음과 같이 익스텐션을 로드합니다:

```js
{
  "jest": {
    // ...
    setupFiles: ["@testing-library/jest-dom/extend-expect", "regenerator-runtime"]
  }
}
```

`tsconfig.json` 파일에도 다음과 같이 추가합니다:

```js
{
  // ...
  "types": ["jest", "@testing-library/jest-dom"]
}
```

### solid-dom-testing

uvu 혹은 tape 와 같은 테스트 Runner를 사용하는 경우, `solid-dom-testing` 와 같은 어설션을 도와주는 라이브러리가 있습니다:

```sh
> npm i --save-dev solid-dom-testing # yarn add -D 또는 pnpm
```

추가 설정은 필요없으며, 테스트 파일에서 필요한 헬퍼를 임포트해 사용하면 됩니다.

## vitest

유닛 테스트 관련해 [vitest](https://vitest.dev/)라는 도구가 새로 나왔습니다.
vitest는 jest와 동일한 기능들을 제공하면서 보다 빠른 속도를 제공해 jest를 대체하는 것을 목표로 합니다.

설치는 간단합니다:

```sh
> npm i --save-dev vitest jsdom # or yarn add -D 또는 pnpm
```

공식 starter 혹은 solid-start를 사용 중이라면, 이미 vite를 사용중이기 때문에`vite.config.mjs` 파일이 있을 것입니다. 파일을 다음과 같이 수정하세요:

```js
/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import solid from 'solid-start' // 또는 'vite-plugin-solid'

export default defineConfig({
  test: {
    // `describe, test, it`를 전역으로 사용하고 싶다면 아래의 주석을 해제하세요:
    // globals: true,
    environment: 'jsdom',
    transformMode: {
      web: [/\.[jt]sx$/],
    },
    // vitest에서의 모듈 검색 이슈를 해결하려면 solid를 인라인으로 설정해야 합니다.
    deps: {
      inline: [/solid-js/],
    },
    // 테스트가 별로 없다면, 퍼포먼스 향상을 위해 아래 주석을 하나 혹은 둘 다 해제하세요:
    // threads: false,
    // isolate: false,
  },
  plugins: [solid()],
  resolve: {
    conditions: ['development', 'browser'],
  },
})
```

마지막으로 `package.json` 파일에 test 스크립트를 추가하세요:

```sh
> npm set-script "test" "vitest"
```

## 테스트 패턴 및 베스트 프랙티스

테스트 도구를 설치했으니, 이제 사용할 차례입니다. 사용 편의를 위해 solid는 몇 가지 패턴을 지원합니다.

### 리액티브 상태 테스트

유지 보수를 쉽게 하거나 여러 개의 뷰를 지원하기 위해 컴포넌트와 상태를 분리해 유지할 수 있습니다. 이 경우 테스트하는 인터페이스는 상태 그 자체입니다.
[리액티브 루트](https://www.solidjs.com/docs/latest/api#createroot)에서 벗어나면 상태가 추적되지 않으며, 업데이트가 되더라도 이펙트와 메모가 트리거되지 않습니다.

또한, 이펙트는 비동기로 트리거되기 때문에, 최종 이펙트에서 어설션을 래핑하는 것이 도움이 됩니다.
또는, 여러 변경 사항에 걸친 일련의 이펙트를 관찰하려면, `createRoot`에서 필요한 도구를 반환하고, 비동기 테스트 함수에서 이를 실행하는 것이 도움이 될 수 있습니다. (이는 `createRoot` 자체는 비동기 함수를 받을 수 없기 때문입니다).

예를 들어, [todo 예제](https://www.solidjs.com/examples/todos)에서 `createLocalStorage` 를 테스트 하려면:

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

TODO 컴포넌트를 생성하는 대신, 이 모델을 독립적으로 테스트할 수 있습니다. 이 경우 다음과 같은 점을 명심해야 합니다. 
1. 리액티브 변경 사항은 `render` 혹은 `createRoot`에서 제공하는 추적 컨텍스트가 있는 경우에만 동작하며, 
2. 리액티브 변경 사항은 비동기이지만, 이를 캐치하려면 `createEffect`를 사용해야 합니다.
`createRoot`를 사용하면 수동 해제를 트리거할 수 있다는 장점이 있습니다.

#### Jest / vitest 테스트

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
    // 이펙트를 캐치하려면, 이펙트를 사용합니다.
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

#### uvu 테스트

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
    // 이펙트를 캐치하려면, 이펙트를 사용합니다.
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

### 테스트 디렉티브

[디렉티브](https://www.solidjs.com/docs/latest/api#use%3A___)를 사용하면 ref 를 재사용 가능한 방식으로 사용할 수 있습니다. 이는 기본적으로 `(ref: HTMLElement, data: Accessor<any>) => void` 형식의 함수입니다. [디렉티브 튜토리얼](https://www.solidjs.com/tutorial/bindings_directives?solved)에서는, 접근자 인자에 래핑된 콜백을 호출하는 `clickOutside` 디렉티브를 정의합니다.

이제 컴포넌트를 만들고, 디렉티브를 사용할 수 있지만, 디렉티브를 직접 테스트하는 대신 디렉티브를 사용하는 것을 테스트합니다. 마운트된 노드와 접근자를 제공해서 디렉티브의 외부를 테스트하는 것이 더 간단합니다.

#### Jest / vitest 테스트

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

#### uvu 테스트

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

### 컴포넌트 테스트

간단한 클릭 카운터 컴포넌트를 예로 들어 테스트해보겠습니다:

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

아직 `solid-testing-library`를 설치하지 않았다면 반드시 설치해야 합니다. 가장 중요한 헬퍼는 컴포넌트를 DOM에 렌더링하는 `render`, 실제 사용자 이벤트와 유사한 방식으로 이벤트 디스패칭을 하는 `fireEvent`, 전역 셀렉터를 제공하는 `screen` 입니다. jest를 사용하는 경우, `@testing-library/jest-dom`를 설치하고, 몇 가지 유용한 어설션을 설정하거나, 그렇지 않으면 위에서 설명한 `solid-dom-testing`을 설치해야 합니다.

#### Jest / vitest 테스트

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

#### uvu 테스트

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
