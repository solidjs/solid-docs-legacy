
## Translator Notes

原文 | 訳 | NG
-|-|-
caching | キャッシュ
clone | 複製
design | 設計
fire | （イベントの）発生
first argument | 第一引数 | 第1引数
handler | ハンドラー | ハンドラ
helper | ヘルパー
interface | インターフェイス | インターフェース、インタフェイス
leaf | 葉ノード
load | ロード | 読み込み
loading | ローディング、ロード
mutable/immutable | 可変/不変、ミュータブルな/イミュータブルな
nested | ネストした | 入れ子になった、ネストされた
note | 注意
prerender | 事前レンダリング
production | 本番環境
prop | プロパティ | プロップ
props | props
reactivity | リアクティビティ | リアクティブ性
read value | 値の読み取り
return value | 戻り値 | 返り値
set value | 値の設定
state | 状態
testing | テスト
tracking | 追跡 | トラッキング
update | 更新 | アップデート
virtual DOM, VDOM | 仮想 DOM
||
Fragment|Fragment
Context | コンテキスト
Context API | Context API
Signals, Memos, Effects, Resources | Signal, Memo, Effect, Resource | シグナル、メモ、エフェクト、リソース
Stores | ストア
Store object | Store オブジェクト
Store proxy | ストアプロキシ

## Todo

### Updates  
These files exist for this language, but may need to be updated to reflect the newest changes.  
<!--MM:START (UPDATED:lang=ja) -->
| File                                                                                                                                                      | English File                                                                                                                                              | Last Updated (EN)                                                                                   | Last Updated (JA)                                                                                   |
| :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| [api/api.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/api/api.md)                                                                         | [api/api.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/api/api.md)                                                                         | [1/20/2023](https://github.com/solidjs/solid-docs/commit/7ca9775026cdb61c2828a687fa5322a5db642622)  | [9/10/2022](https://github.com/solidjs/solid-docs/commit/97f41fa02a81dd8ce917b8c5b5f592dde0b07dd1)  |
| [guides/getting-started.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/guides/getting-started.md)                                           | [guides/getting-started.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/guides/getting-started.md)                                           | [11/26/2022](https://github.com/solidjs/solid-docs/commit/cb8df8fa67aadf95180c48a1f52c1ddbc18dff8c) | [9/10/2022](https://github.com/solidjs/solid-docs/commit/97f41fa02a81dd8ce917b8c5b5f592dde0b07dd1)  |
| [tutorials/async_resources/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/async_resources/lesson.md)                       | [tutorials/async_resources/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/async_resources/lesson.md)                       | [10/30/2022](https://github.com/solidjs/solid-docs/commit/df4b4f089f2bb404dcf0815ab3fe65c69ace8c4e) | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/flow_switch/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/flow_switch/lesson.md)                               | [tutorials/flow_switch/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/flow_switch/lesson.md)                               | [1/25/2023](https://github.com/solidjs/solid-docs/commit/f664862fd1aeea273248014e03562155ce70da69)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/introduction_basics/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/introduction_basics/lesson.md)               | [tutorials/introduction_basics/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/introduction_basics/lesson.md)               | [11/26/2022](https://github.com/solidjs/solid-docs/commit/cb8df8fa67aadf95180c48a1f52c1ddbc18dff8c) | [9/10/2022](https://github.com/solidjs/solid-docs/commit/97f41fa02a81dd8ce917b8c5b5f592dde0b07dd1)  |
| [tutorials/reactivity_batch/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/reactivity_batch/lesson.md)                     | [tutorials/reactivity_batch/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/reactivity_batch/lesson.md)                     | [9/10/2022](https://github.com/solidjs/solid-docs/commit/97f41fa02a81dd8ce917b8c5b5f592dde0b07dd1)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_context/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_context/lesson.json)                     | [tutorials/stores_context/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_context/lesson.json)                     | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_context/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_context/solved.json)                     | [tutorials/stores_context/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_context/solved.json)                     | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_nested_reactivity/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_nested_reactivity/lesson.md)     | [tutorials/stores_nested_reactivity/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_nested_reactivity/lesson.md)     | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/stores_nested_reactivity/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_nested_reactivity/solved.json) | [tutorials/stores_nested_reactivity/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_nested_reactivity/solved.json) | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |

<!--MM:END-->
### Missing Files  
These files haven't been created yet for this language.  
<!--MM:START (CREATED:lang=ja) -->
| Resource Name | English Files                                                                                         |
| :------------ | :---------------------------------------------------------------------------------------------------- |
| guides        | [guides/typescript.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/guides/typescript.md) |
<!--MM:END-->
        