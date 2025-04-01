
// Support Script Translation System
document.addEventListener('DOMContentLoaded', function() {
  initializeTranslator();
});

// Available languages for translation
const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' }
];

// Translation database - simple key-value pairs for demo
// In a real application, this would be more extensive or use an actual translation API
const TRANSLATIONS = {
  // Greeting
  'Hello! This is [Discord Name]. How can we help you today?': {
    'es': '¡Hola! Soy [Discord Name]. ¿Cómo podemos ayudarte hoy?',
    'fr': 'Bonjour! Je suis [Discord Name]. Comment pouvons-nous vous aider aujourd\'hui?',
    'de': 'Hallo! Hier ist [Discord Name]. Wie können wir Ihnen heute helfen?'
  },
  // Issue Acknowledgment
  'Hello! This is [Discord Name]. I\'m glad to help you with your issue. Let\'s take a look!': {
    'es': '¡Hola! Soy [Discord Name]. Me alegra poder ayudarte con tu problema. ¡Vamos a echarle un vistazo!',
    'fr': 'Bonjour! Je suis [Discord Name]. Je suis heureux de vous aider avec votre problème. Jetons un coup d\'œil!',
    'de': 'Hallo! Hier ist [Discord Name]. Ich helfe Ihnen gerne bei Ihrem Problem. Schauen wir mal!'
  },
  // Requesting Evidence
  'That\'s new! I believe there might be a mistake or something done wrong on your end. Let\'s explore this further. Could you please provide a video or stream of the issue?': {
    'es': '¡Eso es nuevo! Creo que podría haber un error o algo mal hecho por tu parte. Exploremos esto más a fondo. ¿Podrías proporcionar un video o transmisión del problema?',
    'fr': 'C\'est nouveau! Je crois qu\'il pourrait y avoir une erreur ou quelque chose de mal fait de votre côté. Explorons cela plus en détail. Pourriez-vous fournir une vidéo ou un stream du problème?',
    'de': 'Das ist neu! Ich glaube, es könnte ein Fehler sein oder etwas falsch gemacht worden sein. Lassen Sie uns das genauer untersuchen. Könnten Sie bitte ein Video oder einen Stream des Problems bereitstellen?'
  },
  // Common Issue Response
  'I see this is a common issue. Let me guide you through the steps to fix it.': {
    'es': 'Veo que este es un problema común. Permíteme guiarte a través de los pasos para solucionarlo.',
    'fr': 'Je vois que c\'est un problème courant. Laissez-moi vous guider à travers les étapes pour le résoudre.',
    'de': 'Ich sehe, dass dies ein häufiges Problem ist. Lassen Sie mich Sie durch die Schritte führen, um es zu beheben.'
  },
  // Escalation Response
  'Thank you for your patience. I\'ll raise this to our developers\' team.': {
    'es': 'Gracias por tu paciencia. Elevaré esto a nuestro equipo de desarrolladores.',
    'fr': 'Merci pour votre patience. Je vais soumettre ce problème à notre équipe de développeurs.',
    'de': 'Vielen Dank für Ihre Geduld. Ich werde dies an unser Entwicklerteam weiterleiten.'
  },
  // Closing (Individual)
  'I\'m glad I was able to assist you with your issue! Thank you for reaching out, and have a great day!': {
    'es': '¡Me alegra haber podido ayudarte con tu problema! Gracias por comunicarte, ¡y que tengas un buen día!',
    'fr': 'Je suis ravi d\'avoir pu vous aider avec votre problème ! Merci de nous avoir contactés et passez une excellente journée !',
    'de': 'Ich freue mich, dass ich Ihnen bei Ihrem Problem helfen konnte! Vielen Dank für Ihre Anfrage und einen schönen Tag noch!'
  },
  // Closing (Team)
  'We\'re glad we were able to assist you with your issue! Thank you for reaching out, and have a great day! This ticket will be closed shortly.': {
    'es': '¡Nos alegra haber podido ayudarte con tu problema! Gracias por comunicarte, ¡y que tengas un buen día! Este ticket se cerrará en breve.',
    'fr': 'Nous sommes ravis d\'avoir pu vous aider avec votre problème ! Merci de nous avoir contactés et passez une excellente journée ! Ce ticket sera bientôt fermé.',
    'de': 'Wir freuen uns, dass wir Ihnen bei Ihrem Problem helfen konnten! Vielen Dank für Ihre Anfrage und einen schönen Tag noch! Dieses Ticket wird in Kürze geschlossen.'
  },
  // VIP Information
  'For VIP access, you can support our community through a donation! There is no fixed donation amount; you decide, so please feel free to donate whatever it is worth to you.': {
    'es': '¡Para acceso VIP, puedes apoyar a nuestra comunidad a través de una donación! No hay una cantidad fija de donación; tú decides, así que siéntete libre de donar lo que valga para ti.',
    'fr': 'Pour l\'accès VIP, vous pouvez soutenir notre communauté par un don ! Il n\'y a pas de montant fixe pour le don ; c\'est vous qui décidez, alors n\'hésitez pas à donner ce que cela vaut pour vous.',
    'de': 'Für VIP-Zugang können Sie unsere Community durch eine Spende unterstützen! Es gibt keinen festen Spendenbetrag; Sie entscheiden, also spenden Sie bitte frei, was es Ihnen wert ist.'
  }
};

function initializeTranslator() {
  // Add translation selector to each template card
  const templateCards = document.querySelectorAll('.template-card');
  
  templateCards.forEach((card, index) => {
    // Create language selector
    const languageSelector = document.createElement('div');
    languageSelector.className = 'language-selector';
    languageSelector.innerHTML = `
      <label for="lang-select-${index}">Translate to:</label>
      <select id="lang-select-${index}" class="lang-select" data-card-index="${index}">
        <option value="en" selected>English (Original)</option>
        ${AVAILABLE_LANGUAGES.filter(lang => lang.code !== 'en').map(lang => 
          `<option value="${lang.code}">${lang.name}</option>`
        ).join('')}
      </select>
    `;
    
    // Add translate button
    const contentDiv = card.querySelector('.template-content');
    if (contentDiv) {
      // Save original content for reverting
      const originalParagraphs = Array.from(contentDiv.querySelectorAll('p, li')).map(el => {
        return { element: el, originalText: el.textContent };
      });
      
      // Store original content on the card for later use
      card.dataset.originalContent = JSON.stringify(originalParagraphs.map(item => item.originalText));
      
      // Add the language selector before the button
      const copyButton = contentDiv.querySelector('.copy-template');
      if (copyButton) {
        contentDiv.insertBefore(languageSelector, copyButton);
      } else {
        contentDiv.appendChild(languageSelector);
      }
      
      // Add event listener for language change
      const select = languageSelector.querySelector('select');
      select.addEventListener('change', function() {
        translateCardContent(card, this.value);
      });
    }
  });
  
  // Add translation status indicator to scripts section
  const scriptsSection = document.getElementById('scripts');
  if (scriptsSection) {
    const translationStatus = document.createElement('div');
    translationStatus.className = 'translation-status';
    translationStatus.innerHTML = `
      <div class="translation-info">
        <i class="fas fa-globe"></i> 
        <span>Translation feature available for support scripts</span>
      </div>
    `;
    
    // Insert after the section title
    const sectionTitle = scriptsSection.querySelector('h2');
    if (sectionTitle) {
      sectionTitle.parentNode.insertBefore(translationStatus, sectionTitle.nextSibling);
    }
  }
}

function translateCardContent(card, languageCode) {
  const contentDiv = card.querySelector('.template-content');
  if (!contentDiv) return;
  
  // Get all paragraphs and list items
  const textElements = contentDiv.querySelectorAll('p, li');
  
  if (languageCode === 'en') {
    // Restore original content
    try {
      const originalTexts = JSON.parse(card.dataset.originalContent);
      textElements.forEach((el, i) => {
        if (i < originalTexts.length) {
          el.textContent = originalTexts[i];
        }
      });
    } catch (e) {
      console.error('Error restoring original content:', e);
    }
    return;
  }
  
  // Translate each paragraph
  textElements.forEach(el => {
    const originalText = el.textContent;
    const translation = getTranslation(originalText, languageCode);
    
    if (translation) {
      el.textContent = translation;
    }
  });
  
  // Update copy button to include language
  const copyBtn = contentDiv.querySelector('.copy-template');
  if (copyBtn) {
    const languageName = AVAILABLE_LANGUAGES.find(lang => lang.code === languageCode)?.name || 'Translated';
    copyBtn.innerHTML = `<i class="fas fa-copy"></i> Copy ${languageName}`;
    
    // Update data-template with the translated content
    const translatedContent = Array.from(textElements).map(el => el.textContent).join('\n\n');
    copyBtn.setAttribute('data-template', translatedContent);
  }
}

function getTranslation(text, languageCode) {
  // Check if we have a translation for this text
  if (TRANSLATIONS[text] && TRANSLATIONS[text][languageCode]) {
    return TRANSLATIONS[text][languageCode];
  }
  
  // If no translation found, append a note
  if (languageCode !== 'en') {
    return text + ' [Translation not available]';
  }
  
  return text;
}
