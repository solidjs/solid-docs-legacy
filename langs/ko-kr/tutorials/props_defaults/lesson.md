Props는 JSX에 바인딩된 모든 속성을 나타내는, 실행시 컴포넌트 함수에 전달되는 객체입니다. Props 객체는 읽기 전용이며, Object getter로 래핑된 리액티브 프로퍼티를 가집니다. 이를 통해 호출자가 Signal 이나 Signal 표현식, 단순한 값, 정적 값을 사용했는지 여부에 관계없이 일관된 형식을 가질 수 있습니다.

이러한 이유로 트래킹 스코프 밖에서 props 객체를 디스트럭처링하면 반응성을 잃을 수 있기 때문에, 디스트럭처링을 사용하지 않는 것이 중요합니다. 일반적으로 Solid의 프리미티브나 JSX 밖에서 props 객체의 프로퍼티에 액세스하면 반응성을 잃을 수 있습니다. 이는 디스트럭처링 뿐만 아니라 스프레드 연산자, `Object.assign`과 같은 함수에도 적용됩니다.

Solid는 props를 사용할 때 도움이 되는 몇 가지 유틸리티를 제공합니다. 첫 번째는 `mergeProps` 인데, 반응성을 잃지 않고 리액티브 객체를 머지(비파괴적인 `Object.assign`)할 수 있습니다. 컴포넌트의 디폴트 props를 설정할 때 일반적으로 많이 사용합니다.

예제의 `greetings.tsx` 파일에서 디폴트 값을 템플릿에 인라인으로 정의했지만, `mergeProps`를 사용해 디폴트 값을 설정할 때도 리액티브 업데이트를 유지할 수 있습니다:

```jsx
const merged = mergeProps({ greeting: "Hi", name: "John" }, props);

return <h3>{merged.greeting} {merged.name}</h3>
```
