시그널은 추적 가능한 값이지만, 방정식의 절반에 불과합니다. 이를 보완하기 위해 추적 가능한 값으로 업데이트할 수 있는 옵저버가 있습니다. _이펙트_ 는 옵저버 중 하나이며, 시그널에 의존하는 사이드 이펙트를 실행합니다.

`solid-js`에서 `createEffect`를 임포트해 이펙트를 생성할 수 있습니다. 이펙트는 함수가 실행되는 동안 읽은 모든 시그널을 자동으로 구독하고, 시그널이 변경되면 다시 실행됩니다.

`count`가 변경될 때마다 다시 실행되는 이펙트를 만들어 보겠습니다:

```jsx
createEffect(() => {
  console.log("The count is now", count());
});
```

`count` 시그널을 업데이트하기 위해, 버튼에 클릭 핸들러를 추가합니다:

```jsx
<button onClick={() => setCount(count() + 1)}>Click Me</button>
```

이제 버튼을 클릭하면 콘솔에 메시지를 출력합니다. 비교적 간단한 예이지만, Solid의 작동 방식을 이해하려면 JSX의 모든 표현식이 의존성을 가진 시그널이 변경될 때마다 다시 실행되는 자체 이펙트라고 생각하면 됩니다. *Solid의 관점에서 모든 렌더링은 리액티브 시스템의 사이드 이펙트일 뿐입니다* : 이것이 Solid에서 렌더링이 작동하는 방식입니다.

> 개발자가 `createEffect`를 사용해 만드는 이펙트는 렌더링이 완료된 후 실행되며, 주로 DOM과 상호 작용하는 업데이트를 스케줄링하는 데 사용됩니다. DOM을 좀 더 일찍 수정하려면, [`createRenderEffect`](https://www.solidjs.com/docs/latest/api#createrendereffect)를 사용하세요.
