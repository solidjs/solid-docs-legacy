때로는 앱의 정상적인 플로우 외부에 엘리먼트를 삽입하는 것이 더 좋은 경우가 있습니다. Z-index 는 때때로 모달과 같은 플로팅 엘리먼트에 대한 렌더링 컨텍스트를 처리하기에 부족한 경우가 있습니다.

Solid 에는 선택한 위치에 자식 콘텐츠가 삽입되는 `<Portal>` 컴포넌트가 있습니다. 기본적으로 해당 엘리먼트는 `document.body`의 `<div>`에 렌더링됩니다.

이 예제에서, 팝업창이 잘리는 것을 볼 수 있습니다. 엘리먼트를 `<Portal>`로 래핑하여 플로우에서 뺴내어 이 문제를 해결할 수 있습니다:

```jsx
<Portal>
  <div class="popup">
    <h1>Popup</h1>
    <p>Some text you might need for something or other.</p>
  </div>
</Portal>
```
