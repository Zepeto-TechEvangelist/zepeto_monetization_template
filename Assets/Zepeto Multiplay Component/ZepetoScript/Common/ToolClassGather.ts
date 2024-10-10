import { GameObject, Object } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Content } from 'ZEPETO.World';

export default class ToolClassGather extends ZepetoScriptBehaviour {

    public TfHelpers: any[] = [];
    public DtHelpers: any[] = [];
    public AnimHelper: any[] = [];

    public ZPMGestureAPIContents:Map<string,Content> =  new Map<string, Content>();

    private static _instance: ToolClassGather;
    public static get Instance(): ToolClassGather {
        return ToolClassGather._instance;
    }

    Awake() {
        ToolClassGather._instance = this;
    }

}

export interface BalanceSync {
    currencyId: string,
    quantity: number,
}

export enum Currency {
    star = "star"
}

export interface InventorySync {
    productId: string,
    inventoryAction: InventoryAction,
}

export enum InventoryAction {
    Removed = -1,
    Used,
    Added,
}
