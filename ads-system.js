// ads-system.js

import firebase from 'firebase/app';
import 'firebase/database';

// Firebase Realtime Database reference
const database = firebase.database();

// Class to manage ads display and counter
class AdsSystem {
    constructor() {
        this.currentAdIndex = 0;
        this.adminAds = [];
        this.systemAdsEnabled = true;
        this.adsCompleted = false;
    }

    // Fetch admin ads for a specific software from Firebase
    async fetchAdminAds(softwareId) {
        try {
            const snapshot = await database.ref(`softs/${softwareId}/adminAds`).once('value');
            this.adminAds = snapshot.val() || [];
            return this.adminAds;
        } catch (error) {
            console.error('Error fetching admin ads:', error);
            return [];
        }
    }

    // Display admin ad popup (Image, Video, or Registration)
    displayAdminAdPopup(ad) {
        return new Promise((resolve) => {
            const popup = document.createElement('div');
            popup.id = 'admin-ad-popup';
            popup.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;

            let content = '';
            
            if (ad.type === 'video') {
                content = `
                    <div style="background: white; border-radius: 10px; padding: 20px; max-width: 500px; text-align: center;">
                        <video width="100%" controls style="border-radius: 10px;">
                            <source src="${ad.content}" type="video/mp4">
                        </video>
                        <p>${ad.title || 'Advertisement'}</p>
                        <button id="close-ad-btn" style="padding: 10px 20px; background: #00ff88; border: none; border-radius: 5px; cursor: pointer;">Close</button>
                    </div>
                `;
            } else if (ad.type === 'image') {
                content = `
                    <div style="background: white; border-radius: 10px; padding: 20px; max-width: 500px; text-align: center;">
                        <img src="${ad.content}" style="width: 100%; border-radius: 10px;">
                        <p>${ad.title || 'Advertisement'}</p>
                        ${ad.redirectUrl ? `<a href="${ad.redirectUrl}" target="_blank" style="padding: 10px 20px; background: #00ff88; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; color: black; font-weight: bold;">Visit</a>` : ''}
                        <button id="close-ad-btn" style="margin-left: 10px; padding: 10px 20px; background: #999; border: none; border-radius: 5px; cursor: pointer;">Skip</button>
                    </div>
                `;
            } else if (ad.type === 'registration') {
                content = `
                    <div style="background: white; border-radius: 10px; padding: 20px; max-width: 500px; text-align: center;">
                        <h3>${ad.title || 'Sign Up Required'}</h3>
                        <p>${ad.description || 'Please complete this registration to continue'}</p>
                        <a href="${ad.redirectUrl}" target="_blank" style="padding: 10px 20px; background: #00ff88; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; color: black; font-weight: bold; display: inline-block;">Register Now</a>
                        <button id="close-ad-btn" style="margin-left: 10px; padding: 10px 20px; background: #999; border: none; border-radius: 5px; cursor: pointer;">Skip</button>
                    </div>
                `;
            }

            popup.innerHTML = content;
            document.body.appendChild(popup);

            document.getElementById('close-ad-btn').addEventListener('click', () => {
                popup.remove();
                resolve();
            });
        });
    }

    // Load Adsterra system ads
    loadAdsterraAds() {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://a.adsterra.com/code/adsterra.js';
            script.async = true;
            script.onload = () => {
                resolve();
            };
            document.head.appendChild(script);
        });
    }

    // Display system ads (Adsterra)
    displaySystemAds() {
        return new Promise((resolve) => {
            const adsContainer = document.createElement('div');
            adsContainer.id = 'system-ads-container';
            adsContainer.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 10px;
                z-index: 9998;
                text-align: center;
            `;

            adsContainer.innerHTML = `
                <p>Loading advertisement...</p>
                <div id="adsterra-ad"></div>
                <button id="close-system-ads" style="padding: 10px 20px; background: #00ff88; border: none; border-radius: 5px; cursor: pointer; margin-top: 10px;">Continue</button>
            `;

            document.body.appendChild(adsContainer);

            this.loadAdsterraAds().then(() => {
                document.getElementById('close-system-ads').addEventListener('click', () => {
                    adsContainer.remove();
                    resolve();
                });
            });
        });
    }

    // Process ads flow: Admin ads first, then system ads
    async processAdsFlow(softwareId) {
        this.adsCompleted = false;

        const adminAds = await this.fetchAdminAds(softwareId);

        if (adminAds && adminAds.length > 0) {
            for (let i = 0; i < adminAds.length; i++) {
                const ad = adminAds[i];
                console.log(`Displaying admin ad ${i + 1} of ${adminAds.length}`);
                await this.displayAdminAdPopup(ad);
            }
        }

        console.log('Displaying system ads (Adsterra)');
        await this.displaySystemAds();

        this.adsCompleted = true;
        console.log('All ads completed. Ready to download.');
    }

    isAdsCompleted() {
        return this.adsCompleted;
    }
}

export default AdsSystem;