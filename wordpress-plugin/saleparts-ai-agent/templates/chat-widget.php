<div id="saleparts-ai-chat" class="saleparts-chat-widget" aria-live="polite">
  <button id="saleparts-chat-toggle" class="saleparts-chat-toggle" aria-label="Open AI assistant">
    <span class="orb-core"></span>
    <span class="orb-ring"></span>
    <span class="orb-label">AI</span>
  </button>

  <section id="saleparts-chat-panel" class="saleparts-chat-panel" hidden>
    <header class="saleparts-chat-header">
      <div class="brand-wrap">
        <img id="saleparts-brand-logo" class="brand-logo" alt="Brand logo" hidden />
        <div>
          <strong id="saleparts-brand-name">ecommerco<span>.ai</span></strong>
          <p>AI Parts Assistant</p>
        </div>
      </div>
      <div class="header-actions">
        <button id="saleparts-voice-btn" aria-label="Toggle voice input">🎤</button>
        <button id="saleparts-chat-close" aria-label="Close chat">✕</button>
      </div>
    </header>

    <main id="saleparts-chat-log"></main>

    <footer>
      <input id="saleparts-chat-input" type="text" placeholder="Ask: Do you have part number 12345?" />
      <button id="saleparts-chat-send">Send</button>
    </footer>
  </section>
</div>
