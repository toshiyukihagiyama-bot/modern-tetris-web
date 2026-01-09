# ADR 0001: TypeScript の採用

## ステータス

採用

## コンテキスト

テトリスWebゲームの開発言語として、JavaScript または TypeScript のいずれかを選択する必要があります。

2026年時点では、TypeScript がモダンなWeb開発のベースラインとなっています。特にゲーム開発では以下の課題があります：

- ゲームロジックは複雑で、状態管理が重要
- バグの多くは型の不一致に起因する
- リファクタリング時の安全性が求められる
- 複数ファイルにまたがる大規模なコードベース

## 決定

**TypeScript 5.x を開発言語として採用します。**

## 理由

### 1. 型安全性によるバグの削減

```typescript
// TypeScript: コンパイル時にエラー検出
function movePiece(piece: Piece, x: number, y: number): boolean {
  return board.isValidPosition(piece, x, y);
}

movePiece(currentPiece, "5", 0);  // Error: Argument of type 'string' is not assignable to parameter of type 'number'

// JavaScript: 実行時まで気付かない
function movePiece(piece, x, y) {
  return board.isValidPosition(piece, x, y);
}

movePiece(currentPiece, "5", 0);  // ランタイムエラーまたは予期しない動作
```

### 2. IDE サポートの向上

- インテリセンス（自動補完）
- リファクタリング支援
- 即座のエラー検出
- API ドキュメントの統合

### 3. コードの自己文書化

```typescript
// TypeScript: 型定義がドキュメントとして機能
interface GameState {
  status: GameStatus;
  board: Board;
  currentPiece: Piece | null;
  score: number;
  level: number;
}

// JavaScript: ドキュメントコメントが必要
/**
 * @typedef {Object} GameState
 * @property {string} status
 * @property {Board} board
 * @property {Piece|null} currentPiece
 * @property {number} score
 * @property {number} level
 */
```

### 4. リファクタリングの安全性

型システムにより、リファクタリング時の影響範囲を正確に把握できます：

```typescript
// メソッド名を変更する際、TypeScript は全ての呼び出し箇所を検出
class Board {
  // isValid → isValidPosition に変更
  isValidPosition(piece: Piece, x: number, y: number): boolean {
    // ...
  }
}

// 変更漏れがあればコンパイルエラー
```

### 5. 業界標準

2026年時点の調査結果から：

- プロフェッショナルプロジェクトでは TypeScript がベースライン
- 主要なゲームエンジン（Phaser, PixiJS）が TypeScript をサポート
- フロントエンド・バックエンドの境界を超えた統一言語として機能

### 6. ゼロランタイムコスト

TypeScript はコンパイル時に型情報を削除するため、ランタイムのオーバーヘッドはありません。

### 7. 段階的な導入が可能

JavaScript コードは有効な TypeScript コードであるため、必要に応じて段階的に型を追加できます。

## 結果

### ポジティブ

- **開発速度の向上**: IDE サポートにより、コーディングが高速化
- **バグの早期発見**: コンパイル時に多くのバグを検出
- **保守性の向上**: リファクタリングが容易で安全
- **チーム開発**: コードの意図が明確で、チーム開発がスムーズ
- **エコシステム**: 豊富な型定義ライブラリ（@types/*）

### ネガティブ

- **学習コスト**: TypeScript の型システムを学ぶ必要がある
  - 対策: 基本的な型から始め、段階的に高度な機能を導入
- **ビルドステップ**: コンパイルが必要
  - 対策: Vite + ESBuild による高速ビルド
- **設定の複雑さ**: tsconfig.json の設定が必要
  - 対策: 標準的なプリセットを使用

## 代替案

### プレーンな JavaScript

- **メリット**: シンプル、ビルド不要
- **デメリット**: 型安全性なし、大規模プロジェクトで保守困難
- **評価**: モダンなWeb開発では非推奨

### JSDoc による型アノテーション

```javascript
/**
 * @param {Piece} piece
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function movePiece(piece, x, y) {
  return board.isValidPosition(piece, x, y);
}
```

- **メリット**: ビルド不要、軽量
- **デメリット**:
  - 型チェックが弱い
  - 冗長な記述
  - IDE サポートが限定的
- **評価**: 小規模プロジェクトには有効だが、本プロジェクトには不十分

## 実装詳細

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Strict モード

以下の厳格オプションを有効化：

- `strict: true`: 全ての厳格チェックを有効化
- `strictNullChecks`: null/undefined の厳格チェック
- `strictFunctionTypes`: 関数型の厳格チェック
- `noImplicitAny`: 暗黙的な any を禁止

## 参考資料

- [Why TypeScript Development Powers Scalable Web Apps in 2026](https://eleorex.com/why-typescript-development-is-the-game-changer-for-scalable-web-apps-in-2026/)
- [TypeScript Best Practices for Large-Scale Web Applications in 2026](https://johal.in/typescript-best-practices-for-large-scale-web-applications-in-2026/)
- [Writing a Game in TypeScript](https://iamschulz.com/writing-a-game-in-typescript/)
- [JavaScript/TypeScript Game Engines in 2025](https://gamefromscratch.com/javascript-typescript-game-engines-in-2025/)

## 更新履歴

- 2026-01-09: 初版作成
