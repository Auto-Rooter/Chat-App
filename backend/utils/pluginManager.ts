import {Application} from 'express';
import {Server} from 'socket.io';
import {Plugin} from '../types/plugin';

export class PluginManager {
    private plugins: Plugin[] = [];

    register(plugin: Plugin){
        this.plugins.push(plugin);
    }

    initializePlugins(app: Application, ioServer: Server){
        this.plugins.forEach(plugin => plugin.initialize(app, ioServer));
    }
}