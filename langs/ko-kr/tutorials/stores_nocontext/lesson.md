컨텍스트는 Store를 위한 훌륭한 도구입니다. 인젝션을 처리하고, 소유권을 리액티브 그래프에 연결하고, 자동으로 할당 해제를 관리하며, Solid의 세분화된 렌더링 덕분에 렌더링 오버헤드가 없습니다.

때로는 컨텍스트를 사용하는게 너무 과도한 경우가 있으며, 대안은 리액티브 시스템을 직접 사용하는 것입니다.
예를 들어, 전역 스코프에 시그널을 생성하고 다른 모듈에서 사용할 수 있도록 `export`함으로써 전역 리액티브 데이터 스토어를 구축할 수 있습니다.

```js
import { createSignal } from 'solid-js';

export default createSignal(0);

// 다른 소스 파일:
import counter from './counter';
const [count, setCount] = counter;
```

Solid의 반응성은 보편적인 개념입니다. 이것이 컴포넌트 내부에 있는지 외부에 있는지는 중요하지 않습니다. 전역 상태 vs 로컬 상태에 대한 별도의 구분된 개념은 없으며, 모두 같은 것입니다.

유일한 제한 사항은 모든 계산(이펙트/메모)이 리액티브 루트(`createRoot`) 아래에 생성되어야 한다는 점입니다. Solid의 `render`는 이를 자동으로 수행합니다.

이 예제에서는 `counter.tsx`가 전역 Store입니다. `main.tsx`의 컴포넌트를 다음과 같이 수정할 수 있습니다:

```jsx
const { count, doubleCount, increment } = counter;

return (
  <button type="button" onClick={increment}>
    {count()} {doubleCount()}
  </button>
);
```

따라서 계산을 포함하는 더 복잡한 전역 Store를 사용할 때는 루트를 생성해야 합니다. 또는 더 나은 방법으로는 컨텍스트를 사용하세요.
