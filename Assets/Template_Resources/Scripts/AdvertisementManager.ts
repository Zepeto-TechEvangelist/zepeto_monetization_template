import { Button } from 'UnityEngine.UI';
import { AdShowResult, WorldAdvertisement } from 'ZEPETO.Advertisement.General';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script';
import RunnerPlayerManager from './RunnerPlayerManager';

const AD_KEY: string = "Monetize_Template";

export default class AdvertisementManager extends ZepetoScriptBehaviour {

    // Declaring an array of Button objects to handle resurrect button interactions
    public buttonResurrects: Button[];

    public buttonHighJump: Button;

    // Method to reward the user with an additional shield
    rewardAddShield() {
        RunnerPlayerManager.Instance.AddShield();
    }

    // Method to reward the user with a high jump ability
    rewardAddHighJump() {
        RunnerPlayerManager.Instance.AddHighJump();
    }

    // Method to reward the user with a resurrection action and log the reward provision
    rewardUserResurrect() {
        RunnerPlayerManager.Instance.OnClickResurrect();
        console.log("Reward provided to the user.");
    }

    // Unity's Start method, which is called on the script's initialization
    Start() {

        // Adding click event listeners to each resurrection button
        this.buttonResurrects.forEach(button => {
            button.onClick.AddListener(() => {

                // Show an advertisement and call rewardUserResurrect upon successful ad completion
                this.ShowAd(this.rewardUserResurrect);
            });
        });

        this.buttonHighJump.onClick.AddListener(() => {
            this.ShowAd(this.rewardAddHighJump);
            //this.rewardAddHighJump();
        });
    }

    // Method to show an advertisement and specify a reward function to call upon ad completion
    ShowAd(rewardFunction: () => void) {
        WorldAdvertisement.Show(
            AD_KEY, // Using the defined advertisement key
            result => this.OnAdShowResult(result, rewardFunction) // Handling the ad result and specifying the reward function
        );
    }

    // Method to handle the result of the advertisement show
    OnAdShowResult(result: AdShowResult, rewardFunction: () => void) {
        if (result === AdShowResult.Finished) {
            // If the ad was successfully watched to completion
            console.log("Ad show successful; Finished.");
            rewardFunction(); // Call the specified reward function
            return;
        }

        // Variable to store the failure message
        let failMessage: string;
        // Determine the appropriate failure message based on the ad result
        switch (result) {
            case AdShowResult.Failed:
                failMessage = "Failed";
                break;
            case AdShowResult.Skipped:
                failMessage = "Skipped";
                break;
            case AdShowResult.NotReady:
                failMessage = "NotReady";
                break;
            default:
                failMessage = "Unknown result";
                break;
        }
        // Log the failure message
        console.log(`Ad show failed; ${failMessage}.`);
    }
}
