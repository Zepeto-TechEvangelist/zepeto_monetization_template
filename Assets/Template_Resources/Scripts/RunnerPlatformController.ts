import { Collider, Coroutine, GameObject, Quaternion, Vector3, WaitForSeconds } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import RunnerPlayerManager from "./RunnerPlayerManager";

export default class RunnerEndController extends ZepetoScriptBehaviour {

    private runnerManager: RunnerPlayerManager;

    Start() {
        this.runnerManager = RunnerPlayerManager.Instance;
    }

    OnTriggerEnter(collider: Collider) {

        if (RunnerPlayerManager.Instance.LocalCharacter == null || collider.gameObject != RunnerPlayerManager.Instance.LocalCharacter.gameObject) {
            return;
        } else {
            this.runnerManager.lastSpawnPoint = this.transform.position;
        }
    }

}