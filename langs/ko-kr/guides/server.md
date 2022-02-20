---
title: 서버 사이드 렌더링
description: Solid의 서버 사이드 렌더링 기능에 대한 설명.
sort: 3
---

# 서버 사이드 렌더링

Solid는 JSX 템플릿을 매우 효율적인 문자열 추가 코드로 컴파일해서 서버 렌더링을 처리합니다. 이는 Babel 플러그인을 사용하거나 `generate: "ssr"`을 프리셋에 전달해서 구현할 수 있습니다. 하이드레이션 호환 코드를 생성하려면 클라이언트와 서버 모두 `hydratable: true`를 전달해야 합니다.

`solid-js`와 `solid-js/web` 런타임은 node 환경에서 실행할 때 리액티브하지 않은 런타임으로 교체됩니다. 다른 환경에서는 `node`로 설정된 조건부 익스포트와 함께 서버 코드를 번들로 제공해야 합니다. 대부분의 번들러에는 이를 수행하기 위한 방법이 있습니다. 일반적으로 익스포트 조건으로 `solid`를 사용하는 것이 좋으며, 라이브러리의 경우 `solid` 익스포트에서 소스도 포함하는 것이 좋습니다.

SSR용으로 빌드하려면 2개의 개별 번들을 생성해야하기 때문에 추가 설정이 필요합니다. 클라이언트 엔트리는 `hydrate`를 사용해야 합니다:

```jsx
import { hydrate } from "solid-js/web";

hydrate(() => <App />, document);
```

_참고: 문서 루트에서 렌더링 및 하이드레이션이 가능하며, 이를 통해 전체 뷰를 JSX로 기술할 수 있습니다._

서버 엔트리는 Solid에서 제공하는 4가지 렌더링 옵션 중 하나를 사용할 수 있습니다. 각각은 문서의 head에 삽입할 출력과 스크립트 태그를 생성합니다.

```jsx
import {
  renderToString,
  renderToStringAsync,
  renderToStream
} from "solid-js/web";

// 문자열로 동기식 렌더링
const html = renderToString(() => <App />);

// 문자열로 비동기식 렌더링
const html = await renderToStringAsync(() => <App />);

// 스트림으로 렌더링
const stream = renderToStream(() => <App />);

// Node
stream.pipe(res);

// 웹 스트림 API (Cloudflare Workers 등을 위한 용도)
const { readable, writable } = new TransformStream();
stream.pipeTo(writable);
```

편의를 위해 `solid-js/web`은 `isServer` 플래그를 익스포트합니다. 이는 대부분의 번들러가 이 플래그를 사용하는 코드들을 트리 쉐이킹하거나, 이 플래그를 가진 코드에서만 사용되는 클라이언트 번들을 임포트할 수 있기 때문에 편리합니다.

```jsx
import { isServer } from "solid-js/web";

if (isServer) {
  // 서버에서만 실행
} else {
  // 브라우저에서만 실행
}
```

## 하이드레이션 스크립트

Solid 런타임이 로드되기 전에 점진적으로 하이드레이션을 하기 위해서는, 페이지에 특별한 스크립트를 삽입해야 합니다. 이 스크립트는 `generateHydrationScript`를 통해 생성하고 삽입하거나 `<HydrationScript />` 태그를 사용해 JSX의 일부로 포함할 수 있습니다.

```js
import { generateHydrationScript } from "solid-js/web";

const app = renderToString(() => <App />);

const html = `
  <html lang="en">
    <head>
      <title>🔥 Solid SSR 🔥</title>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/styles.css" />
      ${generateHydrationScript()}
    </head>
    <body>${app}</body>
  </html>
`;
```

```jsx
import { HydrationScript } from "solid-js/web";

const App = () => {
  return (
    <html lang="en">
      <head>
        <title>🔥 Solid SSR 🔥</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/styles.css" />
        <HydrationScript />
      </head>
      <body>{/*... rest of App*/}</body>
    </html>
  );
};
```

문서에서 하이드레이션을 실행할 때, `<head>` 태그 밖에서 클라이언트에 없는 애셋을 삽입하게 되는 경우 문제가 발생할 수 있습니다. Solid는 `<NoHydration>` 컴포넌트를 제공하는데, 이 자식 컴포넌트들은 서버에서는 평상시와 작동하지만, 브라우저에서는 하이브레이션되지 않습니다.

```jsx
<NoHydration>
  <ImNotHydrated />
</NoHydration>
```

## 비동기 및 스트리밍 SSR

이러한 메커니즘은 애플리케이션이 작동하는 방식에 대한 Solid의 지식을 기반으로 구축되었습니다.
미리 가져와서 렌더링을 하는 대신, 서버에서 Suspense 와 Resource API를 사용해 구현합니다.
Solid는 클라이언트에서와 동일하게 서버에서도 렌더링하는 동안 로딩을 합니다.
서버와 클라이언트 모두 동일하게 코드를 작성합니다.

비동기 렌더링은 모든 Suspense 경계가 해결될 때까지 기다린 다음, 결과를 보냅니다.
(정적 사이트 생성<sub>SSG</sub>의 경우 파일에 기록합니다)

스트리밍은 동기식 콘텐츠를 브라우저로 즉시 전송하기 시작합니다. 처음에는 서버에서 Suspense fallback을 렌더링해서 클라이언트로 전송합니다.
그런 다음, 서버에서 비동기 데이터 로딩이 완료되면 데이터와 HTML을 동일한 스트림을 통해 클라이언트로 전송합니다.
브라우저가 작업을 완료하면, Suspense를 해결하고 fallback을 실제 콘텐츠로 대체합니다.

이 방식의 장점은:

- 서버는 비동기 데이터가 응답할 때까지 기다릴 필요가 없습니다. 애셋은 브라우저에 더 빨리 로딩되며, 사용자는 더 빨리 콘텐츠를 볼 수 있습니다.
- JAMStack과 같은 클라이언트 Fetching에 비해, 데이터 로드는 서버에서 바로 시작되고 클라이언트 자바스크립트가 로드될 때까지 기다릴 필요가 없습니다.
- 모든 데이터는 직렬화되어 서버에서 클라이언트로 자동 전송됩니다.

## SSR의 주의점

Solid의 동형 SSR 솔루션은 두 환경에서 유사하게 실행되는 단일 코드 베이스를 기반으로 코드를 작성할 수 있다는 점에서 매우 강력합니다. 그러나 이 때문에 하이드레이션에서 요구되는 점이 있습니다. 대부분의 경우 클라이언트에서 렌더링되는 뷰는 서버에서 렌더링되는 뷰와 동일합니다. 텍스트까지 모두 정확할 필요는 없지만 마크업은 구조적으로 동일해야 합니다.

서버에서 렌더링된 마커를 사용해 서버의 엘리먼트와 리소스의 위치를 일치시킵니다. 이러한 이유로 클라이언트와 서버는 동일한 컴포넌트를 사용해야 합니다. 이 점은 Solid가 클라이언트와 서버에서 동일한 방식으로 렌더링한다는 점을 고려할때 일반적으로 문제가 되지 않습니다. 하지만 현재 클라이언트에서 하이드레이션되지 않은 것을 서버에서 렌더링하는 방법은 없습니다. 현재까지는 전체 페이지를 부분적으로 하이드레이션시켜 하이드레이션 마커를 생성하지 않는 방법은 없습니다. 전부 하이드레이션을 하거나 아예 하지 않거나 둘 중 하나만 해야합니다. 부분적인 하이드레이션은 앞으로 고려할 예정입니다.

마지막으로 모든 리소스는 `render` 트리 아래에 정의해야 합니다. 리소스는 자동으로 직렬화되어 브라우저에서 이를 받아들이게 되지만, 이는 `render` 메소드가 렌더링 진행 상황을 추적하기 때문에 작동합니다. 이들이 격리된 콘텍스트에 있다면 이렇게 할 수 없습니다. 마찬가지로 서버에는 반응성이 없기 때문에, 초기 렌더링시 Signal을 업데이트하여 상위 트리에 반영될 것으로 예상해서는 안됩니다. Suspense 경계가 있지만 기본적으로 Solid의 SSR은 하향식입니다.

## SSR 시작하기

SSR 구성은 까다롭습니다. [solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr) 패키지에 몇 가지 예제가 있습니다.

이러한 작업을 더 원할하게 하기 위한 [SolidStart](https://github.com/solidjs/solid-start)가 현재 개발중에 있습니다.

## 정적 사이트 생성하기

[solid-ssr](https://github.com/solidjs/solid/blob/main/packages/solid-ssr)에는 정적 사이트와 사전 렌더링된 사이트를 생성하기 위한 간단한 유틸리티가 포함되어 있습니다. 자세한 내용은 README를 참조하세요.
