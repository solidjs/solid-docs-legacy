때로는 2개 이상의 상호 배타적 결과가 있는 조건문을 처리해야 합니다. 이런 경우를 위해 자바스크립트의 `switch`/`case`를 본떠 만든 `<Switch>`, `<Match>` 컴포넌트가 있습니다.

각 조건을 비교해서 조건식이 true인 첫 번째 항목을 렌더링하며, 모두 매칭되지 않을 경우 fallback을 렌더링합니다.

이 예제에서 중첩된 `<Show>` 컴포넌트를 다음과 같이 바꿀 수 있습니다:

```jsx
<Switch fallback={<p>{x()} is between 5 and 10</p>}>
  <Match when={x() > 10}>
    <p>{x()} is greater than 10</p>
  </Match>
  <Match when={5 > x()}>
    <p>{x()} is less than 5</p>
  </Match>
</Switch>
```
