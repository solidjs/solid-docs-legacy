`<For>` 컴포넌트를 사용해 객체 배열에 대해 반복을 편하게 할 수 있습니다. 배열이 변경되면, DOM에 있는 항목들을 다시 생성하는 대신 업데이트하거나 이동합니다. 예를 들어 보겠습니다.

```jsx
<For each={cats()}>{(cat, i) =>
  <li>
    <a target="_blank" href={`https://www.youtube.com/watch?v=${cat.id}`}>
      {i() + 1}: {cat.name}
    </a>
  </li>
}</For>
```

`<For>` 컴포넌트에는 `each`라는 prop이 하나 있는데, 반복할 배열을 전달합니다.

그런 다음, `<For>`와 `</For>` 사이에 직접 노드를 작성하는 대신, _콜백_ 을 전달합니다. 이는 자바스크립트의 [`map` 콜백](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map#parameters)과 유사한 함수입니다. 배열의 각 요소에 대해, 요소를 첫 번째 인수로, 인덱스를 두 번째 인수로 사용해 콜백 함수가 호출됩니다. (이 예에서는 `cat`과 `i` 입니다.) 이 값들은 렌더링할 노드를 반환할 때 사용할 수 있습니다.

인덱스는 상수가 아닌 _Signal_ 이라는 점에 유의해야 합니다. `<For>`는 "참조에 의해 키 지정" 되기 때문에, 렌더링하는 각 노드는 배열의 요소에 연결됩니다. 즉, 배열에 있는 요소가 삭제 및 재생성되는 대신 위치가 변경되면 연결된 노드도 같이 이동해 해당 인덱스가 변경됩니다.

`each` prop은 배열 타입만 사용해야 하지만, [`Array.from`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from), [`Object.keys`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys), 또는 [스프레드 구문](`https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax`)과 같은 유틸리티를 사용해 iterable 객체를 배열로 바꿀 수 있습니다.
