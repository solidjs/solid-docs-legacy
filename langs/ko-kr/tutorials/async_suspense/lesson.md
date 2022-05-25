`lazy`와 `createResource`를 단독으로 사용할 수 있지만, Solid는 여러 비동기 이벤트 표시를 조정하는 메커니즘도 제공합니다. `Suspense`는 이러한 비동기 이벤트가 완료될 때까지 일부 로드된 컨텐츠 대신 폴백 플레이스홀더를 표시할 수 있는 경계 역할을 합니다.

이렇게 하면 대량의 로딩 상태로 인한 버벅거림을 제거하여 사용자 경험을 개선할 수 있습니다. `Suspense`는 하위 비동기 읽기를 자동으로 감지하고 그에 따라 작동합니다. 필요한 만큼의 `Suspense` 컴포넌트를 중첩할 수 있으며, `loading` 상태가 변경되면 가장 가까운 상위 항목만 `fallback` 상태로 변환됩니다.

지연 로딩 예제에 `Suspense` 컴포넌트를 추가해 보겠습니다:

```jsx
<>
  <h1>Welcome</h1>
  <Suspense fallback={<p>Loading...</p>}>
    <Greeting name="Jake" />
  </Suspense>
</>
```

이제 로딩 플레이스홀더가 생겼습니다.

비동기 fetch 자체가 아니라, `Suspense`를 트리거하는 비동기 파생 값을 읽는다는 점에 유의하세요. `Suspense` 경계 내에서 Resource 시그널(`lazy` 컴포넌트 포함)이 읽히지 않으면, 정지되지 않습니다.

`Suspense`는 두 브랜치를 모두 렌더링하는 `Show` 컴포넌트일 뿐입니다. `Suspense`는 비동기 서버 렌더링에 필수적이지만, 클라이언트 렌더링 코드에 바로 적용하려고 할 필요는 없습니다. Solid의 세분화된 렌더링은 이를 수동으로 분할하는데 추가 비용이 들지 않습니다.

```jsx
function Deferred(props) {
  const [resume, setResume] = createSignal(false);
  setTimeout(() => setResume(true), 0);

  return <Show when={resume()}>{props.children}</Show>;
}
```

Solid의 모든 작업은 이미 독립적으로 대기열에 들어 있기 때문에 타임 슬라이싱과 같은 것은 필요하지 않습니다.
