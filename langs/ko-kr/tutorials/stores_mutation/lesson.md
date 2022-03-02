Solid는 상태를 업데이트할 때 얕은 불변 패턴 사용할 것을 강력하게 권장합니다.
읽기와 쓰기를 분리함으로써 컴포넌트 계층들을 통과할 때 프록시에 대한 변경 사항을 잃어버릴 위험없이 시스템의 반응성을 더 잘 컨트롤할 수 있습니다. 
이 점은 Signal에 비해 Store에서 훨씬 더 증대됩니다.

하지만 Mutation이 더 추론하기 쉬운 경우도 있습니다.
그렇기 때문에 Solid는 `setStore` 호출 내에서 Store 객체의 쓰기 가능한 프록시 버전을 수정할 수 있도록 Immer에서 영감을 받은 `produce` store 수정 함수를 제공합니다. 

이는 컨트롤을 포기하지 않으면서도 작은 영역의 mutation을 허용하는 좋은 도구입니다.
Todo 예제에서 이벤트 핸들러를 다음과 같이 변경해서 `produce`를 사용해 보겠습니다:

```jsx
const addTodo = (text) => {
  setStore(
    'todos',
    produce((todos) => {
      todos.push({ id: ++todoId, text, completed: false });
    }),
  );
};
const toggleTodo = (id) => {
  setStore(
    'todos',
    todo => todo.id === id,
    produce((todo) => (todo.completed = !todo.completed)),
  );
};
```

Store에 `produce`를 사용하면 대부분의 케이스를 처리할 수 있지만, Solid에는 `createMutable`를 사용해 mutable Store 객체를 생성하는 방법도 있습니다.
내부 API에 권장되는 접근 방식은 아니지만, 때로는 서드파티 시스템과의 상호 운용성이나 호환성을 위해 유용하게 사용할 수 있습니다. 
