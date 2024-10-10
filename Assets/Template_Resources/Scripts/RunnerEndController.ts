import { Collider, Coroutine, GameObject, Quaternion, Vector3, WaitForSeconds } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import RunnerPlayerManager from "./RunnerPlayerManager";

export default class RunnerEndController extends ZepetoScriptBehaviour {

    private runnerPlayerManager: RunnerPlayerManager;
    public effect: GameObject;

    Start() {
        this.runnerPlayerManager = RunnerPlayerManager.Instance;
    }

    OnTriggerEnter(collider: Collider) {

        if (RunnerPlayerManager.Instance.LocalCharacter == null || collider.gameObject != RunnerPlayerManager.Instance.LocalCharacter.gameObject) {
            return;
        } else {
            this.runnerPlayerManager.RunnerClear();
            this.StartCoroutine(this.CoActiveConfetti());
        }
    }
    *CoActiveConfetti(){
        this.effect.SetActive(true);
        yield new WaitForSeconds(5);
        this.effect.SetActive(false);
    }


}