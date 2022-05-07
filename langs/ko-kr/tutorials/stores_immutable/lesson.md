저장소는 Solid의 Store 프록시를 사용해 Solid에서 가장 자주 생성됩니다.
때로는 Redux, Apollo, XState와 같은 변경 불가능한 라이브러리와 인터페이스하고 싶은 경우가 있으며, 이에 대해 세분화된 업데이트를 수행해야 합니다.

이 예제에서 Redux에 대한 기본적인 래퍼를 `useRedux.tsx` 파일에 구현했습니다. Store와 액션은 나머지 파일에 정의되어 있습니다.

핵심 동작은 Store 객체를 생성하고, 업데이트시 상태를 업데이트하기 위해 Redux 저장소를 구독한다는 것입니다.

```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(store.getState())
);
```
데모에서 아이템을 추가하고, 추가한 아이템을 체크해 보면 잘 작동하는 것처럼 보입니다. 
하지만 추가 시점과 체크박스를 체크하는 시점에 console.log 를 확인해보면 렌더링이 비효율적이라는 것을 알 수 있습니다.

이는 Solid가 기본적으로 diff를 사용하지 않기 때문에, 새 아이템을 새 것으로 가정하고 교체합니다.
데이터 변경이 세분화된다면 diff가 필요 없게 됩니다만, 이를 위해서는 어떻게 하면 될까요?

Solid는 `setStore` 호출을 향상시키고, 변경 불가능한 소스의 데이터를 비교해서 세분화된 업데이트만 알려주는 `reconcile`이라는 diffing 메서드를 제공합니다.

해당 코드를 다음과 같이 변경해 보겠습니다:
```js
const [state, setState] = createStore(store.getState());
const unsubscribe = store.subscribe(
  () => setState(reconcile(store.getState()))
);
```
이제 예제는 예상대로 동작하며, 생성시에만 생성 코드를 실행합니다.

이것만이 이 문제를 해결하는 유일한 방법은 아니며, 일부 프레임워크에서는 루프안에서 `key` 프로퍼티를 사용하기도 합니다.
문제는 이를 템플릿의 기본 부분으로 만들게 되면, 항상 리스트 조정을 실행해야 하며, 컴파일된 프레임워크에서도 잠재적인 하위 항목의 변경에 대해서 항상 diff를 수행해야 한다는 점입니다.
데이터 중심 접근 방식은 이를 템플릿 외부에 적용할 수 있을 뿐만 아니라 선택적으로 사용할 수 있게 만듭니다.
내부 상태 관리에 이것이 필요없다고 생각이 들면, 이는 기본적으로 최상의 성능을 유지하는고 있다는 것을 의미합니다.

물론, 필요할 때 `reconcile`을 사용하는 것은 문제가 없습니다. 
때로는 간단한 reducer가 데이터 업데이트를 구성하는 좋은 방법이 됩니다.
`reconcile`은 여기에서 빛을 발하여, 커스텀 `useReducer` 프리미티브를 만들게 됩니다:

```js
const useReducer = (reducer, state) => {
  const [store, setStore] = createStore(state);
  const dispatch = (action) => {
    state = reducer(state, action);
    setStore(reconcile(state));
  }
  return [store, dispatch];
};
```

`reconcile` 동작은 설정 가능합니다. 커스텀 `key`를 설정할 수 있으며, 객체의 레퍼런스를 비교하는 대신 말단 노드의 값을 비교하는 `merge` 옵션이 있습니다.
