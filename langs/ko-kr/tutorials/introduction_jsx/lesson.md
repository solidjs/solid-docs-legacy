JSX는 예제에서 보는 바와 같이 HTML과 구문이 유사하며, Solid에서 컴포넌트를 빌드하는데 핵심입니다.
JSX는 `{ }` 구문을 사용하여 HTML 내에 변수와 함수를 참조할 수 있는 동적 표현식을 추가합니다.
이 예제에서는 `div` 안에 `{name}`을 사용하여 HTML 내에 `name` 문자열을 포함합니다. 같은 방식으로 `svg` 변수에 할당된 HTML 엘리먼트를 포함합니다.

JSX를 사용하는 다른 프레임워크와는 달리, Solid는 가능한 한 HTML 표준에 가깝게 유지하려고 노력합니다. 이 덕분에 스택오버플로우나 디자이너의 템플릿 빌더에 있는 코드를 복사/붙여넣기하는 방식이 가능합니다.

JSX와 HTML 사이에는 JSX가 HTML의 상위집합이 되지 못하는 3가지 주요 차이점이 있습니다:
1. JSX는 void 엘리먼트가 없습니다. 즉, 모든 엘리먼트는 닫는 태그 또는 자체 닫기가 있어야 합니다. `<input>` 또는 `<br>` 엘리먼트를 복사할 때 이 점을 염두에 둬야 합니다.
2. JSX는 단일 엘리먼트를 반환해야 합니다. 여러 최상위 엘리먼트를 반환하고자 한다면, 다음과 같이 Fragment 엘리먼트를 사용해야 합니다:

   ```jsx
   <>
     <h1>Title</h1>
     <p>Some Text</p>
   </>
   ```
3. JSX는 HTML 주석(`<!--...-->`) 이나 `<!DOCTYPE>` 같은 특별한 태그를 지원하지 않습니다.

하지만 JSX에서 SVG는 지원합니다. 아래와 같은 SVG를 컴포넌트에 추가해봅시다:
```jsx
<svg height="300" width="400">
  <defs>
    <linearGradient id="gr1" x1="0%" y1="60%" x2="100%" y2="0%">
      <stop offset="5%" style="stop-color:rgb(255,255,3);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1" />
    </linearGradient>
  </defs>
  <ellipse cx="125" cy="150" rx="100" ry="60" fill="url(#gr1)" />
  Sorry but this browser does not support inline SVG.
</svg>
```
