import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import { Object } from 'UnityEngine'
import { ZepetoScreenTouchpad } from 'ZEPETO.Character.Controller';
import GestureLoader from './GestureLoader';


export default class UIControllerTracker extends ZepetoScriptBehaviour {

    private gestureLoader: GestureLoader;
    public screenTouchPad: ZepetoScreenTouchpad;

    //This function runs everytime the V-Pad is enabled
    OnEnable() {
        this.gestureLoader = Object.FindObjectOfType<GestureLoader>();
        this.screenTouchPad = this.gameObject.GetComponentInChildren<ZepetoScreenTouchpad>();
        this.gestureLoader.InitScreenTouchPadListener(this.screenTouchPad);
    }
}