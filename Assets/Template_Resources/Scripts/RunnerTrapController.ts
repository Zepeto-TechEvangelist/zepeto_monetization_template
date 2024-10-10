import { Collider, Coroutine, GameObject, Quaternion, Vector3, WaitForSeconds } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import RunnerPlayerManager from "./RunnerPlayerManager";

export default class RunnerTrapController extends ZepetoScriptBehaviour {

    private runnerManager: RunnerPlayerManager;
    public effect: GameObject;

    Start() {
        this.runnerManager = RunnerPlayerManager.Instance;
    }

    OnTriggerEnter(collider: Collider) {

        if (RunnerPlayerManager.Instance.LocalCharacter == null || collider.gameObject != RunnerPlayerManager.Instance.LocalCharacter.gameObject) {
            return;
        } else {
            this.runnerManager.HitTrap();
            console.log("Hit Trap");
        }
    }
}