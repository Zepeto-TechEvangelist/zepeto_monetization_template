import { GameObject, Object, Texture, Texture2D, Sprite, Rect, Vector2 } from 'UnityEngine';
import { Button, Image, RawImage, Text } from 'UnityEngine.UI';
import { ErrorCode } from 'ZEPETO.Module';
import { GiftBackgroundType, ItemGiftResponse, ShopService } from 'ZEPETO.Module.Shop';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { Users, WorldService, ZepetoWorldHelper } from 'ZEPETO.World';
import PlayerSync from '../../Zepeto Multiplay Component/ZepetoScript/Player/PlayerSync';
import * as UnityEngine from 'UnityEngine';
import InteractionIcon from '../../ZEPETO_modules/Interaction/Scripts/InteractionIcon';

export default class GiftManager extends ZepetoScriptBehaviour {

    @Header("Gift Information")
    public itemId: string;

    @Header("Gift Popup UI")
    public popupGift: GameObject;
    public ItemImage: RawImage;
    public scrollObject: GameObject;
    public userListPrefab: GameObject;
    public imageEmpty: GameObject;
    public buttonClose: Button;

    private currentUserListObject: Map<string, GameObject> = new Map<string, GameObject>;
    private interactionIcon: InteractionIcon;

    Start() {
        this.interactionIcon = this.GetComponent<InteractionIcon>();

        this.interactionIcon.OnClickEvent.AddListener(() => {
            this.interactionIcon.HideIcon();
            this.StartCoroutine(this.CoCheckAndBuildUserList());
            this.popupGift.SetActive(true);
        });

        this.buttonClose.onClick.AddListener(() => {
            this.interactionIcon.ShowIcon();
        });

        this.StartCoroutine(this.DownloadItemTexture());
    }

    *CoCheckAndBuildUserList() {

        // const players = Object.FindObjectsOfType<PlayerSync>();
        // const existingUsers = new Set<string>(this.currentUserListObject.keys());
        // for (const player of players) {
        //     if (WorldService.userId != player.player.zepetoUserId && !this.currentUserListObject.has(player.player.zepetoUserId)) {
        //         const newGameObject = GameObject.Instantiate(this.userListPrefab, this.scrollObject.transform) as GameObject;
        //         this.SetUserInfo(newGameObject, player.player.zepetoUserId);
        //         this.currentUserListObject.set(player.player.zepetoUserId, newGameObject);
        //         this.imageEmpty.SetActive(false);
        //     }
        //     // 처리된 유저는 셋에서 제거
        //     existingUsers.delete(player.player.zepetoUserId);
        // }
        // // players 배열에 없는 유저들을 맵에서 제거
        // for (const userId of existingUsers) {
        //     Object.Destroy(this.currentUserListObject.get(userId));
        // }
        // if(this.scrollObject.transform.childCount == 0){
        //     this.imageEmpty.SetActive(true);
        // }else{
        //     this.imageEmpty.SetActive(false);
        // }

        this.currentUserListObject.forEach(e => {
            Object.Destroy(e);
        });

        const players = Object.FindObjectsOfType<PlayerSync>();
        this.currentUserListObject = new Map<string, GameObject>();

        for (const player of players) {
            if (WorldService.userId != player.player.zepetoUserId && !this.currentUserListObject.has(player.player.zepetoUserId)) {
                const newGameObject = GameObject.Instantiate(this.userListPrefab, this.scrollObject.transform) as GameObject;
                this.SetUserInfo(newGameObject, player.player.zepetoUserId);
                this.currentUserListObject.set(player.player.zepetoUserId, newGameObject);
                this.imageEmpty.SetActive(false);
            }
        }
        yield null;

        if (this.scrollObject.transform.childCount == 0) {
            this.imageEmpty.SetActive(true);
        } else {
            this.imageEmpty.SetActive(false);
        }
    }

    SetUserInfo(userObject: GameObject, userId: string) {

        const text = userObject.GetComponentsInChildren<Text>();
        text.forEach(e => {
            if (e.name == "TextUserName") {
                this.GetUserName(userId, e);
            }
        });

        const profileImages = userObject.GetComponentsInChildren<Image>();
        profileImages.forEach(e => {
            if (e.name == "ProfileImage") {
                this.GetProfileTexture(userId, e);
            }
        });

        const btn = userObject.GetComponentInChildren<Button>();
        btn.onClick.AddListener(() => {
            this.OnClickSendGift(userId, this.itemId);
        })
    }

    GetUserName(userId, text: Text) {
        const ids: string[] = [userId];
        ZepetoWorldHelper.GetUserInfo(ids, (info: Users[]) => {
            for (let i = 0; i < info.length; i++) {
                text.text = info[i].name;
                //console.log(`userId : ${info[i].userOid}, name : ${info[i].name}, zepetoId : ${info[i].zepetoId}`);
            }
        }, (error) => {
            console.log(error);
        });

    }

    GetProfileTexture(userId: string, image: Image) {

        ZepetoWorldHelper.GetProfileTexture(userId, (texture: Texture) => {
            image.sprite = this.GetSprite(texture);
        }, (error) => {
            console.log(error);
        });
    }

    GetSprite(texture: Texture) {
        let rect: Rect = new Rect(0, 0, texture.width, texture.height);
        return Sprite.Create(texture as Texture2D, rect, new Vector2(0.5, 0.5));
    }

    OnClickSendGift(userId: string, itemId: string) {

        ShopService.ShowGiftPopup(
            itemId,
            userId,
            GiftBackgroundType.Type01,
            "Hi This is for you!",
            (response: ItemGiftResponse) => {  // onComplete callback
                console.log(`Gift sent successfully! ZEPETO Coin Balance ${response.coin}, ZEM Balance ${response.zem}`);
            },
            (error: ErrorCode) => {  // onFailure callback
                console.error("Error sending gift:", error);
            }
        );
    }

    *DownloadItemTexture() {
        // Download thumbnail texture for the specified item code
        var request = ShopService.DownloadItemThumbnail(this.itemId);

        yield new UnityEngine.WaitUntil(() => request.keepWaiting == false);

        if (request.responseData.isSuccess) {
            this.ItemImage.texture = request.responseData.texture;
        }
    }

}