Solid는 props를 사용하지 않으면서 데이터를 전달할 수 있도록 Context API를 제공합니다.
이는 Signal과 Store를 공유할 때 유용합니다.
컨텍스트를 사용하면 리액티브 시스템의 일부로 생성되고, 이에 의해 관리된다는 장점이 있습니다.

시작하려면 먼저 Context 객체를 생성합니다.
Context 객체에는 데이터를 주입하는데 사용되는 `Provider` 컴포넌트가 포함되어 있습니다.
일반적으로 `Provider` 컴포넌트를 특정 컨텍스트용으로 설정된 `useContext` 컨슈머를 사용해 래핑해 사용합니다.

이 튜토리얼에 있는 내용이 바로 이 부분입니다.
`counter.tsx` 파일에서 간단한 카운터 Store에 대한 정의를 확인할 수 있습니다.

컨텍스트를 사용하려면 먼저 App 컴포넌트를 래핑하여 전역적으로 제공합니다.
우리는 래핑된 `CounterProvider`를 사용하며, 이 경우 초기 카운트값을 1로 설정합니다.

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

다음으로 `nested.tsx` 컴포넌트에서 `useCounter` 컨슈머를 사용해 카운터 컨텍스트를 사용합니다.

```jsx
const [count, { increment, decrement }] = useCounter();
return (
  <>
    <div>{count()}</div>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </>
);
```
