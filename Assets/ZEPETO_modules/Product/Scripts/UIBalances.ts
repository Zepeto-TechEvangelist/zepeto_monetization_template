import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Text, Button, InputField, Slider } from 'UnityEngine.UI'
import { Object, WaitForSeconds, WaitUntil } from 'UnityEngine'
import { BalanceListResponse, CurrencyService, CurrencyError } from "ZEPETO.Currency";
import { ProductRecord, ProductService } from "ZEPETO.Product";
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import { RoomData, Room } from "ZEPETO.Multiplay";
import RunnerPlayerManager from '../../../Template_Resources/Scripts/RunnerPlayerManager';
import { BalanceSync, Currency } from '../../../Zepeto Multiplay Component/ZepetoScript/Common/ToolClassGather';

export default class UIBalances extends ZepetoScriptBehaviour {

    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room
    private _myExp: number = 0;
    private _amountExp: number = 30;
    private _myLevel: number = 1;
    private _runnerPlayerManager: RunnerPlayerManager;

    Start() {
        this.RefreshAllBalanceUI();
        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();

        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;
            this.InitMessageHandler();
        }

        this._runnerPlayerManager = RunnerPlayerManager.Instance;
    }

    private InitMessageHandler() {
        this._room.AddMessageHandler<BalanceSync>("SyncBalances", (message) => {
            this.RefreshAllBalanceUI();
        });
        ProductService.OnPurchaseCompleted.AddListener((product, response) => {
            console.log("@@@@@ ProductService.OnPurchaseCompleted @@@@@");
            this.RefreshAllBalanceUI();
        });
    }

    private RefreshAllBalanceUI() {
        this.StartCoroutine(this.RefreshBalanceUI());
        this.StartCoroutine(this.RefreshOfficialCurrencyUI());
    }

    private *RefreshBalanceUI() {
        const request = CurrencyService.GetUserCurrencyBalancesAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            this._runnerPlayerManager.numberStar.text = request.responseData.currencies?.ContainsKey(Currency.star) ? request.responseData.currencies?.get_Item(Currency.star).toString() : "0";
        }
    }

    private *RefreshOfficialCurrencyUI() {
        const request = CurrencyService.GetOfficialCurrencyBalanceAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.currency.quantity == null) {
            return;
        }
        this._runnerPlayerManager.numberZem.text = request.responseData.currency.quantity.toString();
    }

}

