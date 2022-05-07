Solid의 성능을 높이는 부분 중 하나는 컴포넌트가 기본적으로 함수 호출이기 때문입니다. 컴파일러가 객체의 getter 안에서 잠재적으로 리액티브한 표현식을 래핑하는 방식으로 업데이트를 전파합니다. 컴파일 결과를 다음과 같이 그려볼 수 있습니다:

```jsx
// 이 JSX 표현식이
<MyComp dynamic={mySignal()}>
  <Child />
</MyComp>

// 이렇게 컴파일됩니다.
MyComp({
  get dynamic() { return mySignal() },
  get children() { return Child() }
});
```

이는 props가 지연 평가됨을 의미합니다. props에 대한 액세스는 사용될 때까지 연기됩니다. 이로 인해 추가 래퍼나 동기화를 도입하지 않으면서도 반응성을 유지할 수 있습니다. 하지만, 반복적인 액세스로 인해 자식 컴포넌트나 엘리먼트가 다시 생성될 수 있음을 의미하기도 합니다.

대부분의 경우 JSX에 props를 삽입하기 때문에 문제가 없습니다만, 자식 컴포넌트 관련 작업에서는 자식들이 여러 번 생성되지 않도록 주의할 필요가 있습니다.

이러한 이유로, Solid는 `children` 헬퍼를 제공합니다. 이 메서드는 `children` prop 에 대해 memo를 생성하고, 자식과 직접 인터랙션을 할 수 있도록 중첩된 자식들에 대해서도 리액티브한 참조를 제공합니다.

예제에서는, 동적 리스트에 있는 각 항목의 `color` 스타일 속성을 설정하려고 합니다. `props.children`와 직접 인터랙션을 하게 되면, 노드가 여러 번 생성될 뿐만 아니라 `props.children`이 `<For>`에서 반환된 Memo인 함수임을 알 수 있습니다.

대신 `colored-list.tsx` 파일 내부에서 `children` 헬퍼를 사용해 보겠습니다:

```jsx
export default function ColoredList(props) {
  const c = children(() => props.children);
  return <>{c()}</>
}
```

이제 엘리먼트를 업데이트하기 위해 이펙트를 생성해 보겠습니다:
```jsx
createEffect(() => c().forEach(item => item.style.color = props.color));
```
