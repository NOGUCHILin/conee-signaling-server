#!/usr/bin/env node

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// 環境変数からポート取得（Railway用）
const PORT = process.env.PORT || 3000;

// Express アプリケーション作成
const app = express();
const server = http.createServer(app);

// Socket.IO サーバー作成（CORS設定）
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ルーム管理
const rooms = new Map();

// ヘルスチェック用エンドポイント
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Conee WebRTC Signaling Server',
    rooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

// WebRTC シグナリング処理
io.on('connection', (socket) => {
  console.log(`📱 Client connected: ${socket.id}`);

  // ルーム参加
  socket.on('join-room', (roomId) => {
    console.log(`🏠 ${socket.id} joining room: ${roomId}`);
    
    // ルームの参加者数チェック（P2P用に最大2人）
    const room = io.sockets.adapter.rooms.get(roomId);
    const clientCount = room ? room.size : 0;
    
    if (clientCount >= 2) {
      socket.emit('room-full', roomId);
      console.log(`🚫 Room ${roomId} is full`);
      return;
    }
    
    socket.join(roomId);
    socket.room = roomId;
    
    // ルーム情報更新
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { created: Date.now(), clients: [] });
    }
    rooms.get(roomId).clients.push(socket.id);
    
    // 他の参加者に新しいクライアントを通知
    socket.to(roomId).emit('user-joined', socket.id);
    socket.emit('joined-room', roomId);
    
    console.log(`✅ ${socket.id} joined room ${roomId} (${clientCount + 1}/2)`);
  });

  // WebRTC Offer
  socket.on('offer', (offer, roomId) => {
    console.log(`📤 Offer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('offer', offer, socket.id);
  });

  // WebRTC Answer
  socket.on('answer', (answer, roomId) => {
    console.log(`📥 Answer from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('answer', answer, socket.id);
  });

  // ICE Candidate
  socket.on('ice-candidate', (candidate, roomId) => {
    console.log(`🧊 ICE candidate from ${socket.id} to room ${roomId}`);
    socket.to(roomId).emit('ice-candidate', candidate, socket.id);
  });

  // クライアント切断
  socket.on('disconnect', () => {
    console.log(`📴 Client disconnected: ${socket.id}`);
    
    if (socket.room) {
      // ルーム情報更新
      if (rooms.has(socket.room)) {
        const roomInfo = rooms.get(socket.room);
        roomInfo.clients = roomInfo.clients.filter(id => id !== socket.id);
        
        if (roomInfo.clients.length === 0) {
          rooms.delete(socket.room);
          console.log(`🗑️ Empty room deleted: ${socket.room}`);
        }
      }
      
      // 他の参加者に離脱を通知
      socket.to(socket.room).emit('user-left', socket.id);
    }
  });
});

// サーバー起動
server.listen(PORT, () => {
  console.log(`🚀 Conee Signaling Server started on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Socket.IO endpoint: ws://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}`);
});

// プロセス終了処理
process.on('SIGTERM', () => {
  console.log('📴 Conee Signaling Server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Conee Signaling Server shutting down...');
  server.close(() => {
    process.exit(0);
  });
});

module.exports = server;