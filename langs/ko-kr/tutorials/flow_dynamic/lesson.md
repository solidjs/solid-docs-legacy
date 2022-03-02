`<Dynamic>` 태그는 데이터를 렌더링할 때 유용합니다. 네이티브 엘리먼트 문자열이나 컴포넌트 함수를 전달할 수 있으며, 제공된 나머지 props를 사용해 렌더링됩니다.

이렇게 하면 여러 개의 `<Show>` 또는 `<Switch>` 컴포넌트를 작성하는 것보다 종종 더 간결합니다.

이 예제에서 다음과 같은 `<Switch>` 문을:

```jsx
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

아래와 같이 바꿀 수 있습니다:

```jsx
<Dynamic component={options[selected()]} />
```
