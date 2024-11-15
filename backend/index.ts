import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser'; 
import { config } from './utils/config';
import authRoutes from './routes/auth.routes';
import messageRoutes from './routes/message.routes';
import { initializeSocket } from './services/socket';
import {errorHandler} from './middlewares/errorHandler';
import { PluginManager } from './utils/pluginManager';
import { ChatbotDemoPlugin } from './plugins/chatbotPlugin';

const app = express();
const server = http.createServer(app);
const corsConfig = {
  origin: config.corsOrigin,
  credentials: true,
};
const io = initializeSocket(server);

// Register the PluginManager
const pluginManager = new PluginManager();
pluginManager.register(new ChatbotDemoPlugin());
pluginManager.initializePlugins(app, io);

app.use(cors(corsConfig));
app.use(express.json());
app.use(cookieParser()); // to extract JWT refreshToken from the cookie
app.use('/auth', authRoutes);
app.use('/', messageRoutes); 


app.use(errorHandler);

server.listen(config.port, () => {
  console.log(`[+] Server running on: http://localhost:${config.port}`);
});

export {io};
