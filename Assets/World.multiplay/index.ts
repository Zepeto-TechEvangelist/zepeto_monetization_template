import {Sandbox, SandboxOptions, SandboxPlayer} from "ZEPETO.Multiplay";
import { Player } from "ZEPETO.Multiplay.Schema";
import { IModule } from "./ServerModule/IModule";
import MannequinModule from "./ServerModule/Modules/MannequinModule";
import ProductModule from "./ServerModule/Modules/ProductModule";
import SyncComponentModule from "./ServerModule/Modules/SyncComponentModule";

export default class extends Sandbox {

    private readonly _modules: IModule[] = [];
    private _isCreated: boolean = false;
    
    async onCreate(options: SandboxOptions) {
        this._modules.push(new SyncComponentModule(this));
        this._modules.push(new ProductModule(this));
        this._modules.push(new MannequinModule(this));
        
        for (const module of this._modules) {
            await module.OnCreate();
        }
        this._isCreated = true;
    }

    async onJoin(client: SandboxPlayer) {
        for (const module of this._modules) {
            await module.OnJoin(client);
        }

        const player = new Player();
        player.sessionId = client.sessionId;

        if (client.userId) {
            player.zepetoUserId = client.userId;
        }
        this.state.players.set(client.sessionId, player);
        
        console.log(`join player, ${client.sessionId}`);
    }
    

    async onLeave(client: SandboxPlayer, consented?: boolean) {
        for (const module of this._modules) {
            await module.OnLeave(client);
        }
        this.state.players.delete(client.sessionId);

        console.log(`leave player, ${client.sessionId}`);
    }

    async onTick(deltaTime: number) {
        if (!this._isCreated) {
            return;
        }
        for (const module of this._modules) {
            module.OnTick(deltaTime);
        }
    }
}

