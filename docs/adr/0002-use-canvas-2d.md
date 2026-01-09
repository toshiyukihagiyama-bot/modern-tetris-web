# ADR 0002: Canvas 2D API の採用

## ステータス

採用

## コンテキスト

テトリスゲームのレンダリング技術として、以下の選択肢があります：

1. **Canvas 2D API**: CPU ベースの2D描画
2. **WebGL**: GPU ベースの3D/2D描画
3. **DOM + CSS**: HTML要素によるレンダリング
4. **SVG**: ベクターグラフィックス

テトリスは2Dゲームであり、以下の要件があります：

- 20×12のグリッド上でブロックを描画
- 60 FPS で滑らかなアニメーション
- 移動・回転のリアルタイム更新
- パーティクルエフェクト（オプション）

## 決定

**Canvas 2D API をメインレンダリング技術として採用します。**

## 理由

### 1. パフォーマンス特性

テトリスのような2Dゲームでは、Canvas 2D が最適なパフォーマンスを発揮します：

```typescript
// 描画対象: 240セル（20×12）+ 現在のピース + UI要素
// Canvas 2D: 60 FPS で余裕を持って描画可能
// WebGL: オーバースペック、セットアップコストが高い
```

#### Canvas 2D が効率的な理由

- **少ない描画要素**: テトリスは数百個のセルを描画するのみ
- **単純な形状**: 矩形とテキストが中心
- **2D特化**: Canvas 2D は2D描画に最適化されている

#### WebGL のオーバーヘッド

- シェーダーのコンパイル
- バッファの管理
- 行列計算
- GPU メモリ転送

調査結果から：「If your requirement is 2D gaming with few moving items, Canvas is the solution」

### 2. 開発の容易さ

```typescript
// Canvas 2D: シンプルな API
ctx.fillStyle = '#00f0f0';
ctx.fillRect(x, y, width, height);
ctx.strokeRect(x, y, width, height);

// WebGL: 複雑なセットアップ
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, vertexShaderSource);
gl.compileShader(vertexShader);
// ... 数十行のボイラープレート
```

#### 必要なスキルセット

**Canvas 2D**:
- 標準的な JavaScript スキル
- 基本的な2D座標系の理解
- 標準的なデバッグツール

**WebGL**:
- グラフィックスプログラミングの知識
- GLSL シェーダー言語
- 3D数学（行列、ベクトル）
- 専門的なデバッグツール

調査結果から：「WebGL requires specialized knowledge including graphics programming, GLSL shader languages, and 3D mathematics」

### 3. ブラウザ互換性

Canvas 2D は全てのモダンブラウザで完全にサポートされています：

- Chrome: 完全サポート
- Firefox: 完全サポート
- Safari: 完全サポート
- Edge: 完全サポート

WebGL は一部の環境で問題が発生する可能性：
- 古いデバイス
- GPU ドライバーの問題
- モバイルブラウザの制限

### 4. デバッグとプロファイリング

Canvas 2D:
- Chrome DevTools で直接デバッグ可能
- ブレークポイント、ステップ実行
- Performance タブで簡単にプロファイル

WebGL:
- WebGL Inspector などの専門ツールが必要
- シェーダーのデバッグが困難
- パフォーマンス問題の特定が複雑

### 5. バンドルサイズ

Canvas 2D:
- ブラウザ標準 API（追加ライブラリ不要）
- バンドルサイズ: 0 KB

WebGL フレームワーク（PixiJS など）:
- 最小でも 200KB 以上
- テトリスには過剰

### 6. 実績

調査結果から、多くの成功したHTML5ゲームが Canvas 2D を使用：

- シンプルな2Dゲームには Canvas 2D が標準
- WebGL は複雑な3Dゲームや大量のスプライトが必要な場合に有効

## 結果

### ポジティブ

- **シンプルな実装**: 標準的な JavaScript スキルで開発可能
- **優れたパフォーマンス**: テトリスの要件に対して十分な性能
- **高い互換性**: 全てのモダンブラウザで動作
- **容易なデバッグ**: 標準的なツールでデバッグ可能
- **小さなバンドル**: 追加ライブラリ不要
- **保守性**: チームメンバー全員が理解しやすい

### ネガティブ

- **スケーラビリティ**: 数千のスプライトを描画する場合は WebGL が有利
  - 対策: テトリスでは問題にならない（描画要素は数百程度）
- **高度なエフェクト**: WebGL の方がリッチなエフェクトを実装しやすい
  - 対策: Canvas 2D でも十分なエフェクトを実装可能

## 代替案

### WebGL / PixiJS

```typescript
// PixiJS の例
const app = new PIXI.Application();
const sprite = PIXI.Sprite.from('image.png');
app.stage.addChild(sprite);
```

**メリット**:
- GPU アクセラレーション
- 大量のスプライト描画が高速
- 高度なエフェクト

**デメリット**:
- オーバースペック（テトリスには不要）
- 学習コスト高
- バンドルサイズ大
- デバッグ困難

**評価**: テトリスには過剰。より複雑なゲームでは有効。

### DOM + CSS

```html
<div class="cell" style="background-color: cyan; transform: translate(30px, 60px)"></div>
```

**メリット**:
- Canvas 不要
- CSS アニメーション活用

**デメリット**:
- パフォーマンス問題（240個のDOM要素）
- レイアウトの再計算コスト
- ピクセル単位の制御が困難

**評価**: 小規模なゲームには有効だが、60 FPS を維持するのは困難。

### SVG

```html
<svg>
  <rect x="30" y="60" width="30" height="30" fill="cyan" />
</svg>
```

**メリット**:
- スケーラブル
- アニメーション API

**デメリット**:
- Canvas より低速
- ゲーム向きではない

**評価**: インタラクティブな図表には有効だが、ゲームには不適。

## パフォーマンス最適化戦略

Canvas 2D で最適なパフォーマンスを実現するため、以下を実装：

### 1. オフスクリーンキャンバス

```typescript
// 背景は一度だけ描画
const backgroundCanvas = new OffscreenCanvas(width, height);
// ... 背景を描画

// メインループでは転送のみ
ctx.drawImage(backgroundCanvas, 0, 0);
```

### 2. ダーティリージョン

変更があった部分のみ再描画：

```typescript
if (isDirty) {
  renderer.render(state);
  isDirty = false;
}
```

### 3. requestAnimationFrame

```typescript
function gameLoop(timestamp: number) {
  update(deltaTime);
  render();
  requestAnimationFrame(gameLoop);
}
```

### 4. レイヤー分離

複数のキャンバスを重ねて、更新頻度の異なる要素を分離。

## 将来の拡張性

将来的に3Dエフェクトや大量のパーティクルが必要になった場合、WebGL レイヤーを追加可能：

```typescript
// メインゲーム: Canvas 2D
// エフェクト: WebGL (PixiJS)

<canvas id="game"></canvas>
<canvas id="effects" style="position: absolute; top: 0;"></canvas>
```

ハイブリッドアプローチにより、必要に応じて機能を追加できます。

## 参考資料

- [WebGL vs Canvas: Best Choice for Browser-Based CAD Tools](https://altersquare.medium.com/webgl-vs-canvas-best-choice-for-browser-based-cad-tools-231097daf063)
- [A look at 2D vs WebGL canvas performance](https://semisignal.com/a-look-at-2d-vs-webgl-canvas-performance/)
- [When to use HTML5's canvas](https://blog.logrocket.com/when-to-use-html5s-canvas-ce992b100ee8/)

## 更新履歴

- 2026-01-09: 初版作成
