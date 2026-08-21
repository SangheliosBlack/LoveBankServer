import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import path from 'path';
import fs from 'fs';

class NotificationService {
  constructor() {
    this.firebaseEnabled = false;
    this.initFirebase();
  }

  getServiceAccount() {
    const serviceAccountPath = path.join(
      process.cwd(),
      'keys/flutter-template-b03c3-firebase_admin_sdk.json'
    );

    if (process.env.FIREBASE_KEY_B64) {
      const decoded = Buffer.from(process.env.FIREBASE_KEY_B64, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    }

    if (fs.existsSync(serviceAccountPath)) {
      const rawFile = fs.readFileSync(serviceAccountPath, 'utf-8');
      return JSON.parse(rawFile);
    }

    return null;
  }

  initFirebase() {
    try {
      if (getApps().length > 0) {
        this.firebaseEnabled = true;
        return;
      }

      const serviceAccount = this.getServiceAccount();

      if (!serviceAccount) {
        console.warn('Firebase Admin disabled: credentials not found (FIREBASE_KEY_B64 or keys JSON file).');
        return;
      }

      initializeApp({
        credential: cert(serviceAccount),
      });

      this.firebaseEnabled = true;
      console.log('Firebase Admin Initialized');
    } catch (error) {
      this.firebaseEnabled = false;
      console.error('Firebase Admin init failed. Push notifications disabled:', error.message);
    }
  }

  async sendPushToOneUser(mensaje) {
    
    if (!mensaje.tokenId) {
      throw new Error('Token ID is required');
    }

    const message = {
      token: mensaje.tokenId,
      notification: {
        title: mensaje.title,
        body: mensaje.message,
      },
      android: {
        ttl: 2419200,
        priority: 'high',
        notification: {
          channel_id: 'general_id',
          sound: 'default',
        },
      },
    };

    return this.sendMessage(message);
  }

  async sendMessage(message) {

    if (!this.firebaseEnabled) {
      console.warn('Push notification skipped: Firebase Admin is disabled.');
      return null;
    }

    try {

      const response = await getMessaging().send(message);

      console.log('Message sent:', response);

      return response;

    } catch (error) {

      console.error('Error sending message:', error);

      throw error;

    }

  }

}

export default new NotificationService();
