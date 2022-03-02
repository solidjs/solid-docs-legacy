대부분의 번들러(Webpack, Rollup, Parcel, Vite)는 동적 임포트를 사용하는 경우 자동으로 코드 분할을 처리합니다.
Solid의 `lazy` 메서드를 사용하면 지연된 로딩을 위해 컴포넌트의 동적 임포트를 래핑할 수 있습니다.
반환값은 JSX 템플릿에서 사용할 수 있는 컴포넌트입니다. 다만 처음 렌더링될 때 내부적으로는 임포트한 코드를 동적으로 로드하여, 코드를 사용할 수 있을 때까지 해당 렌더링 분기를 중지합니다.

₩lazy`를 사용하려면, 다음과 같은 임포트 문을:
```js
import Greeting from "./greeting";
```

아래와 같이 변경합니다:
```js
const Greeting = lazy(() => import("./greeting"));
```

변경하더라도 너무 빨리 로드되기 때문에 눈으로 확인하기는 힘들기 때문에, 좀 더 잘 보이도록 다음과 같이 딜레이를 추가합니다:

```js
const Greeting = lazy(async () => {
  // simulate delay
  await new Promise(r => setTimeout(r, 1000))
  return import("./greeting")
});
```
