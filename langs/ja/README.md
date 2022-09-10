
## Translator Notes

原文 | 訳 | NG
-|-|-
caching | キャッシュ
clone | 複製
design | 設計
fire | （イベントの）発生
first argument | 第一引数 | 第1引数
handler | ハンドラー
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
| [guides/comparison.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/guides/comparison.md)                                                     | [guides/comparison.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/guides/comparison.md)                                                     | [9/10/2022](https://github.com/solidjs/solid-docs/commit/8f0dc1e99fd59f3275b59ab94d7caab75cd7a975)  | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   |
| [tutorials/bindings_classlist/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/bindings_classlist/lesson.md)                 | [tutorials/bindings_classlist/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/bindings_classlist/lesson.md)                 | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/bindings_directives/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/bindings_directives/lesson.md)               | [tutorials/bindings_directives/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/bindings_directives/lesson.md)               | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/bindings_refs/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/bindings_refs/lesson.md)                           | [tutorials/bindings_refs/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/bindings_refs/lesson.md)                           | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/bindings_style/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/bindings_style/lesson.md)                         | [tutorials/bindings_style/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/bindings_style/lesson.md)                         | [5/7/2022](https://github.com/solidjs/solid-docs/commit/fcb19d8a5d1cb6d494f52237fdce72d5fab522ca)   | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/flow_for/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/flow_for/lesson.md)                                     | [tutorials/flow_for/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/flow_for/lesson.md)                                     | [5/7/2022](https://github.com/solidjs/solid-docs/commit/fcb19d8a5d1cb6d494f52237fdce72d5fab522ca)   | [1/17/2022](https://github.com/solidjs/solid-docs/commit/51a733ad99a552bc379d864a98460861a05771c9)  |
| [tutorials/flow_show/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/flow_show/lesson.md)                                   | [tutorials/flow_show/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/flow_show/lesson.md)                                   | [2/20/2022](https://github.com/solidjs/solid-docs/commit/9af62b862bf06ae15e5d84200a01befac4aab5f3)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/flow_show/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/flow_show/solved.json)                               | [tutorials/flow_show/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/flow_show/solved.json)                               | [2/20/2022](https://github.com/solidjs/solid-docs/commit/9af62b862bf06ae15e5d84200a01befac4aab5f3)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/introduction_basics/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/introduction_basics/lesson.json)           | [tutorials/introduction_basics/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/introduction_basics/lesson.json)           | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/introduction_basics/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/introduction_basics/lesson.md)               | [tutorials/introduction_basics/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/introduction_basics/lesson.md)               | [7/2/2022](https://github.com/solidjs/solid-docs/commit/f3c5d7143ec2a84c30969c04563d6f5b77d70c31)   | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/introduction_jsx/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/introduction_jsx/lesson.md)                     | [tutorials/introduction_jsx/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/introduction_jsx/lesson.md)                     | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/lifecycles_onmount/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/lifecycles_onmount/lesson.md)                 | [tutorials/lifecycles_onmount/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/lifecycles_onmount/lesson.md)                 | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/props_defaults/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/props_defaults/lesson.md)                         | [tutorials/props_defaults/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/props_defaults/lesson.md)                         | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/props_split/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/props_split/lesson.md)                               | [tutorials/props_split/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/props_split/lesson.md)                               | [2/27/2022](https://github.com/solidjs/solid-docs/commit/24f3b78b9cd64c9ae02525eab252cee845f88e99)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/reactivity_batch/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/reactivity_batch/lesson.md)                     | [tutorials/reactivity_batch/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/reactivity_batch/lesson.md)                     | [9/10/2022](https://github.com/solidjs/solid-docs/commit/8f0dc1e99fd59f3275b59ab94d7caab75cd7a975)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_context/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_context/lesson.json)                     | [tutorials/stores_context/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_context/lesson.json)                     | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_context/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_context/solved.json)                     | [tutorials/stores_context/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_context/solved.json)                     | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_createstore/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_createstore/lesson.md)                 | [tutorials/stores_createstore/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_createstore/lesson.md)                 | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/stores_createstore/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_createstore/solved.json)             | [tutorials/stores_createstore/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_createstore/solved.json)             | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_immutable/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_immutable/lesson.md)                     | [tutorials/stores_immutable/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_immutable/lesson.md)                     | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/stores_mutation/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_mutation/lesson.json)                   | [tutorials/stores_mutation/lesson.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_mutation/lesson.json)                   | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_mutation/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_mutation/lesson.md)                       | [tutorials/stores_mutation/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_mutation/lesson.md)                       | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_mutation/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_mutation/solved.json)                   | [tutorials/stores_mutation/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_mutation/solved.json)                   | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_nested_reactivity/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_nested_reactivity/lesson.md)     | [tutorials/stores_nested_reactivity/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_nested_reactivity/lesson.md)     | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [12/22/2021](https://github.com/solidjs/solid-docs/commit/965b2ec299849c69f2a9ec4bec637a56bfa22ead) |
| [tutorials/stores_nested_reactivity/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_nested_reactivity/solved.json) | [tutorials/stores_nested_reactivity/solved.json](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_nested_reactivity/solved.json) | [9/7/2022](https://github.com/solidjs/solid-docs/commit/7a0656c409728d26f791ad1e30648171963a5316)   | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |
| [tutorials/stores_nocontext/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/tutorials/stores_nocontext/lesson.md)                     | [tutorials/stores_nocontext/lesson.md](https://github.com/solidjs/solid-docs/tree/main/langs/en/tutorials/stores_nocontext/lesson.md)                     | [5/25/2022](https://github.com/solidjs/solid-docs/commit/5e19160028a8f26c68fd43e943711696b4f30e0c)  | [11/10/2021](https://github.com/solidjs/solid-docs/commit/fd3aaa5cf6df1e9e663e97a62e0b516ce6c8ca2f) |

<!--MM:END-->
### Missing Files  
These files haven't been created yet for this language.  
<!--MM:START (CREATED:lang=ja) -->
| Resource Name | English Files                                                                                         |
| :------------ | :---------------------------------------------------------------------------------------------------- |
| guides        | [guides/typescript.md](https://github.com/solidjs/solid-docs/tree/main/langs/ja/guides/typescript.md) |

<!--MM:END-->
        