Solid는 `class`와 `className`를 사용해 엘리먼트의 `className` 프로퍼티를 설정할 수 있습니다. 하지만 조건문을 사용해 class를 설정하는 것이 편한 경우가 많습니다. 이러한 이유로, Solid는 키가 class 이름이고 값이 boolean 표현식인 객체를 받는 빌트인 `classList` JSX 속성을 제공합니다. 표현식이 true인 경우 class가 적용되며, false인 경우 삭제됩니다.

예제에서 다음 코드를:

```jsx
<button
  class={current() === 'foo' ? 'selected' : ''}
  onClick={() => setCurrent('foo')}
>foo</button>
```

다음과 같이 변경할 수 있습니다:

```jsx
<button
  classList={{selected: current() === 'foo'}}
  onClick={() => setCurrent('foo')}
>foo</button>
```

CSS 모듈에서 받은 이름을 동적으로 적용할 수도 있습니다:

```jsx
import { active } from "./style.module.css"

<div classList={{ [active]: isActive() }} />
```
