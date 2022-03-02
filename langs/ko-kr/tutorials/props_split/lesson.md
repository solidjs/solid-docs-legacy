props 관련해서, 머지 말고도 다른 작업이 필요합니다.

props를 그룹으로 나누어 현재 컴포넌트에서 일부를 사용하고, 나머지는 자식 컴포넌트로 전달하고 싶은 경우가 있습니다.

이를 위해 Solid는 [`splitProps`](/docs/latest/api#splitprops)를 제공합니다. 이 함수는 props 객체와 추출하려는 하나 이상의 키 배열을 인수로 받습니다. 함수의 반환값은 props 객체의 배열이며, 지정한 키 배열당 하나씩의 props 객체에 추가로 미지정 키들에 해당하는 props 객체입니다. 반환된 모든 객체들은 반응성을 유지합니다.

예제의 `greeting.tsx` 파일에서 디스트럭처링을 사용하면서 반응성을 잃었기 때문에 이름을 설정하더라도 업데이트되지 않습니다.:

```jsx
export default function Greeting(props) {
  const { greeting, name, ...others } = props;
  return <h3 {...others}>{greeting} {name}</h3>
}
```

대신 `splitProps`를 사용해 반응성을 유지할 수 있습니다:
```jsx
export default function Greeting(props) {
  const [local, others] = splitProps(props, ["greeting", "name"]);
  return <h3 {...others}>{local.greeting} {local.name}</h3>
}
```

이제 예상한대로 버튼이 잘 작동합니다.