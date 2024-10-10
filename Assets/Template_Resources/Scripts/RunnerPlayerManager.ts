import { Animator, Coroutine, GameObject, Object, Quaternion, Time, Transform, Vector3, WaitForSeconds, WaitUntil } from 'UnityEngine';
import { CharacterState, LocalPlayer, UIZepetoPlayerControl, ZepetoCamera, ZepetoCharacter, ZepetoPlayerControl, ZepetoPlayers, ZepetoScreenButton, ZepetoScreenTouchpad } from 'ZEPETO.Character.Controller'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import LeaderboardManager from '../../ZEPETO_modules/LeaderBoard/Scripts/LeaderBoardManager';
import UICommonBtn from '../../ZEPETO_modules/Product/Scripts/UICommonBtn';
import { ProductRecord, ProductService } from 'ZEPETO.Product';
import { ZepetoWorldMultiplay } from "ZEPETO.World";
import { Room, RoomData } from "ZEPETO.Multiplay";
import { InventoryRecord, InventoryService } from "ZEPETO.Inventory";
import { Button, Image, Text } from 'UnityEngine.UI';
import { InventorySync } from '../../Zepeto Multiplay Component/ZepetoScript/Common/ToolClassGather';

export default class RunnerPlayerManager extends ZepetoScriptBehaviour {

    private static instance: RunnerPlayerManager = null;
    private localPlayer: LocalPlayer;
    private localCharacter: ZepetoCharacter;
    private anim: Animator;
    private localCamera: ZepetoCamera;
    private cameraAnimaiton: Animator;
    private zepetoPlayerControl: ZepetoPlayerControl;
    private zepetoScreenTouchPad: ZepetoScreenTouchpad;
    private uiZepetoPlayerController: UIZepetoPlayerControl;
    private zepetoCameraSpeed: number;
    private isRunning: boolean = false;
    private storeRotationSpeed: number;
    private currentRunningCoroutine: Coroutine;
    private currentHighJumpCoroutine: Coroutine;
    private localPlayerShieldEffect: GameObject;
    private localPlayerResurrectEffect: GameObject;
    private isShieldTime: boolean = false;
    private startJumpPower: number;
    private starObjects: Transform[];
    private currentTrailEffect: GameObject;

    private uiCommonBtn: UICommonBtn;
    private _multiplay: ZepetoWorldMultiplay;
    private _room: Room;
    private _inventoryCache: InventoryRecord[];
    private _productCache: Map<string, ProductRecord> = new Map<string, ProductRecord>();

    public get LocalCharacter(): ZepetoCharacter { return this.localCharacter; }

    @SerializeField()
    private doubleJumpTime: number;

    @SerializeField()
    private starGroup: GameObject;

    @Header("Effect Prefabs")
    @SerializeField()
    private shieldEffect: GameObject;
    @SerializeField()
    private resurrectEffect: GameObject;
    @SerializeField()
    private trailEffect: GameObject;

    @HideInInspector()
    public startPoint: Transform;
    @HideInInspector()
    public lastSpawnPoint: Vector3 = Vector3.zero;
    @HideInInspector()
    public score: number = 0;
    @HideInInspector()
    public shieldCount: number = 0;
    @HideInInspector()
    public highJumpCount: number = 0;

    @Header("UI Reference")
    @Header("Upper Component")
    public numberStar: Text;
    public numberZem: Text;
    public numerShield: Text;
    public numberHighJump: Text;



    @Header("Score UI")
    @SerializeField() private scoreComponent: GameObject;
    @SerializeField() private scoreText: Text;

    @Header("Pop up Resurrect")
    @SerializeField() private popupResurrect: GameObject;
    @SerializeField() private buttonRessurectNo: Button;

    @Header("Pop up Finished")
    @SerializeField() private popupFinished: GameObject;
    @SerializeField() private popupFinishedScoreText: Text;
    @SerializeField() private buttonFinishedRanking: Button;
    @SerializeField() private buttonFinishedLobby: Button;

    @Header("Pop Up Ranking")
    @SerializeField() private popupRanking: GameObject;
    @SerializeField() private popupRankingDim: GameObject;

    @Header("Pop up congratulations")
    @SerializeField() private popupCongratulations: GameObject;
    @SerializeField() private popupCongratulationsScoreText: Text;
    @SerializeField() private buttonCongratulationsRanking: Button;
    @SerializeField() private buttonCongratulationsLobby: Button;

    @Header("Button High Jump")
    @SerializeField() private buttonHighJump: Button;
    @SerializeField() private imageHighJumpGaze: Image;



    public static get Instance(): RunnerPlayerManager {
        if (this.instance == null) {
            this.instance = GameObject.FindObjectOfType<RunnerPlayerManager>();
        }
        return this.instance;
    }

    Awake() {
        if (RunnerPlayerManager.instance !== null && RunnerPlayerManager.instance !== this) {
            GameObject.Destroy(this.gameObject);
        } else {
            RunnerPlayerManager.instance = this;
            GameObject.DontDestroyOnLoad(this.gameObject);
        }
    }

    Start() {

        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
            this.GetPlayerController();
        });

        this.starObjects = this.starGroup.GetComponentsInChildren<Transform>();

        this.uiCommonBtn = Object.FindObjectOfType<UICommonBtn>();

        this._multiplay = Object.FindObjectOfType<ZepetoWorldMultiplay>();
        this._multiplay.RoomJoined += (room: Room) => {
            this._room = room;

            ProductService.OnPurchaseCompleted.AddListener((product, response) => {
                this.StartCoroutine(this.RefreshInventoryUI());
            });
            this._room.AddMessageHandler<InventorySync>("SyncInventories", (message) => {
                this.StartCoroutine(this.RefreshInventoryUI());
            });
        }

        this.UIInitialize();
    }

    public StartRunning() {
        this.score = 0;
        this.lastSpawnPoint = this.startPoint.position;
        this.ActiveScoreCompoenet(true);
        this.StartCoroutine(this.CoRunningStart());
    }

    public *CoRunningStart() {

        this.isRunning = true;

        if (this.localPlayer == null) {
            return;
        } else {
            this.CameraTransition();
            yield new WaitForSeconds(1);
            this.localCharacter.Teleport(Vector3.op_Addition(this.startPoint.position, new Vector3(0, 2, 0)), Quaternion.LookRotation(this.startPoint.forward));
            this.localCamera.cameraParent.rotation = Quaternion.Euler(0, -90, 0);
        }
    }

    CameraTransition() {
        this.cameraAnimaiton.SetTrigger("start");
    }

    public RunnerOver() {
        //this.StopRunning();       
        this.BackToStart();
        this.ResetStarGroup();
        console.log("Runner over");
    }

    public RunnerClear() {
        this.StartCoroutine(this.CoRunnerClear());
    }

    private *CoRunnerClear() {
        //yield new WaitForSeconds(0.25);
        this.ActivePlayerController(false);
        this.OpenCongratulationsPopup();
        LeaderboardManager.instance.SendScore(this.score);
    }

    private ResetStarGroup() {
        this.starObjects.forEach(e => {
            e.gameObject.SetActive(true);
        });
    }

    ActiveDoubleJump() {
        // Find an object of type ZepetoScreenButton in the scene
        const screenButton = Object.FindObjectOfType<ZepetoScreenButton>();

        // Add a listener for the OnPointDownEvent of the screen button to handle jump actions
        screenButton.OnPointDownEvent.AddListener(() => {

            // If the character's current state is Jump, trigger a double jump
            if (this.localCharacter.CurrentState === CharacterState.Jump) {
                this.localCharacter.DoubleJump();
            }
        });
    }

    GetPlayerController() {
        this.ActiveDoubleJump();
        this.localPlayer = ZepetoPlayers.instance.LocalPlayer;
        this.localCharacter = this.localPlayer.zepetoPlayer.character;
        this.anim = this.localCharacter.ZepetoAnimator;
        this.localCamera = this.localPlayer.zepetoCamera;
        this.zepetoPlayerControl = Object.FindObjectOfType<ZepetoPlayerControl>();
        this.zepetoScreenTouchPad = Object.FindObjectOfType<ZepetoScreenTouchpad>();
        this.uiZepetoPlayerController = Object.FindObjectOfType<UIZepetoPlayerControl>();
        this.zepetoCameraSpeed = this.localCamera.rotationSpeed;
        this.startJumpPower = this.localCharacter.JumpPower;
        this.LoadAllItems();
        this.cameraAnimaiton = this.localCamera.GetComponentInChildren<Animator>();
    }

    LockPlayerCamera(isActive: bool) {
        if (isActive) {
            this.storeRotationSpeed = this.localCamera.rotationSpeed;
            this.localCamera.rotationSpeed = 0;

        } else {
            this.localCamera.rotationSpeed = this.storeRotationSpeed;
        }
    }

    ActivePlayerController(isActive: bool) {
        this.zepetoPlayerControl.gameObject.SetActive(isActive);
        this.zepetoScreenTouchPad.gameObject.SetActive(isActive);
        this.uiZepetoPlayerController.gameObject.SetActive(isActive);
        this.uiZepetoPlayerController.StopMoving();
        this.uiZepetoPlayerController.enabled = isActive;
    }

    public BackToStart() {
        this.ActiveScoreCompoenet(false);
        this.ActivePlayerController(true);
        this.LockPlayerCamera(false);
        this.localCharacter.Teleport(new Vector3(0, 1, 0), Quaternion.identity);
    }

    Update() {
        if (this.isRunning) {
            this.CheckPlayerfall();
        }
    }

    CheckPlayerfall() {
        if (this.localCharacter.CurrentState == 108 && this.localCharacter.transform.position.y < -100 && this.isRunning == true) {
            this.isRunning = false;
            this.ActivePlayerController(false);
            this.CheckResurrectPrice(100);
            console.log("CheckPlayerfall");
        }
    }

    public HitTrap() {
        if (this.shieldCount > 0) {
            this.UseShield();
        } else if (this.shieldCount <= 0 && !this.isShieldTime) {
            this.CheckResurrectPrice(100);
            console.log("HitTrap");
        }
    }

    CheckResurrectPrice(resurrectPrice: number) {
        this.ActivePlayerController(false);
        this.OpenResurrectPopup(resurrectPrice);
        console.log("CheckResurrectCount");
    }
    public UseResurrect() {
        this.StartCoroutine(this.CoUseResurrect());
    }

    private *CoUseResurrect() {
        console.log("CoUseResurrect()");
        this.localCharacter.Teleport(Vector3.op_Addition(this.lastSpawnPoint, new Vector3(0, 2, 0)), Quaternion.LookRotation(this.startPoint.forward));
        this.StartCoroutine(this.CoActiveShield());
        yield null;
        yield null;
        this.ActivePlayerController(true);
        this.isRunning = true;
    }

    public UseShield() {
        if (!this.isShieldTime) {
            this.StartCoroutine(this.CoActiveShield());
            if (this.shieldCount > 0) {
                this.OnClickUseInventoryItem("shield");
            }
            console.log("Use Shield");
        }
    }

    *CoActiveShield() {
        if (this.localPlayerShieldEffect == null) {
            this.localPlayerShieldEffect = GameObject.Instantiate(this.shieldEffect, this.localCharacter.gameObject.transform) as GameObject;
        }
        this.isShieldTime = true;
        this.localPlayerShieldEffect.SetActive(true);
        yield new WaitForSeconds(3);
        this.isShieldTime = false;
        this.localPlayerShieldEffect.SetActive(false);
    }

    LobbyEnter() {
        this.isRunning = false;
    }

    public AddScore() {
        this.score += 1;
        this.UpdateScoreNumber();
    }

    public UseHighJump() {
        if (this.currentHighJumpCoroutine != null || this.highJumpCount <= 0) {
            return;
        }
        this.currentHighJumpCoroutine = this.StartCoroutine(this.CoActiveHighJump());
    }

    private *CoActiveHighJump() {
        this.localCharacter.additionalJumpPower = this.startJumpPower;
        let highJumpTime = this.doubleJumpTime;

        while (highJumpTime > 0) {
            this.UpdateHighJumpGaze(highJumpTime / this.doubleJumpTime);
            highJumpTime -= Time.deltaTime;
            yield null;
        }
        this.UpdateHighJumpGaze(0);
        this.localCharacter.additionalJumpPower = 0;
        this.currentHighJumpCoroutine = null;
    }

    public ActiveTrailEffect(isActive: boolean) {
        console.log("Active Trail");
        if (this.currentTrailEffect == null) {
            this.currentTrailEffect = GameObject.Instantiate(this.trailEffect, this.localCharacter.gameObject.transform) as GameObject;
        }
        this.currentTrailEffect.SetActive(isActive);
    }


    public OnClickHighJump() {
        if (this.highJumpCount > 0) {
            this.OnClickUseInventoryItem("highjump");
        }
    }

    public AddShield() {
        this.uiCommonBtn.OnClickAddItem("shield", 1);
    }

    public AddHighJump() {
        this.uiCommonBtn.OnClickAddItem("highjump", 1);
    }

    public AddResurrect() {
        console.log("Add Resurrect");
    }

    public AddStar() {
        this.uiCommonBtn.OnClickGainBalance("star", 1);
    }

    public LoadAllItems() {
        this.StartCoroutine(this.CoLoadAllItems());
    }

    private *CoLoadAllItems() {
        const request = ProductService.GetProductsAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            request.responseData.products.forEach((pr) => {
                this._productCache.set(pr.productId, pr);
            });
        }
        this.StartCoroutine(this.RefreshInventoryUI());
    }

    private * RefreshInventoryUI() {
        const request = InventoryService.GetListAsync();
        yield new WaitUntil(() => request.keepWaiting == false);
        if (request.responseData.isSuccess) {
            const items: InventoryRecord[] = request.responseData.products;

            this._inventoryCache = items;

            items.forEach((ir) => {
                this.UpdateUI(ir.productId, ir.quantity);
                console.log(`productID: ${ir.productId}, quantity : ${ir.quantity}`);
            });
        }
    }

    private UpdateUI(productId: string, quantity: bigint) {

        console.log("productId : " + productId + "quantity : " + quantity.toString());

        switch (productId) {

            case "shield":
                this.numerShield.text = quantity.toString();
                this.shieldCount = Number(quantity);
                break;

            case "highjump":
                this.numberHighJump.text = quantity.toString();
                this.highJumpCount = Number(quantity);
                break;

            case "resurrection_zem":
                if (quantity > 0) {
                    this.OnClickResurrect();
                    this.OnClickUseInventoryItem("resurrection_zem");
                }
                break;

            case "resurrection_star":

                if (quantity > 0) {
                    this.OnClickResurrect();
                    this.OnClickUseInventoryItem("resurrection_star");
                }
                break;

            case "trail":
                if (quantity > 0) {
                    this.ActiveTrailEffect(true);
                }
                break;
        }
    }

    private OnClickUseInventoryItem(itemId: string) {

        const item = this._productCache.get(itemId);

        if (item == null) {
            console.warn("no have item data");
            return;
        }
        if (this._multiplay.Room == null) {
            console.warn("server disconnect");
            return;
        }

        const data = new RoomData();
        data.Add("productId", item.productId);
        data.Add("quantity", 1);
        this._multiplay.Room?.Send("onUseInventory", data.GetObject());
    }


    private UIInitialize() {

        this.buttonRessurectNo.onClick.AddListener(() => {
            this.OnClickResurrectNo();
        });
        this.buttonCongratulationsRanking.onClick.AddListener(() => {
            this.OnClickOpenRanking();
        });
        this.buttonCongratulationsLobby.onClick.AddListener(() => {
            this.OnClickCongratulationsLobby();
        });
        this.buttonFinishedRanking.onClick.AddListener(() => {
            this.OnClickOpenRanking();
        });
        this.buttonHighJump.onClick.AddListener(() => {
            this.OnClickHighJump();
        });
    }

    public OnClickResurrect() {
        RunnerPlayerManager.Instance.UseResurrect();
        this.popupResurrect.SetActive(false);
    }

    private OnClickResurrectNo() {
        RunnerPlayerManager.Instance.RunnerOver();
        this.popupResurrect.SetActive(false);
        this.popupFinishedScoreText.text = RunnerPlayerManager.Instance.score.toString();
        this.popupFinished.SetActive(true);
    }

    private OnClickOpenRanking() {
        this.popupRanking.SetActive(true);
        this.popupRankingDim.SetActive(true);
    }

    private OnClickCongratulationsLobby() {
        this.popupCongratulations.SetActive(false);
        RunnerPlayerManager.Instance.BackToStart();
    }

    public OpenResurrectPopup(resurrectPrice: number) {
        this.popupResurrect.SetActive(true);
    }

    public OpenCongratulationsPopup() {
        this.popupCongratulationsScoreText.text = RunnerPlayerManager.Instance.score.toString();
        this.popupCongratulations.SetActive(true);
    }

    ActiveScoreCompoenet(isActive: boolean) {
        this.scoreComponent.SetActive(isActive);
        this.UpdateScoreNumber();
    }

    UpdateScoreNumber() {
        this.scoreText.text = RunnerPlayerManager.Instance.score.toString();
    }

    ActiveHighJump(isActive: boolean) {
        this.buttonHighJump.gameObject.SetActive(isActive);
    }

    public UpdateHighJumpGaze(value: number) {
        this.imageHighJumpGaze.fillAmount = value;
    }


}