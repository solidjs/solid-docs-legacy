Solid의 `style` 속성은 스타일 문자열이나 객체를 받습니다. 객체는 `Element.prototype.style`와는 다르며, `style.setProperty`를 호출하기 위한 래퍼입니다. 이는 "backgroundColor"가 아닌 "background-color"와 같은 dash-case 형식을 받아들이며, 이는 CSS 변수를 설정할 수 있음을 의미합니다:

```js
<div style={{ "--my-custom-color": themeColor() }} />
```

인라인 스타일을 사용해 div에 애니메이션을 추가해보겠습니다:
```jsx
<div style={{
  color: `rgb(${num()}, 180, ${num()})`,
  "font-weight": 800,
  "font-size": `${num()}px`}}
>
  Some Text
</div>
```
