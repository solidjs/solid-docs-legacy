중첨된 반응성에 대한 Solid의 대답은 Store 입니다. Store는 프록시 객체이며, 프록시 내부의 프로퍼티를 추적할 수 있으며 프록시 내부에 자동으로 래핑되는 다른 객체들을 포함합니다.

Store를 가볍게 유지하기 위해, Solid는 추적 범위 내에서 접근하는 프로퍼티에 대해서만 내부적으로 Signal을 생성합니다. 따라서 Store의 모든 Signal들은 필요시 지연 생성됩니다.

`createStore` 함수 호출시 초기값을 인자로 받아서, Signal과 비슷하게 읽기/쓰기 튜플을 반환합니다. 첫 번째 항목은 읽기 전용 Store 프록시이며, 두 번째 항목은 setter 함수입니다.

setter 함수의 가장 기본적인 형식은 인자로 객체를 받으며, 받은 객체의 프로퍼티를 현재 상태에 머지합니다. 또한 중첩된 업데이트를 할 수 있도록 path syntax도 지원합니다.

이러한 방법으로 반응성에 대한 제어를 유지하면서도 원하는 부분만 선택해 업데이트할 수 있게 되었습니다.

> Solid의 path syntax 에는 많은 형식이 있으며, 반복과 범위을 위한 강력한 구문도 포함하고 있습니다. 전체 레퍼런스를 보려면 API 문서를 참고하세요.

Store를 사용해 중첩된 반응성을 구현하는게 얼마나 간단한지 살펴보겠습니다. 컴포넌트 초기화 코드를 다음과 같이 변경합니다:

```js
const [store, setStore] = createStore({ todos: [] });
const addTodo = (text) => {
  setStore('todos', (todos) => [...todos, { id: ++todoId, text, completed: false }]);
};
const toggleTodo = (id) => {
  setStore('todos', (t) => t.id === id, 'completed', (completed) => !completed);
};
```

setter 함수에 Store의 path syntax를 사용해 중첩된 값의 이전 상태를 가져와 새 상태를 반환하도록 했습니다.

이게 전부입니다. 템플릿의 다른 부분은 이미 세분화되어 반응하게 됩니다 (체크박스를 클릭한 다음 콘솔을 확인해보세요).
