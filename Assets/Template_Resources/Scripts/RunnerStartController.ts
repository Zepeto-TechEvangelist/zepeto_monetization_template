import { Collider, Transform } from "UnityEngine";
import { ZepetoScriptBehaviour } from "ZEPETO.Script";
import RunnerPlayerManager from "./RunnerPlayerManager";

export default class RunnerStartController extends ZepetoScriptBehaviour {

    private runnerPlayerManager: RunnerPlayerManager;
    public StartPoint: Transform;

    Start(){
        this.runnerPlayerManager = RunnerPlayerManager.Instance;
    }

    OnTriggerEnter(collider: Collider) {

        if (this.runnerPlayerManager.LocalCharacter == null || collider.gameObject != this.runnerPlayerManager.LocalCharacter.gameObject) {
            return;
        } else {
            this.runnerPlayerManager.startPoint = this.StartPoint;
            this.runnerPlayerManager.StartRunning();
        }
    }

}