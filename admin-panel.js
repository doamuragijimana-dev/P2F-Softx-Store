// admin-panel.js

// Import Firebase SDK
import firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/database';

// Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references to Firebase services
const storage = firebase.storage();
const database = firebase.database();

// Function to upload file to Firebase Storage
function uploadFile(file) {
    return new Promise((resolve, reject) => {
        const storageRef = storage.ref('uploads/' + file.name);
        const uploadTask = storageRef.put(file);
        
        uploadTask.on('state_changed', (snapshot) => {
            // Track upload progress
        }, (error) => {
            reject(error);
        }, () => {
            // File uploaded successfully
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                resolve(downloadURL);
            });
        });
    });
}

// Function to add software to Realtime Database
async function addSoftware(name, version, downloadURL) {
    const softwareRef = database.ref('software');
    const newSoftwareRef = softwareRef.push();
    
    await newSoftwareRef.set({
        name: name,
        version: version,
        downloadURL: downloadURL
    });
}

// Function to add custom ad to Realtime Database
async function addAd(title, imageURL) {
    const adsRef = database.ref('ads');
    const newAdRef = adsRef.push();
    
    await newAdRef.set({
        title: title,
        imageURL: imageURL
    });
}

// Example usage
document.getElementById('softwareForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const softwareName = document.getElementById('softwareName').value;
    const softwareVersion = document.getElementById('softwareVersion').value;
    const fileInput = document.getElementById('fileUpload').files[0];

    try {
        const fileURL = await uploadFile(fileInput);
        await addSoftware(softwareName, softwareVersion, fileURL);
        alert('Software added successfully!');
    } catch (error) {
        console.error('Error adding software:', error);
    }
});

document.getElementById('adForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const adTitle = document.getElementById('adTitle').value;
    const adImageInput = document.getElementById('adImageUpload').files[0];

    try {
        const imageURL = await uploadFile(adImageInput);
        await addAd(adTitle, imageURL);
        alert('Ad added successfully!');
    } catch (error) {
        console.error('Error adding ad:', error);
    }
});
