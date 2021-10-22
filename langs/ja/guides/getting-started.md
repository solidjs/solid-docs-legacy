---
title: はじめに
description: Solid を使い始めるためのガイド
sort: 0
---

# はじめに

## Solid を試す

Solid を使い始める最も簡単な方法は、オンラインで試すことです。https://playground.solidjs.com の REPL は、アイデアを試すのに最適な方法です。また、いくつかのサンプルを編集できる https://codesandbox.io/ もあります。

また、ターミナルで以下のコマンドを実行して、シンプルな [Vite](https://vitejs.dev/) テンプレートを使用することもできます:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

または TypeScript 向けに:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

## Solid を学ぶ

Solid はアプリケーションの構成要素として機能する、合成可能な小さなピースがすべてです。これらの部品は主に、多くの浅いトップレベル API を構成する関数です。幸いなことに、これらのほとんどについて知らなくても始めることができます。

自由に使える構成要素には、主にコンポーネントとリアクティブプリミティブの 2 種類があります。

コンポーネントは、props オブジェクトを受け取り、ネイティブの DOM 要素や他のコンポーネントを含む JSX 要素を返す関数です。これらはパスカルケースの JSX 要素として表現できます:

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

コンポーネントは、それ自体がステートフルではなく、インスタンスを持たないという点で軽量です。代わりに、DOM 要素やリアクティブプリミティブのファクトリ関数として機能します。

Solid のきめ細かいリアクティビティは、Signal、Memo、Effect の 3 つのシンプルなプリミティブで構築されています。これらが一緒になって、ビューを最新の状態に保つための自動追跡同期エンジンを形成します。リアクティブな計算は、同期的に実行されるシンプルな関数でラップされた式の形をしています。

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

[Solid のリアクティビティ](#リアクティビティ)と [Solid のレンダリング](#レンダリング)の詳細をご覧いただけます。

## Solid に考える

Solid の設計には、Web サイトやアプリケーションを構築する上で、どのような原則や価値観が最適なのかといういくつもの意見が込められています。Solid の背後にある哲学を知っていれば、Solid を習得し、使うことが容易になるでしょう。

### 1. 宣言型データ

宣言型データとは、データの動作の記述を宣言に結びつけることです。データの動作のすべての側面を 1 つの場所にパッケージ化することで、簡単に構成できます。

### 2. 消えるコンポーネント

更新を考慮せずにコンポーネントを構造化することは難しいです。Solid の更新はコンポーネントから完全に独立しています。コンポーネント関数は一度呼び出されると消滅してしまいます。コンポーネントはコードを整理するために存在し、他の用途はあまりありません。

### 3. リード/ライトの分離

正確な制御と予測可能性がより良いシステムを作ります。一方通行のフローを強制するための真の不変性は必要ありませんが、どの使用者が書き込んでいいか/いけないかを意識的に決定する能力があればよいのです。

### 4. シンプルはイージーに勝る

きめ細やかなリアクティビティのために苦労して得た教訓です。明示的で一貫性のある規約は、より多くの努力が必要な場合でも、それだけの価値があります。目的は、基盤となる最小限のツールを提供することです。

## Web コンポーネント

Solid は、Web コンポーネントを第一級市民として持ちたいという願望を持って生まれました。時とともに、その設計は進化し、目標も変わりました。しかし、Solid は依然として Web コンポーネントを作成するための優れた方法です。[Solid Element](https://github.com/solidjs/solid/tree/main/packages/solid-element) を使うと Solid の関数コンポーネントを記述、ラップして、小さくてパフォーマンスの高い Web コンポーネントを作成できます。Solid アプリの内部では、Solid Element は Solid の Context API を活用でき、Solid の Portal は Shadow DOM の隔離されたスタイルをサポートします。

## サーバーレンダリング

Solid は、真のアイソモーフィックな開発を可能にする動的なサーバーサイドレンダリングソリューションを備えています。Solid の Resource プリミティブを使用することで非同期データのリクエストが簡単にでき、さらに重要なことに、クライアントとブラウザの間で自動的にシリアライズおよび同期されます。

Solid はサーバー上での非同期レンダリングとストリームレンダリングをサポートしているため、コードを一方的に記述し、それをサーバー上で実行できます。つまり、[render-as-you-fetch](https://reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) やコード分割などの機能が Solid でも機能するということです。

詳細については、[サーバーガイド](#サーバーサイドレンダリング)をご覧ください。

## コンパイルなし？

JSX が嫌い？ 式をラップするのを手動で作業したり、パフォーマンスが低下したり、バンドルサイズが大きくなっても構わないですか？ 代わりにタグ付きテンプレートリテラルや HyperScript を使って、コンパイルされない環境で Solid アプリを作成することもできます。

[Skypack](https://www.skypack.dev/) を使って、ブラウザから直接実行することもできます:

```html
<html>
  <body>
    <script type="module">
      import {
        createSignal,
        onCleanup,
      } from "https://cdn.skypack.dev/solid-js";
      import { render } from "https://cdn.skypack.dev/solid-js/web";
      import html from "https://cdn.skypack.dev/solid-js/html";

      const App = () => {
        const [count, setCount] = createSignal(0),
          timer = setInterval(() => setCount(count() + 1), 1000);
        onCleanup(() => clearInterval(timer));
        return html`<div>${count}</div>`;
      };
      render(App, document.body);
    </script>
  </body>
</html>
```

これらを TypeScript で動作させるには、対応する DOM Expressions ライブラリが必要であることを覚えておいてください。タグ付きテンプレートリテラルは [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions) で使用でき、HyperScript は [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions) で使用できます。
