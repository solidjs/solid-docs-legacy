JSX는 실제 DOM 엘리먼트를 생성하기 때문에, Solid에서는 항상 할당을 통해 DOM에 대한 레퍼런스를 얻을 수 있습니다. 예를 들어:

```jsx
const myDiv = <div>My Element</div>;
```

하지만, 엘리먼트를 분리하지 않고 하나의 연속된 JSX 템플릿에 넣는 경우 Solid가 생성시 최적화를 더 잘할 수 있다는 이점이 있습니다.

Solid에서는 `ref` 속성을 사용해 엘리먼트에 대한 레퍼런스를 얻을 수 있습니다.
레퍼런스는 기본적으로 위의 예제와 같은 할당이며, 문서의 DOM에 첨부되기 전에 생성될 때 할당이 발생합니다. 
변수를 선언하고, `ref` 속성에 전달하기만 하면 변수가 할당됩니다:

```jsx
let myDiv;

<div ref={myDiv}>My Element</div>
```

이제 canvan 엘리먼트에 대한 레퍼런스를 가져와 애니메이션을 적용해 보겠습니다:

```jsx
<canvas ref={canvas} width="256" height="256" />
```

레퍼런스는 콜백 함수의 형태로도 사용 가능합니다. 이는 엘리먼트가 첨부될 때까지 기다릴 필요가 없이 로직을 캡슐화할 때 편리합니다. 예를 들어:

```jsx
<div ref={el => /* do something with el... */}>My Element</div>
```
