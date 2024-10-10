import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Button, Text } from 'UnityEngine.UI'
import { GameObject, Object, WaitUntil, WaitForSeconds } from 'UnityEngine'
import { ProductRecord, ProductService, ProductType, PurchaseType } from "ZEPETO.Product";
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import { Room, RoomData } from "ZEPETO.Multiplay";
import { InventoryAction, InventorySync } from '../../../Zepeto Multiplay Component/ZepetoScript/Common/ToolClassGather';

export default class UICommonBtn extends ZepetoScriptBehaviour {

    @SerializeField() private informationPref: GameObject;
    private _itemsCache: ProductRecord[] = [];
    private _itemsPackageCache: ProductRecord[] = []
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;

    private Start() {
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        // button Interval
        let allBtns: Button[] = this.GetComponentsInChildren<Button>();
        allBtns.forEach(btn => btn.onClick.AddListener(() => this.StartCoroutine(this.BtnInterval(btn))));

        this.StartCoroutine(this.LoadAllItems());

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        } 
    }

    private InitMessageHandler() {

        this._multiplay.Room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
            this.OpenInformation(`${message.productId} has been ${InventoryAction[message.inventoryAction]} in the inventory.`);
            // item use sample
            /*if(message.inventoryAction == InventoryAction.Used){
                if(message.productId == "potion1"){
                    console.log("potion use!");
                }
            }*/
        });
        this._room.AddMessageHandler<string>("DebitError", (message) => {
            this.OpenInformation(message);
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            this.OpenInformation(`${response.productId} Purchase Completed`);
        });
        ProductService.OnPurchaseFailed.AddListener((product, response) => {
            this.OpenInformation(response.message);
        });
    }

    private * LoadAllItems() {
        const request = ProductService.GetProductsAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            this._itemsCache = [];
            request.responseData.products.forEach((pr) => {
                if (pr.ProductType == ProductType.Item) {
                    this._itemsCache.push(pr);
                }
                if (pr.ProductType == ProductType.ItemPackage) {
                    this._itemsPackageCache.push(pr);
                }
            });

            if (this._itemsCache.length == 0) {
                console.warn("no Item information");
                return;
            }
        }
        else {
            console.warn("Product Load Failed");
        }
    }

    private OpenInformation(message: string) {
        const inforObj = GameObject.Instantiate(this.informationPref, this.transform.parent) as GameObject;
        inforObj.GetComponentInChildren<Text>().text = message;
    }

    public OnClickGainBalance(currencyId: string, quantity: number) {
        const data = new RoomData();
        data.Add("currencyId", currencyId);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onCredit", data.GetObject());
    }

    public OnClickUseBalance(currencyId: string, quantity: number) {
        const data = new RoomData();
        data.Add("currencyId", currencyId);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onDebit", data.GetObject());
    }

    public OnClickAddItem(productID: string, quantity: number) {
        const data = new RoomData();
        data.Add("productId", productID);
        data.Add("quantity", quantity);
        this._multiplay.Room?.Send("onAddInventory", data.GetObject());
    }

    private OnClickAcquireRandomItem() {
        if (this._itemsCache.length == 0) {
            console.warn("Item cache has not yet been loaded.");
            return;
        }

        // Choose one of the consumable items.
        const consumableItem: ProductRecord[] = [];
        this._itemsCache.forEach((pr) => {
            if (pr.PurchaseType == PurchaseType.Consumable)
                consumableItem.push(pr);
        });

        const randNum = Math.floor(Math.random() * consumableItem.length);
        const randItem = consumableItem[randNum];

        const data = new RoomData();
        data.Add("productId", randItem.productId);
        data.Add("quantity", 1);
        this._multiplay.Room?.Send("onAddInventory", data.GetObject());
    }

    // an immediate purchase
    private * OnClickPurchaseItemImmediately(productId: string) {
        const request = ProductService.PurchaseProductAsync(productId);
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            // is purchase success
        } else {
            // is purchase fail
        }
    }

    // open offical ui
    private OnClickPurchaseItem(productRecord: ProductRecord) {
        ProductService.OpenPurchaseUI(productRecord);
    }

    private * BtnInterval(btn: Button) {
        btn.interactable = false;
        yield new WaitForSeconds(0.2);

        btn.interactable = true;
    }
}

