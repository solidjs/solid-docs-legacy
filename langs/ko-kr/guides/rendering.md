---
title: 렌더링
description: Discusses the different templating and rendering options in Solid.
sort: 2
---

# 렌더링

Solid는 JSX, 태그가 지정된 템플릿 리터럴, Solid의 하이퍼스크립트 변형 이렇게 3가지 형식을 지원하며, 주로 JSX를 사용합니다. 그 이유는 JSX가 컴파일을 위해 만들어진 훌륭한 DSL이기 때문입니다. 명확한 문법을 가지며, 타입스크립트를 지원하고, Babel와 잘 작동하며, 코드 문법 하이라이팅 기능 및 prettier 등과 같은 도구를 지원합니다. 이 모든 것을 무료로 제공하는 도구들을 사용하는 것은 실용적이었습니다. 컴파일된 솔루션으로 훌륭한 DX를 제공합니다. 이렇게 널리 지원되는 것들을 사용할 수 있는데 굳이 커스텀 문법의 DSL을 사용해 어려움을 겪을 필요가 있을까요?

## JSX 컴파일

렌더링은 JSX 템플릿을 최적화된 네이티브 js 코드로 사전에 컴파일하는 것과 관련있습니다. JSX 코드는 다음을 생성합니다:

- 인스턴스화 될 때마다 복제되는 템플릿 DOM 엘리먼트
- firstChild 와 nextSibling만 사용하는 일련의 참조 선언
- 생성된 엘리먼트를 업데이트하기 위한 세분화된 계산

이 방법은 document.createElement를 사용하여 엘리먼트를 하나씩 만드는 것보다 성능도 좋고 코드 양도 적습니다.

## 속성 및 Props

Solid는 속성의 대소문자를 구분하지 않는 등 HTML 컨벤션을 최대한 따르려고 노력합니다.

네이티브 엘리먼트 JSX의 모든 속성의 대부분은 DOM 속성으로 설정됩니다. 정적 값들은 복제되는 템플릿에 직접 포함됩니다. 추가 기능을 제공하는 `class`, `style`, `value`, `innerHTML`과 같은 몇 가지 예외도 있습니다.

하지만, 커스텀 엘리먼트(네이티브 빌트인은 제외)는 동적인 경우 props가 기본값인데, 이는 더 복잡한 데이터 타입을 핸들링하기 때문입니다. `some-attr`과 같은 표준 스네이크 케이스 속성 이름은 `someAttr`과 같은 카멜 케이스로 변환합니다.

하지만, 네임스페이스 지시문을 사용해서 이 동작을 제어할 수 있습니다. 속성을 `attr:`으로 강제하거나 property를 `prop:`으로 강제할 수 있습니다.

```jsx
<my-element prop:UniqACC={state.value} attr:title={state.title} />
```

> **참고:** 정적 속성은 복제되는 html 템플릿의 일부로 만들어집니다. 고정 표현식과 동적 표현식은 JSX 바인딩 순서에 나중에 적용됩니다. 대부분의 DOM 엘리먼트에는 문제가 없지만, `type='range'`를 가지는 input 엘리먼트와 같이 순서가 중요한 것도 있습니다. 엘리먼트를 바인딩할 때 이 점에 유의하세요.

## 진입점

Solid를 마운트하는 가장 쉬운 방법은 `solid-js/web`에서 `render`를 임포트하는 것입니다. `render` 는 첫 번째 인자로 함수를, 두 번째 인자로 마운트할 컨테이너를 받으며, 언마운트 함수를 반환합니다. `render` 함수는 자동으로 리액티브 루트를 생성하고 마운트 컨테이너로의 렌더링을 핸들링합니다. 최고의 성능을 위해서는 자식이 없는 엘리먼트를 사용하세요.

```jsx
import { render } from "solid-js/web";

render(() => <App />, document.getElementById("main"));
```

> **중요** 첫 번째 인자는 함수여야 합니다. 그렇지 않으면 리액티브 시스템을 제대로 추적하고 스케줄할 수 없습니다. 이 간단한 부분을 누락하게 되면 Effect가 실행되지 않습니다.

## 컴포넌트

Solid에서 컴포넌트는 파스칼 케이스 이름을 가진 함수입니다. 첫 번째 인자는 props 객체이며, 실제 DOM 노드를 반환합니다.

```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);

const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

모든 JSX 노드는 실제 DOM 노드이므로, 최상위 레벨 컴포넌트의 유일한 책임은 이를 DOM에 추가하는 것입니다.

## Props

React, Vue, Angular 및 기타 프레임워크와 마찬가지로, Solid는 컴포넌트에 property를 정의해서 데이터를 자식 컴포넌트로 전달할 수 있습니다. 아래 코드에서는 Parent가 "Hello" 문자열을 `greeting` property를 통해 `Label` 컴포넌트로 전달합니다.
```jsx
const Parent = () => (
  <section>
    <Label greeting="Hello">
      <div>John</div>
    </Label>
  </section>
);
```

위의 예제에서 `greeting`에 정적 값이 지정되었지만, 동적 값도 설정할 수 있습니다. 예를 들면:

```jsx
const Parent = () => {
  const [greeting, setGreeting] = createSignal("Hello");

  return (
    <section>
      <Label greeting={greeting()}>
        <div>John</div>
      </Label>
    </section>
  );
};
```

컴포넌트는 `props` 인자를 통해 전달된 property에 접근할 수 있습니다.

```jsx
const Label = (props) => (
  <>
    <div>{props.greeting}</div>
    {props.children}
  </>
);
```

다른 프레임워크와 달리, 컴포넌트의 `props`에 대해서 디스트럭쳐링을 사용할 수 없습니다. `props` 객체는 내부적으로 Object의 getter를 사용해 값을 지연 취득하기 때문입니다. 디스트럭쳐링을 사용하게 되면 `props`의 반응성을 손상시키게 됩니다.

다음 예제는 Solid에서 props에 접근하는 "올바른" 방법을 보여줍니다:

```jsx
// `props.name` 은 예상한대로 업데이트됩니다.
const MyComponent = (props) => <div>{props.name}</div>;
```

다음 예제는 Solid에서 props에 접근하는 "잘못된" 방법을 보여줍니다:

```jsx
// 잘못된 방법
// `props.name`은 `name`으로 디스트럭쳐링 되었기 때문에 리액티브하지 않게 되면서, 값이 업데이트되지 않습니다.
const MyComponent = ({ name }) => <div>{name}</div>;
```

props 객체는 사용할 때는 일반 객체처럼 보이지만 (타입스크립트 사용자는 일반 객체처럼 타이핑된 것을 볼 수 있습니다), 실제로는 Signal과 유사한 리액티브 객체입니다. 여기에는 몇 가지 의미가 있습니다.

대부분의 JSX 프레임워크와 달리, Solid의 함수 컴포넌트는 (렌더링 사이클마다 실행되지 않고) 한 번만 실행되기 때문에 다음 예제는 예상대로 작동하지 않습니다.

```jsx
import { createSignal } from "solid-js";

const BasicComponent = (props) => {
  const value = props.value || "default";

  return <div>{value}</div>;
};

export default function Form() {
  const [value, setValue] = createSignal("");

  return (
    <div>
      <BasicComponent value={value()} />
      <input type="text" oninput={(e) => setValue(e.currentTarget.value)} />
    </div>
  );
}
```

이 예제에서는 아마 `BasicComponent`가 `input`에 입력된 현재 값을 표시하고 싶었을 것입니다. 하지만, `BasicComponent` 함수는 컴포넌트 생성시 한 번만 실행된다는 점을 기억해야 합니다. 처음 생성시, `props.value` 는 `''`입니다. 이는 `BasicComponent`에 있는 `const value`는 `'default'`가 되며 절대로 업데이트되지 않음을 의미합니다. `props` 객체는 리액티브하지만, `const value = props.value || 'default';` 에서 props에 접근하는 것은 Solid의 관찰 범위를 벗어나므로, props가 변경되더라도 자동으로 재평가되지 않습니다.

그렇다면 이 문제를 어떻게 해결해야 할까요?

`props`를 Solid가 관찰할 수 있는 곳에서 접근해야 합니다. 일반적으로 JSX 내부 혹은 `createMemo`, `createEffect` 또는 thunk(`() => ...`)의 내부를 의미합니다. 여기서는 예상한대로 작동하는 솔루션 중 하나를 소개합니다:

```jsx
const BasicComponent = (props) => {
  return <div>{props.value || "default"}</div>;
};
```

이렇게하면, 함수로 호이스팅될 수 있습니다:

```jsx
const BasicComponent = (props) => {
  const value = () => props.value || "default";

  return <div>{value()}</div>;
};
```

또 다른 방법으로, 비용이 많이 드는 계산인 경우, `createMemo`를 사용할 수 있습니다. 예를 들면:

```jsx
const BasicComponent = (props) => {
  const value = createMemo(() => props.value || "default");

  return <div>{value()}</div>;
};
```

혹은 헬퍼 함수를 사용할 수 있습니다:

```jsx
const BasicComponent = (props) => {
  props = mergeProps({ value: "default" }, props);

  return <div>{props.value}</div>;
};
```

참고로 다음 예제는 _작동하지 않습니다_:

```jsx
// 잘못됨
const BasicComponent = (props) => {
  const { value: valueProp } = props;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};

// 잘못됨
const BasicComponent = (props) => {
  const valueProp = props.value;
  const value = createMemo(() => valueProp || "default");
  return <div>{value()}</div>;
};
```

Solid의 컴포넌트는 성능의 중요한 부분입니다. Solid의 "사라지는<sub>disappearing</sub>" 컴포넌트 접근 방식은 지연된 props 평가를 통해 이루어집니다. props 표현식을 즉시 평가하고 값을 전달하는 대신, 자식 컴포넌트에서 props에 접근할 때까지 실행을 연기합니다. 이렇게 실행을 마지막 순간(일반적으로 DOM 바인딩 시점)까지 연기함으로써 성능을 극대화합니다.

```jsx
<Component prop1="static" prop2={state.dynamic} />;

// 대략 다음과 같이 컴파일됩니다:

// 컴포넌트 바디를 untrack 함으로써 격리와 함께 값비싼 업데이트를 방지합니다.
untrack(() =>
  Component({
    prop1: "static",
    // 동적 표현식
    get prop2() {
      return state.dynamic;
    },
  })
);
```

반응성을 유지하기 위해 Solid는 몇가지 props 헬퍼를 제공합니다:

```jsx
// 디폴트 props
props = mergeProps({ name: "Smith" }, props);

// props 복제
const newProps = mergeProps(props);

// props 병합
props = mergeProps(props, otherProps);

// props를 여러개의 props 객체로 분할
const [local, others] = splitProps(props, ["className"])
<div {...others} className={cx(local.className, theme.component)} />
```

## 자식 컴포넌트

Solid는 JSX 자식들을 React와 유사하게 처리합니다. 단일 자식은 `props.children`의 단일 값이고, 여러 자식들은 값 배열을 통해 처리됩니다. 일반적으로 자식들을 JSX 뷰에 전달합니다. 그러나 자식들과의 인터랙션이 필요한 경우, 다운 스트림 제어 흐름을 해결하고 Memo를 반환하는 `children` 헬퍼를 사용하는 것이 좋습니다.

```jsx
// 단일 자식
const Label = (props) => <div class="label">Hi, { props.children }</div>

<Label><span>Josie</span></Label>

// 여러 자식들
const List = (props) => <div>{props.children}</div>;

<List>
  <div>First</div>
  {state.expression}
  <Label>Judith</Label>
</List>

// 자식들 매핑
const List = (props) => <ul>
  <For each={props.children}>{item => <li>{item}</li>}</For>
</ul>;

// 헬퍼를 사용해 자식들을 변경하고 매핑
const List = (props) => {
  // children 헬퍼는 값들을 메모아이즈하고, 모든 중간의 반응성을 해결합니다.
  const memo = children(() => props.children);
  createEffect(() => {
    const children = memo();
    children.forEach((c) => c.classList.add("list-child"))
  })
  return <ul>
    <For each={memo()}>{item => <li>{item}</li>}</For>
  </ul>;
```

**중요함:** Solid는 자식 태그들을 비싼 표현식으로 취급하고, 동적 리액티브 표현식과 같은 방식으로 래핑합니다. 즉, `props` 접근에 대해 지연 평가한다는 것을 의미합니다. 뷰에서 사용하기 전에 여러 번 접근하거나 디스트럭쳐링할 때 주의해야 합니다. 이는 Solid가 미리 가상 DOM 노드를 만들어 비교할 수 있는 사치를 누릴 수 없기 때문에, `props`의 값에 대한 접근은 지연시키고 신중하게 해야합니다. 이를 위해서는 메모아이즈를 사용하는 `children` 헬퍼를 사용하세요.
