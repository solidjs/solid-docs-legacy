# 타입스크립트

Solid는 타입스크립트와 함께 사용하기 쉽도록 설계되었습니다:
표준 JSX를 사용하기 때문에 타입스크립트는 코드를 대부분 이해할 수 있으며, API에 정교한 내장 타입을 제공합니다.
이 가이드는 타입스크립트로 Solid 코드를 작성하는데 유용한 팁을 다룹니다.

## 타입스크립트 설정

[Solid starter templates](https://github.com/solidjs/templates/)는 [`tsconfig.json`](https://github.com/solidjs/templates/blob/master/ts/tsconfig.json)을 위한 좋은 시작점을 제공합니다.

Solid JSX 컴파일러와 타입스크립트를 함께 사용하려면, [`"jsx": "preserve"`](https://www.typescriptlang.org/tsconfig#jsx) 설정을 사용해 JSX 구조를 그대로 유지해야 하며, [`"jsxImportSource": "solid-js"`](https://www.typescriptlang.org/tsconfig#jsxImportSource) 으로 JSX 타입을 지정해야 합니다.
따라서, 최소한의 `tsconfig.json` 파일은 다음과 같습니다:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

코드 베이스가 여러 JSX 타입을 사용(예를 들어, 리액트와 Solid를 같이 사용)하는 경우, 가장 많이 사용하는 코드 타입을 `tsconfig.json` 파일의 `jsxImportSource` 기본값으로 설정한 다음, 다른 타입을 사용하는 파일에서 아래와 같은 프래그마를 사용해 [`jsxImportSource` 옵션을 오버라이드](https://www.typescriptlang.org/tsconfig#jsxImportSource)합니다:

```ts
/** @jsxImportSource solid-js */
```

또는

```ts
/** @jsxImportSource react */
```

## API 타입

Solid는 타입스크립트로 작성되었기 때문에, 모든 것이 타입이 지정되어 있습니다.
[API 문서](https://www.solidjs.com/docs/latest/api)에는 API 호출 타입과 함께 유용한 몇 가지 타입들에 대해 자세히 설명하고 있습니다.
여기에서 핵심 프리미티브 사용시 결과 타입에 대해서 알아보겠습니다.

### Signal

`createSignal<T>` 는 시그널에 저장된 객체 타입 `T`에 의해 파라미터화됩니다. 예를 들어:

```ts
const [count, setCount] = createSignal<number>();
```

`createSignal`은 전달한 타입에 해당하는 `Signal<number>` 타입을 반환하며, 이는 제네릭 타입을 갖는 getter와 setter의 튜플입니다:

```ts 
import type { Signal, Accessor, Setter } from 'solid-js';
type Signal<T> = [get: Accessor<T>, set: Setter<T>];
```

이 경우, `count` getter의 타입은 `Accessor<number | undefined>`입니다.
`Accessor<T>`는 Solid에서 제공하는 타입 정의이며, 이 경우 `() => number | undefined`와 동일합니다.
예제에서는 `createSignal`에 디폴트 값을 지정하지 않았기 때문에 `| undefined` 타입이 추가되었습니다.
시그널의 디폴트 값은 따라서 `undefined`가 됩니다.

`setCount` setter는 `Setter<number>` 타입이며, 대략 `(value?: number | ((prev?: number) => number)) => number` 에 해당하는 복잡한 타입입니다.
`number` 타입, 혹은 이전 값을 받아서 숫자를 반환하는 함수를 인수로 사용해 `setCount`를 호출할 수 있습니다.

실제 `Setter` 타입은 더 복잡합니다.
새 값을 결정하기 위해 함수를 호출하는 대신 시그널을 해당 함수 값으로 설정하고 싶은 경우, 실수로 함수를 setter에 전달하는 것을 감지합니다.
`setCount(value)`를 호출할 때 "Argument ... is not assignable to parameter"라는 타입스크립트 에러가 표시된다면, setter 인수를 래핑해 `setCount(() => value)` 처럼 호출을 해서 `value`가 호출되지 않도록 해보세요.

##### 디폴트 값

`createSignal`을 호출할 때 디폴트 값을 제공하게 되면 명시적으로 시그널 타입을 지정하지 않아도 되며, 타입에서 `| undefined`를 제거할 수 있습니다:

```ts
const [count, setCount] = createSignal(0);
const [name, setName] = createSignal('');
```

이 경우, 타입스크립트는 시그널 타입을 `number`, `string`으로 추론합니다.
따라서, `count`는 `Accessor<number>` 타입이 되며, `name`는 `Accessor<string>` 타입을 얻게 됩니다(`| undefined` 타입 없음).

### Context

시그널과 유사하게 [`createContext<T>`](https://www.solidjs.com/docs/latest/api#createcontext)는 컨텍스트 값 타입 `T`로 파라미터화 됩니다.
다음과 같이 타입을 명시할 수 있습니다:

```ts
type Data = {count: number, name: string};
const dataContext = createContext<Data>();
```

이 경우, `dataContext`는 `Context<Data | undefined>` 타입이며, `useContext(dataContext)`는 `Data | undefined` 타입을 반환합니다.
`| undefined`가 붙은 이유는, 현재 컴포넌트의 부모에서 컨텍스트를 제공하지 않은 경우 `useContext`가 `undefined`를 반환하기 때문입니다.

`createContext`에 디폴트 값을 제공하게 되면 `| undefined` 타입을 제거할 수 있으며, `createContext`의 타입을 명시적으로 지정하지 않아도 됩니다:

```ts
const dataContext = createContext({count: 0, name: ''});
```

이 경우, 타입스크립트는 `dataContext` 타입을 `Context<{count: number, name: string}>`으로 추론하며, `Context<Data>`와 동일합니다(`| undefined` 타입 없음).

다른 일반적인 패턴은 컨텍스트에 대한 값을 생성하는 팩토리 함수를 정의하는 것입니다.
타입스크립트의 [`ReturnType`](https://www.typescriptlang.org/docs/handbook/utility-types.html#returntypetype) 유틸리티 타입을 사용해 함수의 리턴 타입을 가져와 컨텍스트 타입으로 사용할 수 있습니다:

```ts
export const makeCountNameContext = (initialCount = 0, initialName = '') => {
  const [count, setCount] = createSignal(initialCount);
  const [name, setName] = createSignal(initialName);
  return [{count, name}, {setCount, setName}] as const;
    // `as const` 는 튜플 타입으로 추론하도록 합니다.
};
type CountNameContextType = ReturnType<typeof makeCountNameContext>;
export const CountNameContext = createContext<CountNameContextType>();
export const useCountNameContext = () => useContext(CountNameContext);
```

이 예제에서 `CountNameContextType` 는 `makeCountNameContext`의 반환 타입에 해당합니다:
```ts
[
  {readonly count: Accessor<number>, readonly name: Accessor<string>},
  {readonly setCount: Setter<number>, readonly setName: Setter<string>}
]
```

`useCountNameContext`는 `() => CountNameContextType | undefined` 타입을 가집니다.

`undefined` 발생 가능성을 피하고자 한다면, 항상 컨텍스트가 제공된다고 지정할 수 있습니다:
```ts
export const useCountNameContext = () => useContext(CountNameContext)!;
```

이렇게 가정하는 것은 위험하며, 항상 컨텍스트가 정의되도록 `createContext`에 기본값을 지정하는 것이 더 안전합니다.

## 컴포넌트 타입

```ts
import type { JSX, Component } from 'solid-js';
type Component<P = {}> = (props: P) => JSX.Element;
```

기본 컴포넌트 함수의 타입을 지정하려면, `Component<P>` 타입을 사용합니다.
여기서 `P`는 `props`의 타입이며, [object 타입](https://www.typescriptlang.org/docs/handbook/2/objects.html)이어야 합니다.
이런식으로 알맞은 타입의 props와 속성이 전달되며, Solid에서 렌더링 할 수 있는 값이 반환됩니다: `JSX.Element`는 DOM 노드, `JSX.Element` 배열, `JSX.Element`를 반환하는 함수, boolean, `undefined`/`null` 등과 같은 값이 될 수 있습니다.
여기 몇 가지 예제가 있습니다:

```tsx
const Counter: Component = () => {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
    </button>
  );
};

<Counter/>;              // OK
<Counter initial={5}/>;  // 타입 에러: initial prop이 존재하지 않음
<Counter>hi</Counter>    // 타입 에러: children prop이 존재하지 않음

const InitCounter: Component<{initial: number}> = (props) => {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
    </button>
  );
};

<InitCounter initial={5}/>;  // OK
```

컴포넌트가 JSX 자식을 가지려면, `P`에 명시적으로 `children` 타입을 추가하거나, 자동으로 `children?: JSX.Element`를 추가하는 `ParentComponent` 타입을 사용할 수 있습니다.
또는 컴포넌트를 `const` 대신 `function`으로 선언하려면, `ParentProps` 헬퍼를 사용해 `props` 타입을 설정할 수 있습니다.
예를 들자면:

```tsx
import { JSX, ParentComponent, ParentProps } from 'solid-js';
type ParentProps<P = {}> = P & { children?: JSX.Element };
type ParentComponent<P = {}> = Component<ParentProps<P>>;

// 다음은 이와 동일한 타입입니다:
//const CustomCounter: Component<{children?: JSX.Element}> = ...
//function CustomCounter(props: ParentProps): JSX.Element { ...
const CustomCounter: ParentComponent = (props) => {
  const [count, setCount] = createSignal(0);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>
  );
};

// 다음은 이와 동일한 타입입니다:
//const CustomInitCounter: Component<{initial: number, children?: JSX.Element}> = ...
//function CustomInitCounter(props: ParentProps<{initial: number}>): JSX.Element { ...
const CustomInitCounter: ParentComponent<{initial: number}> = (props) => {
  const [count, setCount] = createSignal(props.initial);
  return (
    <button onClick={() => setCount((c) => c+1)}>
      {count()}
      {props.children}
    </button>
  );
};
```

후자의 경우, `props` 파라미터는 자동으로 `props: ParentProps<{initial: number}>` 타입이 되며, 이는 `props: {initial: number, children?: JSX.Element}`와 동일합니다.
(Solid 1.4 이전에는, `Component`는 `ParentComponent`와 동일했습니다.)

Solid는 `children`을 처리하기 위해 두 가지 다른 `Component` 서브 타입을 제공합니다:

```ts
import {JSX, FlowComponent, FlowProps, VoidComponent, VoidProps} from 'solid-js';
type FlowProps<P = {}, C = JSX.Element> = P & { children: C };
type FlowComponent<P = {}, C = JSX.Element> = Component<FlowProps<P, C>>;
type VoidProps<P = {}> = P & { children?: never };
type VoidComponent<P = {}> = Component<VoidProps<P>>;
```

`VoidComponent`는 `children`을 지원하지 않는 컴포넌트입니다.
`P`가 `children` 타입을 제공하지 않는 경우, `VoidComponent<P>`는 `Component<P>`와 동일합니다.

`FlowComponent`는 Solid의 `<Show>`와 `<For>`와 같은 "흐름 제어" 컴포넌트를 위한 것입니다.
이런 컴포넌트는 일반적으로 `children`이 의미가 있어야 하며, 때로는 `children`이 단일 함수여야 한다는 것과 같은 특정 타입이 있습니다.
예를 들자면:

```tsx
const CallMeMaybe: FlowComponent<{when: boolean}, () => void> = (props) => {
  createEffect(() => {
    if (props.when)
      props.children();
  });
  return <>{props.when ? 'Calling' : 'Not Calling'}</>;
};

<CallMeMaybe when={true}/>;  // 타입 에러: children 미지정
<CallMeMaybe when={true}>hi</CallMeMaybe>;  // 타입 에러: children
<CallMeMaybe when={true}>
  {() => console.log("Here's my number")}
</CallMeMaybe>;              // OK
```

## 이벤트 핸들러

`JSX` 네임스페이스는 HTML DOM 작업에 유용한 타입 모음을 제공합니다.
제공되는 모든 타입들은 [dom-expressions의 JSX 정의](https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/jsx.d.ts)를 참고하세요.

`JSX` 네임스페이스의 유용한 헬퍼 타입 중 하나인 `JSX.EventHandler<T, E>`는 DOM 엘리먼트 타입 `T`와 이벤트 타입 `E`에 대한 단일 인수 이벤트 핸들러를 나타냅니다.
이를 사용해 JSX 외부에서 정의한 이벤트 핸들러 타입을 지정할 수 있습니다.
예를 들어:

```tsx
import type { JSX } from 'solid-js';
const onInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (event) => {
  console.log('input changed to', event.currentTarget.value);
};

<input onInput={onInput}/>
```

[`on___` JSX 속성](https://www.solidjs.com/docs/latest/api#on___)(내장 이벤트 타입) 안에 인라인으로 정의된 핸들러는 자동으로 적절한 `JSX.EventHandler` 타입으로 지정됩니다.

```tsx
<input onInput={(event) => {
  console.log('input changed to', event.currentTarget.value);
}}/>;
```

`JSX.EventHandler<T>`는 이벤트의 [`currentTarget` 속성](https://developer.mozilla.org/en-US/docs/Web/API/Event/currentTarget)을 `T`타입으로 제한합니다(위 코드에서 `event.currentTarget`은 `HTMLInputEvent`타입이며, 여기에는 `value` 속성이 있습니다).
하지만, 이벤트의 [`target` 속성](https://developer.mozilla.org/en-US/docs/Web/API/Event/target)은 모든 `DOMElement`가 될 수 있습니다.
`currentTarget`은 이벤트 핸들러가 연결된 엘리먼트이므로 타입을 알 수 있지만, `target`은 사용자 인터랙션으로 인해 버블된 이벤트이거나, 이벤트 핸들러에 의해 캡처된 이벤트이기 때문에 모든 DOM 엘리먼트가 될 수 있습니다.

## ref 속성

변수와 함께 `ref` 속성을 사용는 경우, Solid는 엘리먼트가 렌더링되면 해당 DOM 엘리먼트를 변수에 할당합니다. 타입스크립트를 사용하지 않는 경우 다음과 같습니다:
```jsx
let divRef;

console.log(divRef); // undefined

onMount(() => {
  console.log(divRef); // <div> 엘리먼트
})

return (
  <div ref={divRef}/>
)
```

이 경우 변수의 타입을 정하기 힘든 문제가 있습니다. `divRef`는 렌더링 후에만 `HTMLDivElement`로 설정되는데, 이를 `HTMLDivElement` 타입으로 해야 할까요? (여기서는 타입스크립트의 `strictNullChecks` 모드가 활성화되어 있다고 가정합니다. 그렇지 않으면, 타입스크립트는 `undefined`가 될 수 있는 변수를 무시합니다.)

타입스크립트에서 가장 안전한 패턴은 `divRef`가 일정 기간동안 `undefined`라는 것을 알고, 사용시에 확인하는 것입니다:

```tsx
let divRef: HTMLDivElement | undefined;

divRef.focus();  // 컴파일시 에러 발생

onMount(() => {
  if (!divRef) return;
  divRef.focus();  // 허용됨
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

또는 `div` 엘리먼트가 렌더링된 후에만 `onMount`가 호출된다는 것을 알고 있기 때문에, `onMount` 내에서 `divRef`에 액세스할 때 [non-null assertion (`!`)](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)을 사용할 수 있습니다.

```tsx
onMount(() => {
  divRef!.focus();
});
```

또 다른 안전한 패턴은 `divRef` 타입에서 `undefined`를 생략하고, `ref` 속성에 
[definite assignment assertion (`!`)](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-7.html#definite-assignment-assertions)을 사용하는 것입니다.

```tsx
let divRef: HTMLDivElement;

divRef.focus();  // 컴파일시 에러 발생

onMount(() => {
  divRef.focus();  // 허용됨
});

return (
  <div ref={divRef!}>
    ...
  </div>
);
```

타입스크립트는 `ref` 속성이 `divRef` 변수로 설정되고, `divRef`가 이미 할당되어 있다고 가정하기 때문에 `ref={divRef!}`를 사용해야 합니다.
Solid에서는 그 반대입니다: `divRef`는 `ref` 속성에 의해 할당됩니다.
`divRef!` 어설션을 사용한 할당 덕분에 타입스크립트는 이 라인 뒤에서 `divRef`가 할당되었다고 확신하게 됩니다.

이 패턴을 사용하면, 타입스크립트는 함수 내에서 정의된 ref를 정의된 JSX 블럭 이전에 사용하는 경우 올바르게 플래그를 지정합니다.
하지만 타입스크립트는 중첩된 함수 내에서 `undefined` 일 수 있는 변수의 사용에 대해서는 플래그를 설정하지 않습니다.
Solid의 컨텍스트에서, `createMemo`, `createRenderEffect`, `createComputed` 내부(ref가 정의된 JSX 블럭 이전)에서는 ref를 사용하지 않도록 주의해야 합니다.
이 함수들은 즉시 실행되기 때문에, 아직 ref가 생성되지 않은 상태이기 때문입니다. 타입스크립트는 이를 에러로 표시하지 않습니다.
반면에 이전 패턴은 이러한 에러를 잡아냅니다.

또 다른 일반적이지만 덜 안전한 패턴은, 변수 선언 시점에 할당 어설션을 사용하는 것입니다.

```tsx
let divRef!: HTMLDivElement;

divRef.focus();  // 컴파일은 성공하지만 에러 발생

onMount(() => {
  divRef.focus();  // OK
});

return (
  <div ref={divRef}>
    ...
  </div>
);
```

이 접근 방식은 해당 변수에 대한 할당 검사를 하지 않기 때문에, 쉬운 해결 방법이기는 하지만 추가적으로 주의가 필요합니다.
특히 이전 패턴과 달리, 중첩된 함수 외부에서도 변수가 할당되기 전에 미리 사용하는 잘못된 사용을 허용합니다.

## 제어 흐름 좁히기

[`<Show>`](https://www.solidjs.com/docs/latest/api#%3Cshow%3E)를 사용해 데이터가 정의된 경우에만 데이터를 표시하는게 일반적인 패턴입니다:

```tsx
const [name, setName] = createSignal<string>();

return (
  <Show when={name()}>
    Hello {name().replace(/\s+/g, '\xa0')}!
  </Show>
);
```

이 경우, 타입스크립트는 2번의 `name()` 함수 호출이 동일한 값을 반환하는지를 알 수 없기 때문에, 첫 번째 호출이 truthy 값을 반환하는 경우에만 두 번째 호출이 일어난다고 결정할 수 없습니다. 따라서 `.replace()`를 호출하려고 할 때, `name()` 값이 `undefined`일 수도 있다고 에러를 냅니다.

이 문제를 해결할 수 있는 2가지 방법이 있습니다:

1. 타입스크립트 [non-null assertion 연산자 `!`](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-)를 사용해 직접 `name()`이 not-null 값을 반환한다고 어설션을 합니다:

   ```tsx
   return (
     <Show when={name()}>
       Hello {name()!.replace(/\s+/g, '\xa0')}!
     </Show>
   );
   ```

2. `when` prop의 값이 truthy인 경우 이 값을 전달하는 하는 `<Show>`의 콜백 형식을 사용합니다:

   ```tsx
   return (
     <Show when={name()}>
       {(n) =>
         <>Hello {n.replace(/\s+/g, '\xa0')}!</>
       }
     </Show>
   );
   ```

   이 경우, `Show` 컴포넌트 타입은 `n` 값이 truthy 라고 타입스크립트에 알려주기 때문에, `undefined`(또는 `null`, `false`) 값이 될 수 없습니다.

   하지만, 이 형식의 `<Show>`는 `name()`이 falsy 에서 truthy 로 변경될 때만 수행하는 것이 아니라 `name()`이 변경될 때마다 자식 전체를 처음부터 다시 렌더링합니다.
   이는 자식 컴포넌트가 세밀한 반응성(변경되지 않는 부분은 재사용하고 변경된 부분만 업데이트)을 충분히 누리지 못하고 있음을 의미합니다.

## 특수 JSX 속성 및 디렉티브

### `on:___`/`oncapture:___`

Solid의 [`on:___`/`oncapture:___` 속성](https://www.solidjs.com/docs/latest/api#on%3A___%2Foncapture%3A___)을 통해 커스텀 핸들러를 사용한다면, `"solid-js"`의 `JSX` 네임스페이스 내에서 `CustomEvents` 와 `CustomCaptureEvents` 인터페이스를 오버라이딩하여 결과 `Event` 객체에 해당하는 타입을 정의해야 합니다.

```tsx
class NameEvent extends CustomEvent {
  type: 'Name';
  detail: {name: string};

  constructor(name: string) {
    super('Name', {detail: {name}});
  }
}

declare module "solid-js" {
  namespace JSX {
    interface CustomEvents { // on:Name
      "Name": NameEvent;
    }
    interface CustomCaptureEvents { // oncapture:Name
      "Name": NameEvent;
    }
  }
}

<div on:Name={(event) => console.log('name is', event.detail.name)}/>
```

### `prop:___`/`attr:___`

Solid의 [`prop:___` 속성](https://www.solidjs.com/docs/latest/api#prop%3A___)을 통해 강제된 프로퍼티를 사용하거나, Solid의 [`attr:___` 속성](https://www.solidjs.com/docs/latest/api#attr%3A___)을 통해 커스텀 속성을 사용하는 경우, `ExplicitProperties` 와 `ExplicitAttributes` 인터페이스에서 각각의 타입을 정의할 수 있습니다:

```tsx
declare module "solid-js" {
  namespace JSX {
    interface ExplicitProperties { // prop:___
      count: number;
      name: string;
    }
    interface ExplicitAttributes { // attr:___
      count: number;
      name: string;
    }
  }
}

<Input prop:name={name()} prop:count={count()}/>
<my-web-component attr:name={name()} attr:count={count()}/>
```

### `use:___`

Solid의 [`use:___` 속성](https://www.solidjs.com/docs/latest/api#use%3A___)에 대한 커스텀 디렉티브를 정의하는 경우, `Directives` 인터페이스에 다음과 같이 타입을 정의할 수 있습니다:

```tsx
function model(element: HTMLInputElement, value: Accessor<Signal<string>>) {
  const [field, setField] = value();
  createRenderEffect(() => (element.value = field()));
  element.addEventListener("input", (e) => setField(e.target.value));
}

declare module "solid-js" {
  namespace JSX {
    interface Directives {  // use:model
      model: Signal<string>;
    }
  }
}

let [name, setName] = createSignal('');

<input type="text" use:model={[name, setName]} />;
```

다른 모듈에 있는 `d` 디렉티브를 `import`하고, `d`가 `use:d` 디렉티브 형식으로만 사용된다고 하면, 타입스크립트(정확히는 [`babel-preset-typescript`](https://babeljs.io/docs/en/babel-preset-typescript))는 기본적으로 `d`를 `import`하는 것을 삭제합니다.
이는 `d`가 타입일 가능성 때문에 타입스크립트가 `use:d`를 `d`에 대한 참조로 확신하지 못하기 때문입니다.
이 문제를 해결하는 방법은 2 가지가 있습니다:

1. [`babel-preset-typescript`의 `onlyRemoveTypeImports: true`](https://babeljs.io/docs/en/babel-preset-typescript#onlyremovetypeimports) 설정 옵션을 사용하게 되면 `import type ...` 으로 타입을 임포트하는 것을 제외한 모든 `import`를 제거하지 않습니다.
`vite-plugin-solid`를 사용하는 경우, `vite.config.ts` 파일에서 `solidPlugin({ typescript: { onlyRemoveTypeImports: true } })` 을 사용해 이 옵션을 설정할 수 있습니다.

  코드 베이스 전체에서 `export type`, `import type`을 주의깊게 사용하지 않으면 이 옵션이 문제가 될 수 있습니다.

2. `d` 디렉티브를 `import`하는 모든 모듈에서 `false && d;` 처럼 페이크 액세스를 추가합니다.
이렇게 하면 타입스크립트가 `d` `import`를 제거하는 것을 방지하고, [Terser](https://terser.org/)를 사용해 트리 쉐이킹을 한다고 가정하면, 코드는 최종 코드 번들에서 빠지게 됩니다.

  `d;` 처럼 보다 간단한 페이크 액세스를 추가하더라도 `import`가 제거되는 것을 방지하지만, 트리 쉐이킹에서 제거되지 않기 때문에 최종 코드 번들에는 포함됩니다.
