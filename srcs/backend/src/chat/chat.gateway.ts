import { chatController } from './chat.controller';
import { HttpException, Logger, UseGuards } from '@nestjs/common';
import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
// <<<<<<< HEAD
import { Socket, Server, Namespace } from 'socket.io';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';
import { accessJwtStrategy } from '../auth/accessJwtStrategy';
import { AuthService } from '../auth/auth.service';
//https://gabrieltanner.org/blog/nestjs-realtime-chat/

// @WebSocketGateway(3002, {
// =======
// import { Socket, Server } from 'socket.io';

//https://gabrieltanner.org/blog/nestjs-realtime-chat/

// <<<<<<< HEAD
@WebSocketGateway({
  namespace: 'dm',
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    allowedHeaders: ["Authorization"]
  }
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(private ChatService: ChatService, private authService: AuthService) { }
  private logger: Logger = new Logger('ChatGateway BRRRR');

  @WebSocketServer()
  io: Namespace;
  prisma: any;
  muted: any[];
  userId: number;

  afterInit(server: any) {
    this.logger.log('Init');
    this.muted = [];
  }

  async handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client handleConnection: ${client.handshake.headers?.authorization}`);

    const token = await this.authService.verifyToken(client.handshake.headers?.authorization);
    if (!token) {
      this.logger.log(`Client handleConnection: NOT OK`);
      client.disconnect();
    }
    this.userId = token?.userId;
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  isMuted(client: Socket, user_id: any) {
    for (let i = 0; i < this.muted.length; i++) {
      const item = this.muted[i];
      if (item.user_id === user_id) {
        if (Date.now() - item.time < parseInt(item.period) * 1000 * 60) {
          client.emit('imMuted', {
            time:
              ((parseInt(item.period) * 1000 * 60 - (Date.now() - item.time)) /
                (1000 * 60)).toFixed(2),
          });
          return true;
        }
      }
    }
    return false;
  }

  @UseGuards(accessJwtStrategy)
  @SubscribeMessage('ping') // Equivalent to socket.on('msgToServer') listening to any 'msgToServer' event
  ping(client: Socket, payload: any) {
    client.join(payload.room_id);
  }
  @SubscribeMessage('message')
  async message(client: Socket, payload: any) {


    if (!this.isMuted(client, payload.userId)) {
      this.io.to(payload.room_id).emit('recieveMessage', payload);

      const check = await this.ChatService.pushMsg(payload);
    }
  }

  @SubscribeMessage('muteUser')
  async mute(client: Socket, payload: any) {
    // this.io.to(payload.room_id).emit('recieveMessage', payload);
    this.muted.push(payload);
    // const check = await this.ChatService.pushMsg(payload);
  }

  @SubscribeMessage('blockUser')
  async block(client: Socket, payload: any) {
    // payload {
    //         user_id
    //         room_id
    // }
    this.io.emit("blockMe", payload)

  }
}

//!https://wanago.io/2021/01/25/api-nestjs-chat-websockets/
//? https://javascript.info/websocket
//? https://docs.nestjs.com/fundamentals/lifecycle-events
//? https://docs.nestjs.com/websockets/gateways
// ?https://socket.io/docs/v3/emit-cheatsheet/
//* @WebsocketGateway() declarator which gives us access to the socket.io functionality.
//* OnGatewayInit, OnGatewayConnection and OnGatewayDisconnect which we use to log some key states of our application. For example, we log when a new client connects to the server or when a current client disconnects.
//* @WebsocketServer() which gives us access to the websockets server instance.
//* @SubscribeMessage('msgToServer') makes it listen to an event named msgToServer.

//@SubscribeMessage('connection') = listen to an event named connection
//socket.on = receive
//socket.emit = send
//socket.to(room).emit = send to everyone in a room including the sender
