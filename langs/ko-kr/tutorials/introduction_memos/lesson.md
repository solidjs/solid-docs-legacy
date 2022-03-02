대부분의 경우 파생된 Signal을 구성하는 것만으로 충분합니다. 그러나, 때로는 중복 작업을 줄이기 위해 값을 캐시하는 것이 좋습니다. Memo를 사용해 함수 실행 결과를 디펜던시가 변경될 때까지 캐시할 수 있습니다. 다른 디펜던시가 있는 Effect에 대한 계산을 캐싱하고, DOM 노드 생성과 같은 값비싼 작업에 필요한 작업을 완화하는데 도움이 됩니다.

Memo는 Effect와 같은 옵저버이면서 읽기 전용 Signal입니다. Memo는 자신의 디펜던시와 옵저버를 모두 알고 있기 때문에, 변경이 일어난 경우 한 번만 실행되도록 할 수 있습니다. 이 때문에 Signal에 Effect 설정을 등록하는 것이 좋습니다. 일반적으로 Signal을 파생할 수 있다면 파생된 Signal을 사용하는 것이 좋습니다.

`solid-js`에서 임포트한 `createMemo` 함수에 함수를 전달하면 Memo를 생성할 수 있습니다. 이 예에서, 클릭할 때마다 값을 재계산하는데 비용이 점점 더 많이 들게 됩니다. `createMemo`로 래핑하게 되면, 클릭당 한 번만 다시 계산됩니다:

```jsx
const fib = createMemo(() => fibonacci(count()));
```

얼마나 자주 호출되는지 확인하려면 `fib` 함수안에 `console.log`를 사용해 출력해 보세요:
```jsx
const fib = createMemo(() => {
  console.log("Calculating Fibonacci");
  return fibonacci(count());
});
```
