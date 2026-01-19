// import { ISocket } from 'db://assets/base/script/socket/ISocket';
// import { SocketEvent } from 'db://assets/base/script/socket/SocketEvent';
// import { SocketManager } from 'db://assets/base/script/socket/SocketManager';
// import { fakeData } from './fakeData';
// // import { fakeData } from "./fakeData";

// /**
//  * 假Server範本
//  * 遊戲自行複製FakeSocketTemplate.ts到script目錄使用(不要複製.meta避免uuid衝突)
//  * 然後在Game.ts內寫上 SocketManager.getInstance().fakeSocket = new FakeSocketTemplate(); 指定FakeSocket
//  */
// export class FakeSocketTemplate implements ISocket {
//   /**
//    * 實現connect接口
//    * @param url
//    */
//   connect(url: string): void {
//     //一定要發open事件, 模擬連線完成
//     SocketEvent.open.emit();
//   }

//   /**
//    * 底層連線完成後, 會開始發LoginCall過來, 就可以自行模擬封包或發事件觸發演示流程
//    * @param msg
//    */
//   send(uint8: Uint8Array): void {
//     const header = s5g.game.proto.Header.decode(uint8);

//     //也可以用此方法取得receiveMessageList, 再找出對應的handler
//     let receiveMessageList = SocketManager.getInstance()['receiveMessageList'];

//     //方法一：模擬LoginRecall
//     if (header.msgid == s5g.game.proto.EMSGID.eLoginCall) {
//       let fakeLoginRecall: s5g.game.proto.ILoginRecall = new s5g.game.proto.LoginRecall();
//       // 設定假資料
//       fakeLoginRecall = JSON.parse(JSON.stringify(fakeData.login));
//       // console.log('發送LoginRecall', fakeLoginRecall);
//       // 發送假資料
//       let buffer = s5g.game.proto.LoginRecall.encode(fakeLoginRecall).finish();
//       receiveMessageList[0].decode(buffer);
//     } else if (header.msgid == s5g.game.proto.EMSGID.eConfigCall) {
//       let fakeConfigRecall: s5g.game.proto.IConfigRecall = new s5g.game.proto.ConfigRecall();
//       // 設定假資料
//       fakeConfigRecall = JSON.parse(JSON.stringify(fakeData.config));
//       // console.log('發送ConfigRecall', fakeConfigRecall);
//       // 發送假資料
//       let buffer = s5g.game.proto.ConfigRecall.encode(fakeConfigRecall).finish();
//       receiveMessageList[1].decode(buffer);
//     } else if (header.msgid == s5g.game.proto.EMSGID.eStripsCall) {
//       let fakeStripsRecall: s5g.game.proto.IStripsRecall = new s5g.game.proto.StripsRecall();
//       // 設定假資料
//       fakeStripsRecall = JSON.parse(JSON.stringify(fakeData.strips));
//       // console.log('發送StripsRecall', fakeStripsRecall);
//       // 發送假資料
//       let buffer = s5g.game.proto.StripsRecall.encode(fakeStripsRecall).finish();
//       receiveMessageList[2].decode(buffer);
//     }
//     //方法二：發自定義事件
//     else if (header.msgid == s5g.game.proto.EMSGID.eResultCall) {
//       // 模擬 ResultRecall 回應
//       let fakeResultRecall: s5g.game.proto.IResultRecall = new s5g.game.proto.ResultRecall();
//       // 設定假資料
//       fakeResultRecall = JSON.parse(JSON.stringify(fakeData.result));
//       // console.log('發送ResultRecall', fakeResultRecall);
//       // 發送假資料
//       let buffer = s5g.game.proto.ResultRecall.encode(fakeResultRecall).finish();
//       receiveMessageList[3].decode(buffer); // ResultRecall 是第3個註冊的
//     } else if (header.msgid == s5g.game.proto.EMSGID.eStateCall) {
//       //不做事
//     }
//   }
// }
