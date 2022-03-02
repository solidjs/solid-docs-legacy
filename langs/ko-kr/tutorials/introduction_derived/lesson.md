JSX에서 Signal에 액세스하는 경우 해당 Signal이 변경되면 뷰가 자동으로 업데이트되는 것을 보았습니다. 하지만 컴포넌트 함수 자체는 한 번만 실행됩니다.

Signal을 함수로 래핑하여 Signal에 의존하는 새로운 표현식을 생성할 수 있습니다. Signal에 액세스하는 함수도 Signal입니다: 래핑된 Signal이 변경되면 Signal에 의존하는 다른 Signal도 업데이트합니다.

`doubleCount` 함수를 사용해 Counter의 카운트를 2씩 증가해보겠습니다:

```jsx
const doubleCount = () => count() * 2;
```

JSX에서 Signal처럼 `doubleCount`를 호출할 수 있습니다: 
```jsx
return <div>Count: {doubleCount()}</div>;
```

이러한 _파생된 Signal_ 을 호출하는 이유는, 액세스하는 Signal에서 반응성을 얻기 때문입니다. 파생된 Signal은 자체에 값을 저장하지 않습니다(파생된 Signal을 생성하고 호출하지 않으면, Solid는 미사용 함수처럼 결과물에서 제외합니다). 하지만 의존하는 모든 Effect를 업데이트하고, 뷰에 포함된 경우 렌더링을 트리거합니다.
