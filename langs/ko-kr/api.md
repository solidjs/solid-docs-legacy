---
title: API
description: Description of all of Solid's API
sort: 0
---

# 기본 반응성

솔리드의 반응성에 대한 모든 접근은 함수의 반응형 계산을 감싸고, 디펜던시가 업데이트되었을 때 함수를 다시 실행하는 것입니다.
솔리드의 JSX 컴파일러 또한 대부분의 JSX 문법 (괄호 안의 코드)을 함수와 함께 감쌈으로써 종속성이 변경되었을 때 자동으로 업데이트(해당 돔 업데이트를 실행) 하게 합니다.
좀 더 자세하게 말하면, 함수의 자동 재실행은 함수가 JSX 문법과 같은 _tracking scope_ 안에서 호출되거나, API가 빌드 수행(`createEffect`, `createMemo`, 등.)을 호출할 때 발생합니다.
기본적으로, 함수의 종속성은 추적 스코프 안에서 실행될 때, 함수가 반응형 state(e.g. Signal getter 혹은 Store attribute)를 읽어들일 때 자동으로 추적됩니다.
결과적으로, 일반적으로 종속성에 대해서 걱정할 필요가 없습니다.
(하지만 만약 자동 종속성 추적이 당신이 원하는 결과를 만들지 않는다면,[종속성 추적 재정의](#reactive-utilities)를 할 수 있습니다.)
이러한 방식은 반응형을 _구성가능_ 하게 만듭니다. :다른 함수 내에서 하나의 함수를 호출하는 것은 일반적으로 호출된 함수의 의존성을 상속하게 한다.

## `createSignal`

```ts
export function createSignal<T>(
  initialValue: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): [get: () => T, set: (v: T) => T];
```

Signal은 반응형의 가장 기본입니다. 시간 경과에 따라 변경되는 단일 값(JavaScript 개체일 수 있는)을 추적합니다.
Signal의 값은 처음에는 전달된 첫 번째 인자 `initialValue` (혹은 인자가 없다면 `undefined`)의 값을 가지게 됩니다.
`createSignal` 함수는 두 개의 함수로 이루어진 배열을 반환합니다.: _getter_ (혹은 _accessor_) 과 _setter_
일반적으로, 다음과 같이 배열을 이름 지어진 Signal로 비구조화 할당하여 사용합니다.

```js
const [count, setCount] = createSignal(0);
const [ready, setReady] = createSignal(false);
```

getter 를 호출하면(e.g., `count()` 혹은 `ready()`)
Signal 의 현재 값을 반환합니다.
자동 종속성 추적에 중요한 건, getter를 추적 스코프 내에서 실행하여 실행 함수가 Signal에 종속되도록 하는 것입니다. 그리하여 함수는 Signal이 업데이트되었을 때 재실행되게 됩니다.

setter를 호출하면 (e.g., `setCount(nextCount)` or `setReady(nextReady)`)
Signal 의 값을 설정하고 Signal을 _업데이트_ 합니다.
(재실행 하도록 종속 항목들을 트리거링)
만약 값이 실제로 변경되면(아래 세부사항을 참조).
유일한 인수로서, 세터는 시그널에 대한 새로운 값 또는 시그널의 마지막 값을 새로운 값으로 매핑하는 함수를 가지게 됩니다.
또한 setter는 업데이트된 값을 반환합니다. 예:

```js
// signal의 현재값을 읽고,
// 추적 스코프 안에 있다면 signal에 종속된다.
// (하지만 추적 스코프 밖에선 반응하지 않는다):
const currentCount = count();

// 혹은 실행을 함수로 감싼다,
// 이 함수는 추적 스포프 안에서 사용될 수 있다:
const doubledCount = () => 2 * count();

// 혹은 추적 스코프를 구성하고 signal에 종속된다:
const countDisplay = <div>{count()}</div>;

// 주어진 값으로 signal을 기록한다:
setReady(true);

// 주어진 setter 함수로 signal을 기록한다:
const newCount = setCount((prev) => prev + 1);
```

> Signal에 함수를 저장하길 원한다면 함수 형태를 사용해야 합니다:
>
> ```js
> setValue(() => myFunction);
> ```
>
> 하지만, 함수는 `initialValue` 인자로 취급되지않는다.
> `createSignal`을 사용하기 위해서, 따라서 함수의 초기값을 그대로 전달해야 합니다:
>
> ```js
> const [func, setFunc] = createSignal(myFunction);
> ```

[batch](#batch), [effect](#createEffect), 혹은
[transition](#use-transition), 안에 있지 않다면 signal 은 설정 시 즉시 업데이트됩니다.
예:

```js
setReady(false);
console.assert(ready() === false);
setReady(true);
console.assert(ready() === true);
```

batch 나 transition 안에서 실행할지 확실하지 않다면
(e.g., library code), 이러한 가정을 만드는 걸 피해야 합니다.

##### Options

솔리드의 여러 기본요소들은 마지막 인자로 "options" 객체를 가집니다.

`createSignal`의 options 객체는`equals` 옵션을 사용하도록 할 수 있습니다. 예:

```js
const [getValue, setValue] = createSignal(initialValue, { equals: false });
```

기본적으로, signal의 setter를 호출할 때, 자바스크립트의 `===` 연산자에 따라 이전 값과 새 값이 다르다면 업데이트(종속 항목들을 재실행)만합니다.

또는, `equals` 를 `false` 로 두어 setter가 호출 된 후 종속 항목들이 재실행하게 할 수 있고, 동일성 테스트를 위해 함수를 전달할 수 있습니다.
몇가지 예:

```js
// 객체 내부 수정을 위해 { equals: false } 사용;
// 일반적으로 이것은 업데이트로 보이지 않는데
// 이것은 객체가 전과 후의 변화가 같은 특성을 가지기 때문이다.
const [object, setObject] = createSignal({ count: 0 }, { equals: false });
setObject((current) => {
  current.count += 1;
  current.updated = new Date();
  return current;
});

// { equals: false } 값이 없이 signal을 트리거로 사용:
const [depend, rerun] = createSignal(undefined, { equals: false });
// 이제 depend()를 추적 스코프 내에서 실행
// rerun() 이 호출될 때마다 스코프가 재실행되게 만든다.

// equality를 문자열의 길이에 맞춰 정의:
const [myString, setMyString] = createSignal("string", {
  equals: (newVal, oldVal) => newVal.length === oldVal.length,
});

setMyString("strung"); // 새 값이 동일하게 여겨져 업데이트가 되지 않는다.
setMyString("stranger"); // 다르게 여겨져 업데이트된다.
```

## `createEffect`

```ts
export function createEffect<T>(fn: (v: T) => T, value?: T): void;
```

Effect는 종속성이 변경될 때마다 코드를 실행할 수 있도록 만들 수 있는 일반적인 방법이다.
`createEffect`는 주어진 함수를 실행하는 새로운 계산을 만들고, 추적 범위에서 자동으로 의존성을 추적합니다.
그리고 종속성이 업데이트될 때마다 기능을 자동으로 함수를 재실행합니다.
예:

```js
const [a, setA] = createSignal(initialValue);

// 'a'에 종속적인 effect
createEffect(() => doSideEffect(a()));
```

effect 함수는 effect 함수들의 마지막 실행된 값 혹은 첫 번째 호출된 값,
`createEffect` 옵션인 두 번째 인자와 함께 호출됩니다.
이것은 마지막으로 계산된 값을 기억하기 위한 새로운 클로저를 만들지 않고 차이를 계산하도록 해줍니다.
예:

```js
createEffect((prev) => {
  const sum = a() + b();
  if (sum !== prev) console.log("sum changed to", sum);
  return sum;
}, 0);
```

effect 함수는 자동으로 [`batch`](#batch) 에 감싸집니다.
이것은 effect 안의 모든 시그널 변화는 effect가 종료된 후에 전파됨을 의미합니다.
이것은 하나의 업데이트를 시작하는 동안에 다수의 시그널을 업데이트할 수 있게 하고, 사이드 이펙트들의 중간에 발생한 원하지 않는 사이드이펙트들을 피하게 해줍니다.

effect 함수의 _첫 번째_ 실행 은 즉시 이루어지지 않습니다.
[`마이크로 태스크 큐`](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)에 의해 현재의 동기 작업이 실행된후에 스케줄링됩니다.
첫 번째 실행이 발생할 때까지 기다리기를 원한다면 `마이크로 태스크 큐`(렌더 이전에 실행되는)을 사용하거나, `await Promise.resolve()` 혹은 `setTimeout(..., 0)`(렌더 이후에 실행되는)을 사용하면 됩니다.
첫 번째 실행 이후에, ettect는 일반적으로 종속성이 업데이트될 때 즉시 실행됩니다.([batch](#batch) 혹은 [transition](#use-transition) 안에 있지 않다면)
예:

```js
const [count, setCount] = createSignal(0);

// 이 effect는 count를 시작과 변화할 때 출력합니다.
createEffect(() => console.log("count =", count()));
// effect는 아직 실행되지 않는다.
console.log("hello");
setCount(1); // effect는 아직 실행되지 않습니다.
setCount(2); // effect는 아직 실행되지않습니다.

queueMicrotask(() => {
  // 이제 `count = 2`가 출력됩니다.
  console.log("microtask");
  setCount(3); //즉시 `count = 3`을 출력합니다
  console.log("goodbye");
});

// --- 전체 출력: ---
// hello
// count = 2
// microtask
// count = 3
// goodbye
```

이러한 첫 실행에서 지연은 다음을 의미하기 때문에 유용합니다. 컴포넌트에 의해 반환된 JSX가 DOM에 추가된 이후에 컴포넌트 스코프 안에 선언된 effect가 실행됩니다.
특히, [`ref`s](#ref) 는 이미 설정됩니다.
따라서 effect를 사용하여 DOM을 직접 조작하거나, 바닐라 자바스크립트 라이브러리 혹은 다른 사이드 이펙트들을 호출할 수 있습니다.

브라우저가 돔을 화면에 렌더링 하기 이전에 실행된 effect의 첫 번째 실행은 계속해서 실행됩니다(리액트의 `createLayoutEffect`와 비슷한).
렌더링 후까지 기다려야 하는 경우(예: 렌더링 측정),
`await Promise.resolve()`를 사용할 수 있습니다.(혹은 `Promise.resolve().then(...)`)
하지만 반응형 state의 사용 이후에(예: 시그널) 추적이 아닌 경우, effect는 재실행을 위해 실행되지 않습니다 `async` 와 `await`사용 이후에 가능합니다.
따라서 promise 이전에 모든 종속성을 사용해야 합니다.

첫 번째 실행임에도 effect를 즉시 실행하길 원한다면, [`createComputed`](#createcomputed)를 사용하면 됩니다.

effect 함수 _내부에서_ [`onCleanup`](#oncleanup) 호출하는 것으로 effect 함수들의 실행 사이의 사이드 이펙트를 제거할 수 있습니다.
cleanup 함수는 effect 실행과 effect 처리 사이에 실행됩니다.(예: 컴포넌트 언마운트를 포함)
예:

```js
// eventName 시그널에 의해 동적으로 제공되는 이벤트 수신
createEffect(() => {
  const event = eventName();
  const callback = (e) => console.log(e);
  ref.addEventListener(event, callback);
  onCleanup(() => ref.removeEventListener(event, callback));
});
```

## `createMemo`

```ts
export function createMemo<T>(
  fn: (v: T) => T,
  value?: T,
  options?: { equals?: false | ((prev: T, next: T) => boolean) }
): () => T;
```

Memo는 여러 다른 반응형 계산에서 얻은 값을 종속성으로 효과적으로 재사용할 수 있습니다.
`createMemo`는 즉시 호출되고 실행된 코드의 종속성이 업데이트될 때마다 호출되는 함수의 반환값과 같은 읽기 전용 시그널을 생성합니다.
이것은 시그널을 위한 getter를 반환합니다.

```js
const value = createMemo(() => computeExpensiveValue(a(), b()));

// 값 읽기
value();
```

솔리드에서는 종종 함수들을 memo로 감쌀 필요가 없습니다;
반응형과 비슷한 행동을 위해 정규 표현식을 선언하거나 호출하는 것으로 대체 가능합니다.
주요 차이점은 여러 반응형 환경에서 함수를 호출할 때입니다.
이러한 경우에는, 함수의 종속성이 업데이트되었을 때 함수는 `createMemo`로 감사지지 않는다면 여러 번 호출됩니다.
예:

```js
const user = createMemo(() => searchForUser(username()));
// 다음과 비교: const user = () => searchForUser(username());
return (
  <ul>
  <li>Your name is "{user()?.name}"</li>
  <li>Your email is <code>{user()?.email}</code></li>
  </div>
);
```

`username` 시그널이 업데이트될 때, `searchForUser`는 `user` memo를 업데이트하기 위해 한번 호출됩니다. 그리고, 두 개의 리스트 아이템들은 자동으로 업데이트됩니다(반환된 user가 실제로 변경되었다면).
만약 `user`를 일반 함수로 정의한다면 `() => searchForUser(username())`, 리스트 아이템을 한번 업데이트할 때마다 `searchForUser` 는 두 번 호출됩니다.

다른 주요 차이점은 memo는 memo의 종속성이 변화되었지만 memo의 값은 변경되지 않았을 때의 업데이트로부터 종속 항목을 보호할 수 있습니다.
[`createSignal`](#createsignal) 처럼, `createMemo`에 의해 만들어진 시그널은 자바스크립트의 `===` 연산자에 따라 memo 함수가 이전 값으로부터 실제로 변경되어 값을 반환했을 때 업데이트됩니다(그리고 재실행을 위해 종속 항목을 트리거링).
또는, memo의 종속성이 변경되었을 때 항상 업데이트하도록 옵션 객체의 `equals` 값을 `false`로 전달하거나, 자신만의 `equals` 함수를 동일성 비교를 위해 전달할 수 있습니다.

memo 함수는 memo 함수의 마지막 실행 혹은 첫번째 호출로 부터 반환된 값과 같은 인자와 함께 호출됩니다. `createMemo`의 두번째 인자와 같은
이것은 계산을 줄이는데 유용합니다
예:

```js
// 업데이트 시 input() 으로부터의  모든 값의 합을 추적한다
const sum = createMemo((prev) => input() + prev, 0);
```

memo 함수는 setter 함수를 호출하여 다른 시그널을 변경해서는 안 됩니다("순수"해야 합니다).
이는 솔리드가 종속석 그래프에 따른 memo 업데이트들의 실행 순서를 최적화하게 해줍니다. 그리하여 모든 memo는 종속성 변화에 대부분 한 번에 업데이트가 가능하게 합니다.

## `createResource`

```ts
type ResourceReturn<T> = [
  {
    (): T | undefined;
    loading: boolean;
    error: any;
  },
  {
    mutate: (v: T | undefined) => T | undefined;
    refetch: (info: unknown) => Promise<T> | T;
  }
];

export function createResource<T, U = true>(
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;

export function createResource<T, U>(
  source: U | false | null | (() => U | false | null),
  fetcher: (
    k: U,
    info: { value: T | undefined; refetching: boolean | unknown }
  ) => T | Promise<T>,
  options?: { initialValue?: T }
): ResourceReturn<T>;
```

비동기 요청 결과를 반영하여 시그널을 만듭니다.

`createResource`는 비동기 fetcher 함수를 받고 fetcher 완료 시 결과 데이터로 업데이트되는 시그널을 반환합니다.

`createResource`를 사용하는 두 가지 방법이 있습니다. 즉, fetcher 함수를 유일한 인자로 전달하거나 소스 시그널을 첫 번째 인자로 추가로 전달할 수 있습니다. 원래의 시그널은 변경될 때마다 피처를 재트리거하고 해당 값은 fetcher에게 전달됩니다.

```js
const [data, { mutate, refetch }] = createResource(fetchData);
```

```js
const [data, { mutate, refetch }] = createResource(sourceSignal, fetchData);
```

이 스니펫에서 fetcher는 `fetchData` 함수이다. 두 경우 모두 `fetchData`의 resolving이 완료될 때까지 `data()`는 undefined가 됩니다. 첫 번째 경우 'fetchData'가 즉시 호출됩니다.
두 번째로는 `sourceSignal`이 `false`, `null`, `undefined` 이외의 값을 갖는 즉시 `fetchData`를 호출한다.
`sourceSignal`의 값이 변경될 때마다 다시 호출되며, 첫 번째 인수로 항상 `fetchData`에 전달됩니다.

어느 쪽이든 `mutate`를 호출하여 `data` 시그널을 직접 업데이트할 수 있습니다(다른 시그널 setter와 마찬가지로 작동함). 또한 `refetch`를 호출하여 fetcher를 직접 실행하고 선택적 인수를 전달하여 fetcher에 `refetch(info)` 정보를 제공할 수 있습니다.

`data`는 일반 신호 getter처럼 작동합니다. `data()`를 사용하여 마지막으로 반환된 `fetchData` 값을 읽습니다.
그러나 `data.loading`은 fetcher가 호출되었지만 반환되지 않았는지 알려주고, `data.error` 는 요청이 에러가 발생했는지 알려준다.
그런 경우, fetcher에서 발생한 오류가 포함됩니다(참고: 오류가 예상되면 [ErrorBoundary](#<errorboundary>)에서 `createResource`를 감쌀수 있습니다).

`loading`과 `error`는 반응성 게터이며 추적이 가능합니다.

`fetcher`는 실제로 데이터를 가져오기 위해 `createResource`에 제공하는 비동기 함수입니다.
source 시그널의 값(제공된 경우)과 `value`과 `refetching`의 두 가지 속성을 가진 정보 객체 두 개의 인수를 전달합니다. 'value'는 이전에 가져온 값을 알려줍니다.
refetching은 refetch' 함수를 사용하여 petcher를 트리거한 경우 true이고 그렇지 않은 경우 false입니다.
'refetch' 함수가 인수('refetch(info)'와 함께 호출된 경우 'refetching'은 해당 인수로 설정됩니다.

```js
async function fetchData(source, { value, refetching }) {
  // 데이터를 가져와 값을 반환합니다.
  //`source`는 원래 신호의 현재 값을 알려줍니다.
  //`value`는 fetcher의 마지막으로 반환된 값을 나타냅니다.
  //`refetching`는 `refetch()`의 호출에 의해 트리거링되었을 때 true입니다.
  // 혹은 선택적으로 전달된 `refetch(info)` 값과 같습니다.
}

const [data, { mutate, refetch }] = createResource(getQuery, fetchData);

// 값을 읽음
data();

// 로딩중인지 확인
data.loading;

// 에러가 발생했는지 확인
data.error;

// promise를 생성하지 않고 값을 직접 설정
mutate(optimisticValue);

// 명시적으로 마지막 요청을 재요청
refetch();
```

# Lifecycles

## `onMount`

```ts
export function onMount(fn: () => void): void;
```

초기 렌더 되고, 요소가 마운트 된 이후에 실행하는 메서드를 등록합니다. `ref`를 사용하고 다른 일회성 사이드 이펙트를 관리하는 데 적합합니다. 이것은 의존성이 없는 `createEffect`와 동일합니다.

## `onCleanup`

```ts
export function onCleanup(fn: () => void): void;
```

현재 유효 스코프를 제거 또는 재계산할 때 실행되는 cleanup 메서드를 등록합니다. 모든 컴포넌트 또는 Effect에 사용할 수 있습니다.

## `onError`

```ts
export function onError(fn: (err: any) => void): void;
```

자식 스코프에서 에러가 발생할 때 실행되는 에러 헨들러 메서드를 등록합니다. 가장 가까운 스코프 에러 핸들러만 실행됩니다. 라인을 트리거링하기 위해 Rethrow 합니다.

# Reactive Utilities

이러한 헬퍼들은 더 나은 스케줄 업데이트와 반응성이 어떻게 추적되는지 관리하는 기능을 제공합니다.

## `untrack`

```ts
export function untrack<T>(fn: () => T): T;
```

실행 중인 코드 블록의 종속성 추적을 무시하고 값을 반환합니다.

## `batch`

```ts
export function batch<T>(fn: () => T): T;
```

불필요한 재계산을 방지하기 위해 블록 내에서 약속된 업데이트를 기다립니다. 이는 다음 줄의 읽어들인 값이 아직 업데이트되지 않았다는 것을 의미합니다. [Solid Store](#creatorore)의 set 메서드와 이펙트는 자동으로 코드를 batch 안에 감쌉니다.

## `on`

```ts
export function on<T extends Array<() => any> | (() => any), U>(
  deps: T,
  fn: (input: T, prevInput: T, prevValue?: U) => U,
  options: { defer?: boolean } = {}
): (prevValue?: U) => U | undefined;
```

`on`은 의존성을 명시하기 위해 계산으로 전달되도록 설계되었다. 종속성 배열이 전달되면, `input`과 `prevInput`은 배열이다.

```js
createEffect(on(a, (v) => console.log(v, b())));

// 다음과 같다:
createEffect(() => {
  const v = a();
  untrack(() => console.log(v, b()));
});
```

또한 계산을 즉시 실행하지않고 defer 옵션을 true로 설정하여 변경 시에만 실행되도록 선택할 수 있습니다.

```js
// 즉시 실행되지 않는다
createEffect(on(a, (v) => console.log(v), { defer: true }));

setA("new"); // 이제 실행된다.
```

## `createRoot`

```ts
export function createRoot<T>(fn: (dispose: () => void) => T): T;
```

추적되지 않는 새 소유자 범위를 만듭니다. 이는 부모 항목이 재평가될 때 해제하지 않으려는 중첩된 반응형 스코프에 유용합니다.

모든 솔리드 코드는 모든 메모리/컴퓨팅의 여유 공간을 보장하기 위해 이러한 최상위 수준 중 하나로 래핑되어야 합니다. 모든 `render` 엔트리 함수에 `createRoot`가 내장되어 있으므로 일반적으로 걱정할 필요가 없습니다.

## `getOwner`

```ts
export function getOwner(): Owner;
```

현재 실행 중인 코드를 소유하는 반응 범위를 가져옵니다(예:
현재 범위를 벗어난 `runWithOwner`에 대한 호출을 나중에 전달합니다.

내부적으로 계산(effects, memos 등)은
소유자의 자식부터 `createRoot` 또는 `render` 에 의해 생성된 루트 소유자까지 해당되는 소유자를 만듭니다.
특히 이 소유권 트리는 Solid가 자동으로 하위 트리를 순회하여 처리된 계산을 청소하고 [`onCleanup`](#oncleanup) 콜백을 모두 호출합니다.
예를 들어, `createEffect`의 의존성이 변경되면, effect는 effect 함수를 다시 실행하기 전 모든 자손의 `onCleanup` 콜백을 호출합니다.
`getOwner`를 호출하면 현재 실행 블록을 처리하는 현재 소유자 노드가 반환됩니다.

컴포넌트는 계산이 아니므로 소유자 노드를 생성하지 않습니다.
하지만 일반적으로 `createEffect`에서 렌더링되며 다음과 컴포넌트가 언마운트되면 모든 자손의 `onCleanup` 콜백이 호출되는 것과 유사합니다.
컴포넌트 스코프에서 `getOwner`를 호출하면 해당 컴포넌트의 렌더링과 언마운트를 담당하는 소유자를 반환합니다.

반응형 스코프를 소유하는것은 필요한 _추적_ 이 아닙니다.
예로, [`untrack`](#untrack)은 함수의 중간에 컴포넌트가 JSX(`<Component ...>`)에 의해 생성되는 중에는(새로운 반응 스코프를 만들지 않고) 추적을 종료합니다.

## `runWithOwner`

```ts
export function runWithOwner<T>(owner: Owner, fn: (() => void) => T): T;
```

외부 범위의 소유자 대신 제공된 소유자 아래에서 지정된 함수를 실행합니다. 기본적으로 `createEffect`, `createMemo` 등으로 생성된 계산은 현재 실행 중인 코드의 소유자(`getOwner`의 반환 값)가 소유하므로 특히 소유자가 소유할 때 삭제된다.
`runWithOwner`를 호출하면 이 기본값을 수동으로 지정한 소유자(일반적으로 이전 호출의 반환 값)로 재정의할 수 있습니다.
'Get Owner'), 연산 처리 시기를 보다 정확하게 제어할 수 있습니다.

올바른 소유자를 갖는 것은 두 가지 이유로 중요합니다:

- 소유자가 없는 계산은 정리할 수 없습니다. 예를 들어 소유자 없이 `createEffect`를 소유가 없이 호출하게 되면(예: 글로벌 범위에서), effect는 소유자가 사라질때 사라지지 않고 영원히 실행됩니다.
- [`useContext`](#usecontext)는 원하는 컨텍스트를 제공하는 가장 가까운 조상을 찾기 위해 소유자 트리를 따라 올라가서 컨텍스트를 얻습니다. 따라서 소유자가 없으면 제공된 컨텍스트를 조회할 수 없습니다. 잘못된 소유자를 사용하면 잘못된 컨텍스트를 얻을 수 있습니다.

소유자를 수동으로 설정하면 소유자 범위 밖에서 반응성을 수행할 때 특히 유용합니다. 특히 비동기 연산(`async` 함수나 `setTimeout`과 같은 콜백을 통해)은 자동으로 설정된 소유자를 잃기 때문에 `getOwner`를 통해 원래 소유자를 기억하고 `runWithOwner`를 통해 복원해야 한다.
예:

```js
const owner = getOwner();
setTimeout(() => {
  // 콕백은 소유자 없이 실행됩니다.
  // runWithOwner를 통해 소유자를 복원합니다:
  runWithOwner(owner, () => {
    const foo = useContext(FooContext);
    createEffect(() => {
      console.log(foo);
    });
  });
}, 1000);
```

소유자가 종속성 추적을 결정하는 것이 아니므로 `runWithOwner`는 비동기 함수에서의 추적을 돕지 않으며, 비동기 부분에서의 반응하는 state의 사용(예: 첫 번째 'await' 이후)은 종속성으로 추적되지 않습니다.

## `mergeProps`

```ts
export function mergeProps(...sources: any): any;
```

반응성 객체 `merge` 메서드는 호출자가 props를 제공하지 않는 경우 컴포넌트의 기본 props를 설정하는 데 유용합니다. 또는 반응형 속성을 포함하는 props 객체를 복제합니다.

이 메서드는 프록시를 사용하고 속성들을 역순으로 확인하는 방식으로 작동합니다. 이렇게 하면 prop 객체가 처음 병합될 때 존재하지 않는 속성을 동적으로 추적할 수 있습니다.

```js
// 기본 props
props = mergeProps({ name: "Smith" }, props);

// props 복제
newProps = mergeProps(props);

// props 병합
props = mergeProps(props, otherProps);
```

## `splitProps`

```ts
export function splitProps<T>(
  props: T,
  ...keys: Array<(keyof T)[]>
): [...parts: Partial<T>];
```

반응형 객체를 키별로 분할합니다.
반응하는 개체와 원하는 수의 키 배열이 필요합니다. 각 키 배열에 대해 원래 개체의 속성만 가진 활성 개체를 반환합니다. 반환된 배열의 마지막 유효 객체는 원래 객체의 남은 속성을 가집니다.

이 기능은 props의 일부를 소비하고 나머지를 자식에게 전달하려는 경우에 유용할 수 있습니다.

```js
const [local, others] = splitProps(props, ["children"]);

<>
  <Child {...others} />
  <div>{local.children}<div>
</>
```

## `useTransition`

```ts
export function useTransition(): [
  pending: () => boolean,
  startTransition: (fn: () => void) => Promise<void>
];
```

트랜잭션에서 모든 비동기 프로세스가 완료될 때까지 커밋을 연기하는 비동기 업데이트를 일괄 처리하는 데 사용됩니다.이것은 서스펜스에 묶여 있고 서스펜스 경계에서 읽은 리소스만 추적합니다.

```js
const [isPending, start] = useTransition();

// 트랜지션 중인지 확인
isPending();

// 트랜지션으로 묶음
start(() => setSignal(newValue), () => /* transition is done */)
```

## `startTransition`

**New in v1.1.0**

```ts
export function startTransition: (fn: () => void) => Promise<void>;
```

관련된 보류 state가 없다는 점을 제외하고는 `useTransition`과 유사합니다. 이 방법을 사용하여 Transition을 바로 시작할 수 있습니다.

## `observable`

```ts
export function observable<T>(input: () => T): Observable<T>;
```

이 방법은 신호를 취하여 간단한 옵저버를 생성합니다. 일반적으로 `from` 연산자를 사용하여 선택한 관찰 가능 라이브러리에서 이 연산자를 사용합니다.

```js
import { from } from "rxjs";

const [s, set] = createSignal(0);

const obsv$ = from(observable(s));

obsv$.subscribe((v) => console.log(v));
```

## `from`

**New in v1.1.0**

```ts
export function from<T>(
  producer:
    | ((setter: (v: T) => T) => () => void)
    | {
        subscribe: (
          fn: (v: T) => void
        ) => (() => void) | { unsubscribe: () => void };
      }
): () => T;
```

A simple helper to make it easier to interopt with external producers like RxJS observables or with Svelte Stores. This basically turns any subscribable (object with a `subscribe` method) into a Signal and manages subscription and disposal.

```js
const signal = from(obsv$);
```

It can also take a custom producer function where the function is passed a setter function returns a unsubscribe function:

```js
const clock = from((set) => {
  const t = setInterval(() => set(1), 1000);
  return () => clearInterval(t);
});
```

> Note: Signals created by `from` have equality checks turned off to interface better with external streams and sources.

## `mapArray`

```ts
export function mapArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: T, i: () => number) => U
): () => U[];
```

Reactive map helper that caches each item by reference to reduce unnecessary mapping on updates. It only runs the mapping function once per value and then moves or removes it as needed. The index argument is a signal. The map function itself is not tracking.

Underlying helper for the `<For>` control flow.

```js
const mapped = mapArray(source, (model) => {
  const [name, setName] = createSignal(model.name);
  const [description, setDescription] = createSignal(model.description);

  return {
    id: model.id,
    get name() {
      return name();
    },
    get description() {
      return description();
    }
    setName,
    setDescription
  }
});
```

## `indexArray`

```ts
export function indexArray<T, U>(
  list: () => readonly T[],
  mapFn: (v: () => T, i: number) => U
): () => U[];
```

Similar to `mapArray` except it maps by index. The item is a signal and the index is now the constant.

Underlying helper for the `<Index>` control flow.

```js
const mapped = indexArray(source, (model) => {
  return {
    get id() {
      return model().id
    }
    get firstInitial() {
      return model().firstName[0];
    },
    get fullName() {
      return `${model().firstName} ${model().lastName}`;
    },
  }
});
```

# Stores

These APIs are available at `solid-js/store`. They allow the creation of stores: [proxy objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) that allow a tree of signals to be independently tracked and modified.

## Using Stores

### `createStore`

```ts
export function createStore<T extends StoreNode>(
  state: T | Store<T>
): [get: Store<T>, set: SetStoreFunction<T>];
```

The create function takes an initial state, wraps it in a store, and returns a readonly proxy object and a setter function.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore(initialValue);

// read value
state.someValue;

// set value
setState({ merge: "thisValue" });

setState("path", "to", "value", newValue);
```

As proxies, store objects only track when a property is accessed.

When nested objects are accessed, stores will produce nested store objects, and this applies all the way down the tree. However, this only applies to arrays and plain objects. Classes are not wrapped, so objects like `Date`, `HTMLElement`, `RegExp`, `Map`, `Set` won't be granularly reactive as properties on a store.

The top level state object cannot be tracked, so put any lists on a key of state rather than using the state object itself.

```js
// put the list as a key on the state object
const [state, setState] = createStore({ list: [] });

// access the `list` property on the state object
<For each={state.list}>{item => /*...*/}</For>
```

### Getters

Store objects support the use of getters to store calculated values.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
});
```

These are simple getters, so you still need to use a memo if you want to cache a value:

```js
let fullName;
const [state, setState] = createStore({
  user: {
    firstName: "John",
    lastName: "Smith",
    get fullName() {
      return fullName();
    },
  },
});
fullName = createMemo(() => `${state.user.firstName} ${state.user.lastName}`);
```

### Updating Stores

Changes can take the form of function that passes previous state and returns new state or a value. Objects are always shallowly merged. Set values to `undefined` to delete them from the Store.

```js
import { createStore } from "solid-js/store";
const [state, setState] = createStore({
  firstName: "John",
  lastName: "Miller",
});

setState({ firstName: "Johnny", middleName: "Lee" });
// ({ firstName: 'Johnny', middleName: 'Lee', lastName: 'Miller' })

setState((state) => ({ preferredName: state.firstName, lastName: "Milner" }));
// ({ firstName: 'Johnny', preferredName: 'Johnny', middleName: 'Lee', lastName: 'Milner' })
```

It supports paths including key arrays, object ranges, and filter functions.

setState also supports nested setting where you can indicate the path to the change. When nested the state you are updating may be other non Object values. Objects are still merged but other values (including Arrays) are replaced.

```js
const [state, setState] = createStore({
  counter: 2,
  list: [
    { id: 23, title: 'Birds' }
    { id: 27, title: 'Fish' }
  ]
});

setState('counter', c => c + 1);
setState('list', l => [...l, {id: 43, title: 'Marsupials'}]);
setState('list', 2, 'read', true);
// {
//   counter: 3,
//   list: [
//     { id: 23, title: 'Birds' }
//     { id: 27, title: 'Fish' }
//     { id: 43, title: 'Marsupials', read: true }
//   ]
// }
```

Path can be string keys, array of keys, iterating objects ({from, to, by}), or filter functions. This gives incredible expressive power to describe state changes.

```js
const [state, setState] = createStore({
  todos: [
    { task: 'Finish work', completed: false }
    { task: 'Go grocery shopping', completed: false }
    { task: 'Make dinner', completed: false }
  ]
});

setState('todos', [0, 2], 'completed', true);
// {
//   todos: [
//     { task: 'Finish work', completed: true }
//     { task: 'Go grocery shopping', completed: false }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', { from: 0, to: 1 }, 'completed', c => !c);
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping', completed: true }
//     { task: 'Make dinner', completed: true }
//   ]
// }

setState('todos', todo => todo.completed, 'task', t => t + '!')
// {
//   todos: [
//     { task: 'Finish work', completed: false }
//     { task: 'Go grocery shopping!', completed: true }
//     { task: 'Make dinner!', completed: true }
//   ]
// }

setState('todos', {}, todo => ({ marked: true, completed: !todo.completed }))
// {
//   todos: [
//     { task: 'Finish work', completed: true, marked: true }
//     { task: 'Go grocery shopping!', completed: false, marked: true }
//     { task: 'Make dinner!', completed: false, marked: true }
//   ]
// }
```

## Store Utilities

### `produce`

```ts
export function produce<T>(
  fn: (state: T) => void
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Immer inspired API for Solid's Store objects that allows for localized mutation.

```js
setState(
  produce((s) => {
    s.user.name = "Frank";
    s.list.push("Pencil Crayon");
  })
);
```

### `reconcile`

```ts
export function reconcile<T>(
  value: T | Store<T>,
  options?: {
    key?: string | null;
    merge?: boolean;
  } = { key: "id" }
): (
  state: T extends NotWrappable ? T : Store<T>
) => T extends NotWrappable ? T : Store<T>;
```

Diffs data changes when we can't apply granular updates. Useful for when dealing with immutable data from stores or large API responses.

The key is used when available to match items. By default `merge` false does referential checks where possible to determine equality and replaces where items are not referentially equal. `merge` true pushes all diffing to the leaves and effectively morphs the previous data to the new value.

```js
// subscribing to an observable
const unsubscribe = store.subscribe(({ todos }) => (
  setState('todos', reconcile(todos)));
);
onCleanup(() => unsubscribe());
```

### `unwrap`

```ts
export function unwrap(store: Store<T>): T;
```

Returns the underlying data in the store without a proxy.

### `createMutable`

```ts
export function createMutable<T extends StoreNode>(
  state: T | Store<T>,
): Store<T> {
```

Creates a new mutable Store proxy object. Stores only trigger updates on values changing. Tracking is done by intercepting property access and automatically tracks deep nesting via proxy.

Useful for integrating external systems or as a compatibility layer with MobX/Vue.

> **Note:** A mutable state can be passed around and mutated anywhere, which can make it harder to follow and easier to break unidirectional flow. It is generally recommended to use `createStore` instead. The `produce` modifier can give many of the same benefits without any of the downsides.

```js
const state = createMutable(initialValue);

// read value
state.someValue;

// set value
state.someValue = 5;

state.list.push(anotherValue);
```

Mutables support setters along with getters.

```js
const user = createMutable({
  firstName: "John",
  lastName: "Smith",
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  },
  set fullName(value) {
    [this.firstName, this.lastName] = value.split(" ");
  },
});
```

# Component APIs

## `createContext`

```ts
interface Context<T> {
  id: symbol;
  Provider: (props: { value: T; children: any }) => any;
  defaultValue: T;
}
export function createContext<T>(defaultValue?: T): Context<T | undefined>;
```

Context provides a form of dependency injection in Solid. It is used to save from needing to pass data as props through intermediate components.

This function creates a new context object that can be used with `useContext` and provides the `Provider` control flow. Default Context is used when no `Provider` is found above in the hierarchy.

```js
export const CounterContext = createContext([{ count: 0 }, {}]);

export function CounterProvider(props) {
  const [state, setState] = createStore({ count: props.count || 0 });
  const store = [
    state,
    {
      increment() {
        setState("count", (c) => c + 1);
      },
      decrement() {
        setState("count", (c) => c - 1);
      },
    },
  ];

  return (
    <CounterContext.Provider value={store}>
      {props.children}
    </CounterContext.Provider>
  );
}
```

The value passed to provider is passed to `useContext` as is. That means wrapping as a reactive expression will not work. You should pass in Signals and Stores directly instead of accessing them in the JSX.

## `useContext`

```ts
export function useContext<T>(context: Context<T>): T;
```

Used to grab context to allow for deep passing of props without having to pass them through each Component function.

```js
const [state, { increment, decrement }] = useContext(CounterContext);
```

## `children`

```ts
export function children(fn: () => any): () => any;
```

Used to make it easier to interact with `props.children`. This helper resolves any nested reactivity and returns a memo. Recommended approach to using `props.children` in anything other than passing directly through to JSX.

```js
const list = children(() => props.children);

// do something with them
createEffect(() => list());
```

## `lazy`

```ts
export function lazy<T extends Component<any>>(
  fn: () => Promise<{ default: T }>
): T & { preload: () => Promise<T> };
```

Used to lazy load components to allow for code splitting. Components are not loaded until rendered. Lazy loaded components can be used the same as its statically imported counterpart, receiving props etc... Lazy components trigger `<Suspense>`

```js
// wrap import
const ComponentA = lazy(() => import("./ComponentA"));

// use in JSX
<ComponentA title={props.title} />;
```

## `createUniqueId`

```ts
export function createUniqueId(): string;
```

A universal id generator that is stable across server/browser.

```js
const id = createUniqueId();
```

> **Note** on the server this only works under hydratable components

# Secondary Primitives

You probably won't need them for your first app, but these are useful tools to have.

## `createDeferred`

```ts
export function createDeferred<T>(
  source: () => T,
  options?: {
    timeoutMs?: number;
    equals?: false | ((prev: T, next: T) => boolean);
  }
): () => T;
```

Creates a readonly that only notifies downstream changes when the browser is idle. `timeoutMs` is the maximum time to wait before forcing the update.

## `createComputed`

```ts
export function createComputed<T>(fn: (v: T) => T, value?: T): void;
```

Creates a new computation that automatically tracks dependencies and runs immediately before render. Use this to write to other reactive primitives. When possible use `createMemo` instead as writing to a signal mid update can cause other computations to need to re-calculate.

## `createRenderEffect`

```ts
export function createRenderEffect<T>(fn: (v: T) => T, value?: T): void;
```

Creates a new computation that automatically tracks dependencies and runs during the render phase as DOM elements are created and updated but not necessarily connected. All internal DOM updates happen at this time.

## `createReaction`

**New in v1.3.0**

```ts
export function createReaction(
  onInvalidate: () => void
): (fn: () => void) => void;
```

Sometimes it is useful to separate tracking from re-execution. This primitive registers a side effect that is run the first time the expression wrapped by the returned tracking function is notified of a change.

```js
const [s, set] = createSignal("start");

const track = createReaction(() => console.log("something"));

// next time s changes run the reaction
track(() => s());

set("end"); // "something"

set("final"); // no-op as reaction only runs on first update, need to call track again.
```

## `createSelector`

```ts
export function createSelector<T, U>(
  source: () => T,
  fn?: (a: U, b: T) => boolean
): (k: U) => boolean;
```

Creates a conditional signal that only notifies subscribers when entering or exiting their key matching the value. Useful for delegated selection state. As it makes the operation O(2) instead of O(n).

```js
const isSelected = createSelector(selectedId);

<For each={list()}>
  {(item) => <li classList={{ active: isSelected(item.id) }}>{item.name}</li>}
</For>;
```

# Rendering

These imports are exposed from `solid-js/web`.

## `render`

```ts
export function render(
  code: () => JSX.Element,
  element: MountableElement
): () => void;
```

This is the browser app entry point. Provide a top level component definition or function and an element to mount to. It is recommended this element be empty as the returned dispose function will wipe all children.

```js
const dispose = render(App, document.getElementById("app"));
```

## `hydrate`

```ts
export function hydrate(
  fn: () => JSX.Element,
  node: MountableElement
): () => void;
```

This method is similar to `render` except it attempts to rehydrate what is already rendered to the DOM. When initializing in the browser a page has already been server rendered.

```js
const dispose = hydrate(App, document.getElementById("app"));
```

## `renderToString`

```ts
export function renderToString<T>(
  fn: () => T,
  options?: {
    nonce?: string;
    renderId?: string;
  }
): string;
```

Renders to a string synchronously. The function also generates a script tag for progressive hydration. Options include eventNames to listen to before the page loads and play back on hydration, and nonce to put on the script tag.

`renderId` is used to namespace renders when having multiple top level roots.

```js
const html = renderToString(App);
```

## `renderToStringAsync`

```ts
export function renderToStringAsync<T>(
  fn: () => T,
  options?: {
    timeoutMs?: number;
    renderId?: string;
    nonce?: string;
  }
): Promise<string>;
```

Same as `renderToString` except it will wait for all `<Suspense>` boundaries to resolve before returning the results. Resource data is automatically serialized into the script tag and will be hydrated on client load.

`renderId` is used to namespace renders when having multiple top level roots.

```js
const html = await renderToStringAsync(App);
```

## `renderToStream`

**New in v1.3.0**

```ts
export function renderToStream<T>(
  fn: () => T,
  options?: {
    nonce?: string;
    renderId?: string;
    onCompleteShell?: () => void;
    onCompleteAll?: () => void;
  }
): {
  pipe: (writable: { write: (v: string) => void }) => void;
  pipeTo: (writable: WritableStream) => void;
};
```

This method renders to a stream. It renders the content synchronously including any Suspense fallback placeholders, and then continues to stream the data and HTML from any async resource as it completes.

```js
// node
renderToStream(App).pipe(res);

// web stream
const { readable, writable } = new TransformStream();
renderToStream(App).pipeTo(writable);
```

`onCompleteShell` fires when synchronous rendering is complete before writing the first flush to the stream out to the browser. `onCompleteAll` is called when all server Suspense boundaries have settled. `renderId` is used to namespace renders when having multiple top level roots.

> Note this API replaces the previous `pipeToWritable` and `pipeToNodeWritable` APIs.

## `isServer`

```ts
export const isServer: boolean;
```

This indicates that the code is being run as the server or browser bundle. As the underlying runtimes export this as a constant boolean it allows bundlers to eliminate the code and their used imports from the respective bundles.

```js
if (isServer) {
  // I will never make it to the browser bundle
} else {
  // won't be run on the server;
}
```

## `HydrationScript`

```ts
export function generateHydrationScript(options: {
  nonce?: string;
  eventNames?: string[];
}): string;

export function HydrationScript(props: {
  nonce?: string;
  eventNames?: string[];
}): JSX.Element;
```

Hydration Script is a special script that should be placed once on the page to bootstrap hydration before Solid's runtime has loaded. It comes both as a function that can be called and inserted in an your HTML string, or as a Component if you are rendering JSX from the `<html>` tag.

The options are for the `nonce` to be put on the script tag and any event names for that Solid should capture before scripts have loaded and replay during hydration. These events are limited to those that Solid delegates which include most UI Events that are composed and bubble. By default it is only `click` and `input` events.

# Control Flow

For reactive control flow to be performant, we have to control how elements are created. For example, with lists, a simple `map` is inefficient as it always maps the entire array.

This means helper functions. Wrapping these in components is convenient way for terse templating and allows users to compose and build their own control flow components.

These built-in control flow components will be automatically imported. All except `Portal` and `Dynamic` are exported from `solid-js`. Those two, which are DOM-specific, are exported by `solid-js/web`.

> Note: All callback/render function children of control flow are non-tracking. This allows for nesting state creation, and better isolates reactions.

## `<For>`

```ts
export function For<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: T, index: () => number) => U;
}): () => U[];
```

Simple referentially keyed loop. The callback takes the current item as the first argument:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item}</div>}
</For>
```

The optional second argument is an index signal:

```jsx
<For each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index()} {item}
    </div>
  )}
</For>
```

## `<Show>`

```ts
function Show<T>(props: {
  when: T | undefined | null | false;
  fallback?: JSX.Element;
  children: JSX.Element | ((item: T) => JSX.Element);
}): () => JSX.Element;
```

The Show control flow is used to conditional render part of the view: it renders `children` when the `when` is truthy, an `fallback` otherwise. It is similar to the ternary operator (`when ? children : fallback`) but is ideal for templating JSX.

```jsx
<Show when={state.count > 0} fallback={<div>Loading...</div>}>
  <div>My Content</div>
</Show>
```

Show can also be used as a way of keying blocks to a specific data model. Ex the function is re-executed whenever the user model is replaced.

```jsx
<Show when={state.user} fallback={<div>Loading...</div>}>
  {(user) => <div>{user.firstName}</div>}
</Show>
```

## `<Switch>`/`<Match>`

```ts
export function Switch(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): () => JSX.Element;

type MatchProps<T> = {
  when: T | undefined | null | false;
  children: JSX.Element | ((item: T) => JSX.Element);
};
export function Match<T>(props: MatchProps<T>);
```

Useful for when there are more than 2 mutual exclusive conditions. Can be used to do things like simple routing.

```jsx
<Switch fallback={<div>Not Found</div>}>
  <Match when={state.route === "home"}>
    <Home />
  </Match>
  <Match when={state.route === "settings"}>
    <Settings />
  </Match>
</Switch>
```

Match also supports function children to serve as keyed flow.

## `<Index>`

```ts
export function Index<T, U extends JSX.Element>(props: {
  each: readonly T[];
  fallback?: JSX.Element;
  children: (item: () => T, index: number) => U;
}): () => U[];
```

Non-keyed list iteration (rendered nodes are keyed to an array index). This is useful when there is no conceptual key, like if the data consists of primitives and it is the index that is fixed rather than the value.

The item is a signal:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item) => <div>{item()}</div>}
</Index>
```

Optional second argument is an index number:

```jsx
<Index each={state.list} fallback={<div>Loading...</div>}>
  {(item, index) => (
    <div>
      #{index} {item()}
    </div>
  )}
</Index>
```

## `<ErrorBoundary>`

```ts
function ErrorBoundary(props: {
  fallback: JSX.Element | ((err: any, reset: () => void) => JSX.Element);
  children: JSX.Element;
}): () => JSX.Element;
```

Catches uncaught errors and renders fallback content.

```jsx
<ErrorBoundary fallback={<div>Something went terribly wrong</div>}>
  <MyComp />
</ErrorBoundary>
```

Also supports callback form which passes in error and a reset function.

```jsx
<ErrorBoundary
  fallback={(err, reset) => <div onClick={reset}>Error: {err.toString()}</div>}
>
  <MyComp />
</ErrorBoundary>
```

## `<Suspense>`

```ts
export function Suspense(props: {
  fallback?: JSX.Element;
  children: JSX.Element;
}): JSX.Element;
```

A component that tracks all resources read under it and shows a fallback placeholder state until they are resolved. What makes `Suspense` different than `Show` is it is non-blocking in that both branches exist at the same time even if not currently in the DOM.

```jsx
<Suspense fallback={<div>Loading...</div>}>
  <AsyncComponent />
</Suspense>
```

## `<SuspenseList>` (Experimental)

```ts
function SuspenseList(props: {
  children: JSX.Element;
  revealOrder: "forwards" | "backwards" | "together";
  tail?: "collapsed" | "hidden";
}): JSX.Element;
```

`SuspenseList` allows for coordinating multiple parallel `Suspense` and `SuspenseList` components. It controls the order in which content is revealed to reduce layout thrashing and has an option to collapse or hide fallback states.

```jsx
<SuspenseList revealOrder="forwards" tail="collapsed">
  <ProfileDetails user={resource.user} />
  <Suspense fallback={<h2>Loading posts...</h2>}>
    <ProfileTimeline posts={resource.posts} />
  </Suspense>
  <Suspense fallback={<h2>Loading fun facts...</h2>}>
    <ProfileTrivia trivia={resource.trivia} />
  </Suspense>
</SuspenseList>
```

SuspenseList is still experimental and does not have full SSR support.

## `<Dynamic>`

```ts
function Dynamic<T>(
  props: T & {
    children?: any;
    component?: Component<T> | string | keyof JSX.IntrinsicElements;
  }
): () => JSX.Element;
```

This component lets you insert an arbitrary Component or tag and passes the props through to it.

```jsx
<Dynamic component={state.component} someProp={state.something} />
```

## `<Portal>`

```ts
export function Portal(props: {
  mount?: Node;
  useShadow?: boolean;
  isSVG?: boolean;
  children: JSX.Element;
}): Text;
```

This inserts the element in the mount node. Useful for inserting Modals outside of the page layout. Events still propagate through the Component Hierarchy.

The portal is mounted in a `<div>` unless the target is the document head. `useShadow` places the element in a Shadow Root for style isolation, and `isSVG` is required if inserting into an SVG element so that the `<div>` is not inserted.

```jsx
<Portal mount={document.getElementById("modal")}>
  <div>My Content</div>
</Portal>
```

# Special JSX Attributes

In general Solid attempts to stick to DOM conventions. Most props are treated as attributes on native elements and properties on Web Components, but a few of them have special behavior.

For custom namespaced attributes with TypeScript you need to extend Solid's JSX namespace:

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      // use:____
    }
    interface ExplicitProperties {
      // prop:____
    }
    interface ExplicitAttributes {
      // attr:____
    }
    interface CustomEvents {
      // on:____
    }
    interface CustomCaptureEvents {
      // oncapture:____
    }
  }
}
```

## `ref`

Refs are a way of getting access to underlying DOM elements in our JSX. While it is true one could just assign an element to a variable, it is more optimal to leave components in the flow of JSX. Refs are assigned at render time but before the elements are connected to the DOM. They come in 2 flavors.

```js
// simple assignment
let myDiv;

// use onMount or createEffect to read after connected to DOM
onMount(() => console.log(myDiv));
<div ref={myDiv} />

// Or, callback function (called before connected to DOM)
<div ref={el => console.log(el)} />
```

Refs can also be used on Components. They still need to be attached on the otherside.

```jsx
function MyComp(props) {
  return <div ref={props.ref} />;
}

function App() {
  let myDiv;
  onMount(() => console.log(myDiv.clientWidth));
  return <MyComp ref={myDiv} />;
}
```

## `classList`

A helper that leverages `element.classList.toggle`. It takes an object whose keys are class names and assigns them when the resolved value is true.

```jsx
<div
  classList={{ active: state.active, editing: state.currentId === row.id }}
/>
```

## `style`

Solid's style helper works with either a string or with an object. Unlike React's version Solid uses `element.style.setProperty` under the hood. This means support for CSS vars, but it also means we use the lower, dash-case version of properties. This actually leads to better performance and consistency with SSR output.

```jsx
// string
<div style={`color: green; background-color: ${state.color}; height: ${state.height}px`} />

// object
<div style={{
  color: "green",
  "background-color": state.color,
  height: state.height + "px" }}
/>

// css variable
<div style={{ "--my-custom-color": state.themeColor }} />
```

## `innerHTML`/`textContent`

These work the same as their property equivalent. Set a string and they will be set. **Be careful!!** Setting `innerHTML` with any data that could be exposed to an end user as it could be a vector for malicious attack. `textContent` while generally not needed is actually a performance optimization when you know the children will only be text as it bypasses the generic diffing routine.

```jsx
<div textContent={state.text} />
```

## `on___`

Event handlers in Solid typically take the form of `onclick` or `onClick` depending on style.

Solid uses semi-synthetic event delegation for common UI events that are composed and bubble. This improves performance for these common events.

```jsx
<div onClick={(e) => console.log(e.currentTarget)} />
```

Solid also supports passing an array to the event handler to bind a value to the first argument of the event handler. This doesn't use `bind` or create an additional closure, so it is a highly optimized way of delegating events.

```jsx
function handler(itemId, e) {
  /*...*/
}

<ul>
  <For each={state.list}>{(item) => <li onClick={[handler, item.id]} />}</For>
</ul>;
```

Events are never rebound and the bindings are not reactive, as it is expensive to attach and detach listeners.
Since event handlers are called like any other function each time an event fires, there is no need for reactivity; simply shortcut your handler if desired.

```jsx
// if defined call it, otherwised don't.
<div onClick={() => props.handleClick?.()} />
```

Note that `onChange` and `onInput` work according to their native behavior. `onInput` will fire immediately after the value has changed; for `<input>` fields, `onChange` will only fire after the field loses focus.

## `on:___`/`oncapture:___`

For any other events, perhaps ones with unusual names, or ones you wish not to be delegated there are the `on` namespace events. This simply adds an event listener verbatim.

```jsx
<div on:Weird-Event={(e) => alert(e.detail)} />
```

## `use:___`

These are custom directives. In a sense this is just syntax sugar over ref but allows us to easily attach multiple directives to a single element. A directive is simply a function with the following signature:

```ts
function directive(element: Element, accessor: () => any): void;
```

Directive functions are called at render time but before being added to the DOM. You can do whatever you'd like in them including create signals, effects, register clean-up etc.

```js
const [name, setName] = createSignal("");

function model(el, value) {
  const [field, setField] = value();
  createRenderEffect(() => (el.value = field()));
  el.addEventListener("input", (e) => setField(e.target.value));
}

<input type="text" use:model={[name, setName]} />;
```

To register with TypeScript extend the JSX namespace.

```ts
declare module "solid-js" {
  namespace JSX {
    interface Directives {
      model: [() => any, (v: any) => any];
    }
  }
}
```

## `prop:___`

Forces the prop to be treated as a property instead of an attribute.

```jsx
<div prop:scrollTop={props.scrollPos + "px"} />
```

## `attr:___`

Forces the prop to be treated as a attribute instead of an property. Useful for Web Components where you want to set attributes.

```jsx
<my-element attr:status={props.status} />
```

## `/* @once */`

Solid's compiler uses a simple heuristic for reactive wrapping and lazy evaluation of JSX expressions. Does it contain a function call, a property access, or JSX? If yes we wrap it in a getter when passed to components or in an effect if passed to native elements.

Knowing this we can reduce overhead of things we know will never change simply by accessing them outside of the JSX. A simple variable will never be wrapped. We can also tell the compiler not to wrap them by starting the expression with a comment decorator `/_ @once _/`.

```jsx
<MyComponent static={/*@once*/ state.wontUpdate} />
```

This also works on children.

```jsx
<MyComponent>{/*@once*/ state.wontUpdate}</MyComponent>
```
