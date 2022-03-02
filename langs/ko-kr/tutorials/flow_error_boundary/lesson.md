UI에서 발생하는 자바스크립트 오류로 전체 앱이 중단되면 안됩니다. `ErrorBoundary` 컴포넌트는 자식 컴포넌트 트리에서 발생하는 자바스크립트 에러를 캐치해서, 에러를 기록하고, 충돌이 발생한 컴포넌트 트리 대신 fallbakc UI를 표시합니다. 

이 예제에서는 컴포넌트 에러로 인해 제대로 표시되지 않습니다. Let's wrap it in an Error Boundary that displays the error.
A component has crashed our example. 에러가 발생하는 컴포넌트를 `ErrorBoundary`로 래핑해 봅시다.

```jsx
<ErrorBoundary fallback={err => err}>
  <Broken />
</ErrorBoundary>
```
