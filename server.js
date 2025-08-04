#!/usr/bin/env node

const signalmaster = require('signalmaster');

// 環境変数からポート取得（Railway用）
const PORT = process.env.PORT || 3000;

// SignalMaster設定
const server = signalmaster({
  // Railway用のポート設定
  port: PORT,
  
  // CORS設定（全てのオリジンを許可）
  allowedOrigins: ['*'],
  
  // ログ設定
  logLevel: 'info',
  
  // ルーム設定
  rooms: {
    maxClients: 2  // P2P通信のため最大2クライアント
  },
  
  // 開発モード設定
  isDev: process.env.NODE_ENV !== 'production'
});

// サーバー起動ログ
console.log(`🚀 Conee Signaling Server started on port ${PORT}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`📡 WebSocket endpoint: ws://localhost:${PORT}`);

// プロセス終了処理
process.on('SIGTERM', () => {
  console.log('📴 Conee Signaling Server shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Conee Signaling Server shutting down...');
  process.exit(0);
});

module.exports = server;