Solid의 이벤트는 `on` 접두사가 붙은 속성입니다. 이들은 몇 가지 방벙으로 특별하게 취급됩니다. 먼저 래핑에 대한 일반적인 휴리스틱을 따르지 않습니다. 많은 경우, 시그널과 이벤트 핸들러의 차이점을 판단하기가 어렵습니다. 따라서 이벤트가 호출되고 업데이트를 위해 반응성이 필요없기 때문에 처음에만 바인딩됩니다. 애플리케이션의 현재 상태에 따라 핸들러가 항상 다른 코드를 실행하도록 할 수 있습니다.

일반적인 UI 이벤트(버블링 이벤트 및 합성 이벤트)는 자동으로 document에 위임됩니다. 위임된 성능을 향상시키기 위해 Solid는 추가 클로저를 생성하지 않고 데이터(첫 번째 인수로)로 핸들러로 호출하는 배열 구문을 지원합니다:

```jsx
const handler = (data, event) => /*...*/

<button onClick={[handler, data]}>Click Me</button>
```

예제에서 `mousemove` 이벤트에 핸들러를 추가해 보겠습니다:
```jsx
<div onMouseMove={handleMouseMove}>
  The mouse position is {pos().x} x {pos().y}
</div>
```

모든 `on` 바인딩은 대소문자를 구분하지 않기 때문에 이벤트 이름은 소문자여야 합니다. 예를 들어, `onMouseMove`는 `mousemove`를 모니터링합니다. 다른 대소문자를 구분하는 것을 지원하거나 이벤트 위임을 사용하지 않으려면, `on:` 네임스페이스를 사용하여 콜론 뒤에 오는 이벤트 핸들러를 매칭할 수 있습니다:

```jsx
<button on:DOMContentLoaded={() => /* Do something */} >Click Me</button>
```
