때로는 조정하고 싶은 `Suspense` 컴포넌트가 여러 개 있을 것입니다. 사용 가능한 하나의 접근 방식은 모든 것을 단일 `Suspense` 아래에 두는 것이지만, 이는 하나의 로딩 동작만 사용하도록 제한합니다. 단일 폴백 상태는 마지막 항목이 로드될 때까지 모든 항목이 기다리야 함을 의미합니다. 이를 해결하기 위해 Solid는 대신 `SuspenseList` 컴포넌트를 도입합니다.

예제와 같이 여러 `Suspense` 컴포넌트가 있다고 해봅시다. `revealOrder`를 `forwards`로 설정한 `SuspenseList`로 래핑하면, 로드 순서에 상관없이 트리에 나타나는 순서대로 렌더링됩니다. 이렇게 하면 페이지가 점핑하는 것이 줄어듭니다. `revealOrder`를 `backwards`나 `together`로 설정하게 되면, 순서를 반대로 하거나 모든 Suspense 컴포넌트가 로드될 때까지 기다립니다. 또한 `tail` 옵션이 있는데 `hidden`이나 `collapsed`로 설정함으로써, `revealOrder` 설정값을 오버라이드해서 폴백 상태를 표시하거나 표시하지 않도록 합니다.

예제는 플레이스홀더 로드 측면에서 약간 엉망입니다. 모든 데이터를 독립적으로 로딩하면서, 데이터 로딩 순서에 따라 여러 플레이스홀더를 표시하는 경우가 많습니다. `ProfilePage` 컴포넌트의 JSX를 `<SuspenseList>`로 래핑해 보겠습니다:

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={props.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={props.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={props.trivia} />
  </Suspense>
</SuspenseList>
```
