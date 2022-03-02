_Signal_ 은 Solid에서 반응성의 토대가 됩니다. Signal은 시간이 지남에 따라 변경되는 값을 포함합니다; Signal의 값을 변경하면 해당 Signal을 사용하는 모든 것이 자동으로 업데이트됩니다.

Signal을 생성하려면, `solid-js`에서 `createSignal`을 임포트 한 다음 Counter 컴포넌트에서 다음과 같이 호출합니다:
```jsx
const [count, setCount] = createSignal(0);
```

create 호출에 전달된 인수는 초기값이고, 리턴값은 getter와 setter의 두 함수를 가지는 배열입니다. [디스트럭쳐링](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)을 사용해, 함수의 이름을 원하는대로 지정할 수 있습니다. 이 경우에는 getter를 `count`, setter를 `setCount`로 이름을 지정합니다.

첫 번째 반환값은 값 자체가 아니라 getter(현재 값을 반환하는 함수)라는 점에 유의해야 합니다. 이는 프레임워크가 Signal을 읽는 위치를 추적해서 그에 따라 업데이트해야 하기 때문입니다.

여기에서는 자바스크립트의 `setInterval` 함수를 사용해 주기적으로 증가하는 카운터를 생성합니다. Counter 컴포넌트에 다음 코드를 추가하여 매초마다 `count` Signal을 업데이트할 수 있습니다:

```jsx
setInterval(() => setCount(count() + 1), 1000);
```

매 틱마다 이전 카운트를 읽고, 1을 더한 다음, 새 값을 설정합니다.

> Solid의 Signal은 이전 값을 사용해 다음 값을 설정할 수 있는 함수 형식을 허용합니다.
> ```jsx
> setCount(c => c + 1);
> ```

마지막으로, JSX 코드에서 Signal 값을 사용합니다:

```jsx
return <div>Count: {count()}</div>;
```
