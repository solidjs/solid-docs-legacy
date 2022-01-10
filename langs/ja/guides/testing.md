---
title: Solid のテスト
description: Solid アプリのテスト方法
sort: 4
---
# Solid のテスト

Solid のコードを本番環境で使用するには、テストする必要があります。すべてを手動でテストしたくはないので、自動テストが必要です。Solid コードのテストは、すべてをセットアップし、テストに役立ついくつかのパターンを知っていれば簡単に行うことができます。

## テストのセットアップ

テストをセットアップする前に、テストランナーを選択する必要があります。豊富な選択肢がありますが、ここでは両極端な 2 つの全く異なるプロジェクト、Jest と uvu に焦点を当てます。Jest は大きくて総合型、uvu は必要最低限のものだけをもたらします。もし他のテストランナーを使いたい場合でも、uvu のセットアップは他のほとんどのテストランナーでも動作するはずです。

### Jest を設定する

残念ながら、統合されているとはいえ Jest は ESM や TypeScript をそのままではサポートせず、トランスフォーマーの設定が必要です。

主な選択肢は solid-jest と ts-jest です。solid-jest は Solid コードの変換に babel を使用し、TypeScript が使われている場合はテスト時の型チェックを省略します。ts-jest は TypeScript コンパイラを使用し、テスト時の型チェックを行います。

TypeScript を使用していない場合は solid-jest を使用し、そうでない場合はテストの実行中に型チェックを行いたいかどうかを選択します。

#### solid-jest を使う

必要な依存関係をインストールします:

```sh
> npm i --save-dev jest solid-jest # もしくは yarn add -D もしくは pnpm
```

TypeScript の場合は:

```sh
> npm i --save-dev jest solid-jest @types/jest # もしくは yarn add -D もしくは pnpm
```

次に `.babelrc` を定義していなければ定義する必要があります:

```js
{
  "presets": [
    "@babel/preset-env",
    "babel-preset-solid",
    // solid-jest で TS を使用する場合のみ
    "@babel/preset-typescript"
  ]
}
```

そして `package.json` を以下のように修正します:

```js
{
  "scripts": {
    // ここに他のスクリプト
    "test": "jest"
  },
  "jest": {
    "preset": "solid-jest/preset/browser",
    // setupFiles や他のコンフィグを挿入します
  }
}
```

#### ts-jest を使う

ts-jest を使うには、まずインストールする必要があります:

```sh
> npm i --save-dev jest ts-jest @types/jest # もしくは yarn add -D もしくは pnpm
```

そして `package.json` で設定します:

```js
{ 
  "scripts": {
    // ここに他のスクリプト
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
    // ブラウザモードでテストするために
    // setupFiles と他の設定を挿入します:
    "testEnvironment": "jsdom",
    // 残念ながら、solid はここでブラウザモードを検出できないので、
    // 正しいバージョンを手動で指定する必要があります:
    "moduleNameMapper": {
      "solid-js/web": "<rootDir>/node_modules/solid-js/web/dist/web.cjs",
      "solid-js": "<rootDir>/node_modules/solid-js/dist/solid.cjs"
    }
    // Windows ユーザーは "/" を "\" に置き換えてください
  }
}
```

### TypeScript と Jest

Jest はテスト機能をグローバルスコープに注入するので、TypeScript コンパイラを満たすために、型を tsconfig.json にロードする必要があります:

```js
{
  // tsconfig.json の一部
  "types": ["jest"]
}
```

これには前述のように `@types/jest` をインストールする必要があります。

### uvu を設定する

まず、必要なパッケージをインストールする必要があります:

```sh
> npm i --save-dev uvu solid-register jsdom # もしくは yarn add -D もしくは pnpm
```

次に `package.json` でテストスクリプトを設定します:

```sh
> npm set-script test "uvu -r solid-register"
```

追加の設定ファイルは `-r setup.ts` で追加でき、テストでないものは `-i not-a-test.test.ts` で無視できます。

### カバレッジレポート

テストのコードカバレッジを確認したい場合、uvu のお気に入りのツールは c8 です。インストールと設定のために、以下を実行します:

```sh
> npm i --save-dev c8 # もしくは yarn add -D もしくは pnpm
> npm set-script "test:coverage" "c8 uvu -r solid-register"
```

これで `npm run test:coverage` を実行すると、テストのカバレッジが表示されるようになります。

HTML 形式のカバレッジレポートが欲しい場合は、（訳注: 原文がここで終わっている）

### Watch モード

`uvu` と `tape` はどちらもすぐに使用できるウォッチモードはありませんが、 `chokidar-cli` を使用して同じことを行うことができます:

```sh
> npm i --save-dev chokidar-cli # もしくは yarn add -D もしくは pnpm
> npm set-script "test:watch" "chokidar src/**/*.ts src/**/*.tsx -c \"uvu -r solid-register\"
# use .js/.jsx instead of .ts/.tsx
```

これで `npm run test:watch` を実行すると、ファイルを変更するたびにテストが実行されるようになります。

### solid-testing-library

もしコンポーネントをテストしたいのであれば、`solid-testing-library` を必ずインストールしてください:

```sh
> npm i --save-dev solid-testing-library # もしくは yarn add -D もしくは pnpm
```

これにより、コンポーネントをレンダリングし、イベントを発生させ、ユーザーの視点から要素を選択できます。

### @testing-library/jest-dom

Jest を使用している場合、`solid-testing-library` は `@testing-library/jest-dom` と非常にうまく動作します:

```sh
> npm i --save-dev @testing-library/jest-dom # もしくは yarn add -D もしくは pnpm
```

そして、セットアップファイルで期待する拡張子をインポートします:

```ts
// test/jest-setup.ts
import '@testing-library/jest-dom/extend-expect';
```

そして、package.json の以下の項目を使用して、Jest でロードします:

```js
{
  "jest": {
    // ここに他の設定
    setupFiles: ["@testing-library/jest-dom/extend-expect", "regenerator-runtime"]
  }
}
```

また、`tsconfig.json` に型を含めることも忘れないでください:

```js
{
  // tsconfig.json の一部
  "types": ["jest", "@testing-library/jest-dom"]
}
```

### solid-dom-testing

uvu や tape などの他のテストランナーを使用している場合、 `solid-dom-testing` には同様のアサーションをサポートするヘルパーがいくつかあります:

```sh
> npm i --save-dev solid-dom-testing # もしくは yarn add -D もしくは pnpm
```

設定は不要で、必要に応じてテストでヘルパーをインポートして使用できます。

## テストのパターンとベストプラクティス

さて、テストツールのインストールが完了したら、次はそれらを使ってみましょう。これを簡単にするため、Solid はいくつかのすばらしいパターンをサポートしています。

### リアクティブな状態のテスト

メンテナンスを容易にするため、あるいは複数のビューをサポートできるようにするため、状態の一部をコンポーネントから分離しておきたい場合があります。この場合、テストの対象となるインターフェイスは状態そのものです。[リアクティブルート](https://www.solidjs.com/docs/latest/api#createroot)の外では、状態は追跡されず、更新しても Effect や Memo がトリガーされないことに注意してください。

また、Effect は非同期でトリガーされるので、最終的な Effect にアサーションをラップするのに役立ちます。また、複数の変更に対する一連の Effect を観察するには、`createRoot` から必要なツールを返して、非同期のテスト関数で実行すると便利です（`createRoot` 自体は `async` 関数を受け取ることができないので）。

例として、[ToDo のサンプル](https://www.solidjs.com/examples/todos)にある `createLocalStorage` をテストしてみましょう:

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

TODO コンポーネントを作成する代わりに、このモデルを単独でテストできます。その際、1. リアクティブな変更は `render` または `createRoot` によって提供される追跡コンテキストがある場合のみ動作すること、2. 非同期であるが `createEffect` によってそれをキャッチできること、を念頭に置く必要があります。`createRoot` を使用すると、手動で廃棄のトリガーをできるという利点があります:

#### Jest でのテスト

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

  test("既存の状態を localStorage から読み取る", () => createRoot(dispose => {
    const savedState = { todos: [], newTitle: "saved" };
    localStorage.setItem("todos", JSON.stringify(savedState));
    const [state] = createLocalStore(initialState);
    expect(state).toEqual(savedState);
    dispose();
  }));

  test("新しい状態を localStorage に格納する", () => createRoot(dispose => {
    const [state, setState] = createLocalStore(initialState);
    setState("newTitle", "updated");
    // Effect をキャッチするため、Effect を使う
    return new Promise<void>((resolve) => createEffect(() => {
      expect(JSON.parse(localStorage.todos || ""))
        .toEqual({ todos: [], newTitle: "updated" });
      dispose();
      resolve();
    }));
  }));

  test("状態を複数回更新する", async () => {
    const {dispose, setState} = createRoot(dispose => {
      const [state, setState] = createLocalStore(initialState);
      return {dispose, setState};
    });
    setState("newTitle", "first");
    // すべての Effect を解決するため 1 ティック待つ
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

#### uvu でのテスト

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

todoTest("既存の状態を localStorage から読み取る", () => 
  createRoot(dispose => {
    const savedState = { todos: [], newTitle: "saved" };
    localStorage.setItem("todos", JSON.stringify(savedState));
    const [state] = createLocalStore(initialState);
    assert.equal(state, savedState);
    dispose();
  }));

todoTest("新しい状態を localStorage に格納する", () =>
  createRoot(dispose => {
    const [_, setState] = createLocalStore(initialState);
    setState("newTitle", "updated");
    // Effect をキャッチするため、Effect が必要
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

### ディレクティブのテスト

[ディレクティブ](https://www.solidjs.com/docs/latest/api#use%3A___)は再利用可能な方法で参照を使用できるようにします。これらは基本的に `(ref: HTMLElement, data: Accessor<any>) => void` というパターンに従った関数です。[ディレクティブのチュートリアル](https://www.solidjs.com/tutorial/bindings_directives?solved)では、アクセサーの引数にラップされたコールバックを呼び出す `clickOutside` ディレクティブを定義しています。

コンポーネントを作成し、そこでディレクティブを使用することもできますが、その場合はディレクティブを直接テストするのではなく、ディレクティブの使用をテストすることになります。マウントされたノードとアクセサーを提供することで、ディレクティブの外面をテストする方がより簡単です:

#### Jest でのテスト

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

  test("外側のクリックでトリガーされる", () => createRoot((dispose) =>
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

  test("内側のクリックではトリガーされない", () => createRoot((dispose) =>
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

#### uvu でのテスト

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

clickTest('外側のクリックでトリガーされる', () => createRoot((dispose) =>
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

clickTest('内側のクリックではトリガーされない', () => createRoot((dispose) =>
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

### コンポーネントのテスト

テストするための、とてもシンプルなクリックカウンターコンポーネントを見てみましょう:

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

まだインストールしていない場合は、必ず `solid-testing-library` をインストールする必要があります。最も重要なヘルパーは、何とかして DOM にコンポーネントをレンダリングする `render` と、実際のユーザーイベントに似た方法でイベントをディスパッチする `fireEvent` と、グローバルセレクターを提供する `screen` です。Jest を使用している場合は、 `@testing-library/jest-dom` もインストールし、有用なアサーションを持つようにセットアップする必要があります。それ以外の場合は、上述の通り `solid-dom-testing` をインストールします。

#### Jest でのテスト

```ts
// main.test.tsx
import { Counter } from "./main";
import { cleanup, fireEvent, render, screen } from "solid-testing-library";

describe("Counter", () => {
  afterEach(cleanup);

  test("ゼロから始まる", () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Count: 0");
  });

  test("クリックで値が 1 増える", async () => {
    render(() => <Counter />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    // イベントループが終了するのにひとつのプロミスを解決する必要があります
    await Promise.resolve();
    expect(button).toHaveTextContent("Count: 1");
    fireEvent.click(button);
    await Promise.resolve();
    expect(button).toHaveTextContent("Count: 2");
  });
});
```

#### uvu でのテスト

```ts
// main.test.tsx
import { suite } from "uvu";
import * as assert from "uvu/assert";
import { Counter } from "main";
import { fireEvent, render, screen } from "solid-testing-library";
import { isInDocument, hasTextContent } from "solid-dom-testing";


const testCounter = suite("Counter");

testCounter.after.each(cleanup);

testCounter("ゼロから始まる", () => {
  const { getByRole } = render(() => <Counter />);
  const button = getByRole("button");
  assert.ok(isInDocument(button), "button not in dom");
  assert.ok(hasTextContent(button, "Count: 0"), "wrong text content");
});

testCounter("クリックで値が 1 増える", async () => {
  render(() => <Counter />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  // イベントループが終了するのにひとつのプロミスを解決する必要があります
  await Promise.resolve();
  assert.ok(hasTextContent(button, "Count: 1"), "not count 1 after first click");
  fireEvent.click(button);
  await Promise.resolve();
  assert.ok(hasTextContent(button, "Count: 2"), "not count 2 after first click");
});

testCounter.run();
```
