import './config/env';
import app from './index';
import { createServer } from 'http';

import { socketService } from './infra/realtime/socket.service';

const PORT = process.env.PORT || 4000;
const server = createServer(app);

// Initialize Sockets
socketService.init(server);

server.listen(PORT, () => {
  console.log(`My server running on address : http://localhost:${PORT}`);
});

export { server };