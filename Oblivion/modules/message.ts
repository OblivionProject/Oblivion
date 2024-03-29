export {MESSAGE_TYPE as MESSAGE_TYPE}
export {Message as Message}
export {verifyMessageFormat as verifyMessageFormat}

enum MESSAGE_TYPE {
  info = 'info',  // Informational messages
  chat = 'chat',  // User chat messages
  error = 'error'  // Error messages
}

interface Message {
  type: MESSAGE_TYPE;
  timestamp: string;
  data: string;
  broadcast: boolean;
  senderId: number;
  recipientId?: number;
}

// Check a data variable and see if it is message compatible
function verifyMessageFormat(data: any): boolean {
  return (
    typeof data.type === 'string'
    && typeof data.timestamp === 'string'
    && typeof data.data === 'string'
    && typeof data.broadcast === 'boolean'
    && typeof data.senderId === 'number'
    && (!data.broadcast) ? (typeof data.recipientId === 'number') : true
  );
}
