Solid предоставляет Контекст API (`Context API`) для передачи данных не используя props. Это полезно для обмена Сигналами и сторами. Преимущество использования Context заключается в том, что он создается как часть реактивной системы и управляется ею.

Для начала создадим объект Context. Этот объект содержит компонент Provider, используемый для ввода наших данных. Однако распространенной практикой является обертывание компонентов `Provider` и потребителей` useContext` со значениями, уже настроенными для конкретного контекста.

To get started we create a Context object. This object contains a `Provider` component used to inject our data. However, it is common practice to wrap the `Provider` components and `useContext` consumers with versions already configured for the specific Context.

И именно этот подход мы и реализуем в этом примере. Вы можете увидеть определение простого хранилища счетчика в файле `counter.tsx`.

Чтобы использовать контекст, сначала давайте обернем наш компонент приложения, чтобы мы могли использовать его глобально. Мы будем использовать наш провайдер `CounterProvider`. В этом случае давайте дадим нашему счетчику ему начальное значение 1.

```jsx
render(() => (
  <CounterProvider count={1}>
    <App />
  </CounterProvider>
), document.getElementById("app"));
```

Затем мы можем считать контекст счетчика в нашем компоненте `nested.tsx`. Мы делаем это с помощью потребителя `useCounter`.

```jsx
const [count, { increment, decrement }] = useCounter();
return (
  <>
    <div>{count()}</div>
    <button onClick={increment}>+</button>
    <button onClick={decrement}>-</button>
  </>
);
```