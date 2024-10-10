import { Collider, GameObject } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import RunnerPlayerManager from "./RunnerPlayerManager";

export default class StarController extends ZepetoScriptBehaviour {

    public effect: GameObject;

    OnTriggerEnter(collider: Collider) {

        if (RunnerPlayerManager.Instance.LocalCharacter == null || collider.gameObject != RunnerPlayerManager.Instance.LocalCharacter.gameObject) {
            return;
        } else {
            RunnerPlayerManager.Instance.AddStar();
            RunnerPlayerManager.Instance.AddScore();
            this.gameObject.SetActive(false);
        }
    }

}