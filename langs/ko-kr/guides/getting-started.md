---
title: 시작하기
description: Solid 시작 가이드
sort: 0
---
# 시작하기
## Solid 사용하기

Solid를 사용하기 위한 가장 쉬운 방법은 온라인으로 시도해 보는 것입니다. https://playground.solidjs.com 의 REPL은 이를 위한 완벽한 방법을 제공합니다. 또한 [예제](https://github.com/solidjs/solid/blob/main/documentation/resources/examples.md)를 편집해 볼 수 있는 https://codesandbox.io/ 도 있습니다.

또한, 터미널에서 다음 명령을 실행해서 [Vite 템플릿](https://github.com/solidjs/templates)을 사용할 수 있습니다:

```sh
> npx degit solidjs/templates/js my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

타입스크립트를 사용하려면 다음과 같이 실행합니다:

```sh
> npx degit solidjs/templates/ts my-app
> cd my-app
> npm i # or yarn or pnpm
> npm run dev # or yarn or pnpm
```

## Solid 배우기

Solid는 애플리케이션 빌딩 블록 역할을 하는 조합 가능한 작은 조각들입니다. 이 조각들은 대부분 얕은 최상위 API를 구성하는 함수들입니다. 다행히도 이들 대부분에 대해서 몰라도 시작할 수 있습니다.

자유롭게 사용할 수 있는 두가지 주요 빌딩 블록은 컴포넌트와 리액티브 프리미티브가 있습니다.

컴포넌트는 props 객체를 입력으로 받으며, 네이티브 DOM 엘리먼트와 다른 컴포넌트를 포함하는 JSX 엘리먼트를 반환하는 함수입니다. 이는 파스칼 케이스의 JSX 엘리먼트로 표현할 수 있습니다:

```jsx
function MyComponent(props) {
  return <div>Hello {props.name}</div>;
}

<MyComponent name="Solid" />;
```

컴포넌트는 자체적으로 상태를 저장하지 않고 인스턴스가 없다는 점에서 가볍습니다. 대신, DOM 엘리먼트와 리액티브 프리미티브를 위한 팩토리 함수 역할을 합니다.

Solid의 세밀한 반응성<sub>Reactivity</sub>은 Signal, Memo, Effect의 3개의 간단한 프리미티브들을 기반으로 합니다. 이들은 뷰를 최신 상태로 유지하는 자동 추적 동기화 엔진을 형성합니다. 리액티브 계산은 동기식으로 실행되는, 간단한 함수로 래핑된 표현식의 형태를 취합니다.

```js
const [first, setFirst] = createSignal("JSON");
const [last, setLast] = createSignal("Bourne");

createEffect(() => console.log(`${first()} ${last()}`));
```

[Solid의 반응성](/guides/reactivity)과 [Solid의 렌더링](/guides/rendering)에 대해서 자세히 알아보세요.

## Solid의 철학

Solid의 디자인에는 최고의 웹사이트와 애플리케이션을 구축하는데 필요한 원칙과 가치관에 대한 몇가지 의견이 담겨 있습니다. Solid에 대한 철학을 알고 있다면 Solid를 배우고 사용하는것이 더 쉬워집니다.

### 1. 선언적 데이터

선언적 데이터는 데이터의 동작에 대한 설명을 선언에 묶는 방식입니다. 이를 통해 데이터 동작의 모든 측면을 한 곳에서 패키징하여 쉽게 조합할 수 있습니다.

### 2. 사라지는 컴포넌트

업데이트를 고려하지 않고 컴포넌트를 구조화하는 것은 어렵습니다. Solid 업데이트는 컴포넌트와 완전히 독립되어 있습니다. 컴포넌트 함수는 한 번 호출된 후 사라집니다. 컴포넌트는 코드를 구성하기 위해 존재하며 다른 용도는 별로 없습니다.

### 3. 읽기/쓰기 분리

정확한 제어와 예측 가능성은 더 나은 시스템을 만듭니다. 단벙향 플로우를 강제하기 위한 불변성은 필요하지 않으며, 소비자가 변경할 수 있는 것과 아닌 것을 의식적으로 결정하는 능력만 필요합니다.

### 4. 쉬운것보다 단순한 것이 낫다.

세밀한 반응성을 위해서 고생하며 얻은 교훈입니다. 더 많은 노력이 필요하더라도, 명시적이고 일관된 규칙은 그만한 가치가 있습니다. 목표는 기본이 되는 최소한의 도구를 제공하는 것입니다.

## 웹 컴포넌트

Solid는 웹 컴포넌트를 1급 시민으로 만들고자 하는 바램으로 탄생했습니다. 시간이 흐르면서 디자인이 발전하고 목표가 변경되었지만, Solid는 여전히 웹 컴포넌트를 작성하는 좋은 방법입니다. [Solid 엘리먼트](https://github.com/solidjs/solid/tree/main/packages/solid-element)를 사용하면 Solid의 함수형 컴포넌트를 작성하고 래핑해서 작고 성능 좋은 웹 컴포넌트를 만들 수 있습니다. Solid 앱 내에서 Solid 엘리먼트는 Solid의 컨텍스트 API를 활용할 수 있으며, Solid Portal은 Shadow DOM의 격리된 스타일을 지원합니다.

## 서버 렌더링

Solid는 진정한 동형<sub>Isomorphic</sub> 개발 경험을 가능하게 하는 동적 서버 사이드 렌더링 솔루션을 제공합니다. Resource 프리미티브를 사용하면 비동기 데이터 요청을 쉽게 생성할 수 있으며, 클라이언트와 브라우저 간에 자동으로 직렬화 및 동기화됩니다.

Solid는 서버에서 비동기 렌더링과 스트림 렌더링을 지원하기 때문에, 한쪽 방향으로 코드를 작성해서 서버에서 실행할 수 있습니다. 즉, [render-as-you-fetch](https://ko.reactjs.org/docs/concurrent-mode-suspense.html#approach-3-render-as-you-fetch-using-suspense) 및 코드 분할과 같은 기능이 Solid에서도 작동합니다.

자세한 내용은 [서버 가이드](/guides/server#server-side-rendering)를 읽어보시기 바랍니다.

## 컴파일 미사용?

JSX를 싫어하시나요? 수동으로 표현식을 래핑하고, 형편없는 성능을 경험하고, 번들 크기가 커지는 것이 싫으신가요? Tagged 템플릿 리터럴이나 하이퍼스크립트를 사용해 컴파일되지 않은 환경에서 Solid 앱을 작성할 수 있습니다.

[Skypack](https://www.skypack.dev/)을 사용해 브라우저에서 직접 실행 가능합니다:

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

타입스크립트와 함께 작동하려면, 관련 DOM Expression 라이브러리가 필요합니다. Tagged 템플릿 리터럴을 사용하려면 [Lit DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/lit-dom-expressions)가 필요하며, 하이퍼스크립트는 [Hyper DOM Expressions](https://github.com/ryansolid/dom-expressions/tree/main/packages/hyper-dom-expressions)가 필요합니다.

