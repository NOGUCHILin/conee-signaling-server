# Conee Signaling Server

WebRTC Signaling Server for Conee P2P File Sync Application

## 概要

ConeeアプリケーションのためのWebRTCシグナリングサーバーです。異なるネットワーク間でのP2P接続を可能にします。

## 機能

- ✅ WebRTCシグナリング（SDP交換、ICE候補交換）
- ✅ ルームベースの接続管理
- ✅ P2P専用設計（最大2クライアント/ルーム）
- ✅ CORS対応
- ✅ Railway/Heroku対応

## 技術スタック

- **Node.js** - ランタイム
- **SignalMaster** - WebRTCシグナリングライブラリ
- **WebSocket** - リアルタイム通信

## ローカル開発

### 前提条件

- Node.js 18.0.0以上
- npm

### セットアップ

```bash
# 依存関係インストール
npm install

# 開発モード起動
npm run dev

# 本番モード起動
npm start
```

### 動作確認

```bash
# サーバー起動後、以下で確認
curl http://localhost:3000
```

## デプロイ

### Railway

1. GitHubリポジトリ作成
2. Railway アカウント作成
3. Repository連携
4. 自動デプロイ開始

### 環境変数

- `PORT` - サーバーポート（デフォルト: 3000）
- `NODE_ENV` - 環境（production/development）

## Coneeアプリとの統合

Coneeアプリ側で以下のように設定：

```javascript
const webrtcManager = new WebRTCManager({
  userId: 'alice',
  stunServers: ['stun:stun.l.google.com:19302'],
  signalingMode: 'server',
  signalingUrl: 'wss://your-railway-app.railway.app'
});
```

## ライセンス

ISC

## サポート

このサーバーはConee P2Pファイル同期アプリケーション専用です。