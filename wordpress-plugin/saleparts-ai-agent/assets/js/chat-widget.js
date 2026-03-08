(() => {
  const config = window.SalePartsAgentConfig || {};
  const widget = document.getElementById('saleparts-ai-chat');
  const toggle = document.getElementById('saleparts-chat-toggle');
  const panel = document.getElementById('saleparts-chat-panel');
  const closeBtn = document.getElementById('saleparts-chat-close');
  const sendBtn = document.getElementById('saleparts-chat-send');
  const input = document.getElementById('saleparts-chat-input');
  const log = document.getElementById('saleparts-chat-log');
  const voiceBtn = document.getElementById('saleparts-voice-btn');
  const brandName = document.getElementById('saleparts-brand-name');
  const brandLogo = document.getElementById('saleparts-brand-logo');

  if (!widget || !toggle || !panel || !sendBtn || !input || !log) return;

  const setBranding = () => {
    const color = config.brandColor || '#f5c518';
    document.documentElement.style.setProperty('--saleparts-brand', color);

    if (config.brandBackgroundUrl) {
      panel.style.backgroundImage = `linear-gradient(rgba(0,0,0,.4), rgba(0,0,0,.6)), url(${config.brandBackgroundUrl})`;
      panel.style.backgroundSize = 'cover';
      panel.style.backgroundPosition = 'center';
    }

    if (brandName && config.brandName) {
      brandName.innerHTML = `${config.brandName.replace('.ai', '<span>.ai</span>')}`;
    }

    if (brandLogo && config.brandLogoUrl) {
      brandLogo.src = config.brandLogoUrl;
      brandLogo.hidden = false;
    }
  };


  const logQuestion = async (question, aiReply = '') => {
    if (!config.wpApiRoot) return;

    try {
      await fetch(`${config.wpApiRoot}/log-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': config.nonce || ''
        },
        body: JSON.stringify({
          question,
          aiReply,
          sourcePage: window.location.href
        })
      });
    } catch (error) {
      // Silent failure: logging must not block customer chat.
    }
  };

  const addMessage = (text, role) => {
    const div = document.createElement('div');
    div.className = `saleparts-msg ${role}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  };

  const askAgent = async (query) => {
    addMessage(query, 'user');
    try {
      const response = await fetch(`${config.apiBase}/search-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': config.nonce || ''
        },
        body: JSON.stringify({ query })
      });
      const data = await response.json();
      const reply = data.reply || 'I could not find matching parts right now.';
      addMessage(reply, 'bot');
      logQuestion(query, reply);

      if ('speechSynthesis' in window && reply && config.voiceEnabled) {
        speechSynthesis.speak(new SpeechSynthesisUtterance(reply));
      }
    } catch (err) {
      addMessage('Service unavailable. Please try again later.', 'bot');
      logQuestion(query, 'Service unavailable. Please try again later.');
    }
  };

  const openPanel = () => {
    panel.hidden = false;
    if (!panel.dataset.greeted) {
      addMessage(`Hi, I am ${config.brandName || 'ecommerco.ai'} assistant. Ask me by SKU, part number, or compatibility.`, 'bot');
      panel.dataset.greeted = '1';
    }
  };

  toggle.addEventListener('click', openPanel);
  closeBtn?.addEventListener('click', () => {
    panel.hidden = true;
  });

  sendBtn.addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    askAgent(text);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      sendBtn.click();
    }
  });

  if (voiceBtn && 'webkitSpeechRecognition' in window && config.voiceEnabled) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      input.value = event.results[0][0].transcript;
      sendBtn.click();
    };
    voiceBtn.addEventListener('click', () => recognition.start());
  } else if (voiceBtn) {
    voiceBtn.disabled = true;
    voiceBtn.title = 'Voice input unavailable in this browser.';
  }

  setBranding();
})();
