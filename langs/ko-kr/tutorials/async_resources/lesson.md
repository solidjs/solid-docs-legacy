Resource는 비동기 로딩을 처리하도록 특별히 설계된 특수 Signal입니다. 그 목적은 Solid의 분산 실행 모델과 쉽게 상호 작용할 수 있도록 비동기 값을 래핑하는 것입니다. 이는 `async`/`await` 또는 순차 실행 모델을 제공하는 제너레이터와는 정반대입니다. 목표는 비동기 작업으로 실행을 중단하지 않고, 코드를 덧붙이지 않는 것입니다.

Resource는 Promise를 반환하는 비동기 데이터 fetch 함수를 쿼리하는 소스 Signal에 의해 구동될 수 있습니다. fetch 함수의 내용은 무엇이든 가능합니다. 일반적인 REST 엔드포인트나 GraphQL 호출처럼 Promise를 생성하는 모든 것을 할 수 있습니다. Resource는 데이터 로딩 방법에 좌우되지 않으며, Promise에 의해서만 구동됩니다.

Resource Signal의 결과에는 현재 상태를 기반으로 View를 쉽게 컨트롤할 수 있도록하는 반응형 `loading`과 `error` 프로퍼티도 포함됩니다.

이제 Signal을 Resouce로 교체해 보겠습니다:
```js
const [user] = createResource(userId, fetchUser);
```

`userId` Signal에 의해 구동되며, 변경 시에 `fetch` 메서드를 호출합니다.

`createResource`에서 반환되는 2번째 값에는 내부 Signal을 직접 업데이트하는 `mutate` 메서드와, 소스가 변경되지 않은 경우에도 현재 쿼리를 다시 로드하는 `refetch` 메서드가 포함되어 있습니다.

```js
const [user, { mutate, refetch }] = createResource(userId, fetchUser);
```

`lazy`는 내부적으로 `createResource`를 사용해 동적 임포트를 관리합니다.
