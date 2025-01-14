// get all button that have .visibility-button class
const toggleButtons = document.querySelectorAll('.visibility-button');

toggleButtons.forEach(button => {
  const inputId = button.getAttribute('for');
  button.addEventListener('click', function() {
    const apiKeyInput = document.getElementById(inputId);
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
    this.textContent = apiKeyInput.type === 'password' ? '👁️' : '🙈';
  });
});


function showMessageTip(message, isSuccess) {
  const messageTip = document.getElementById('message-tip');
  if (isSuccess) {
    messageTip.textContent = message;
    messageTip.classList.add('success');
  } else {
    messageTip.textContent = message;
    messageTip.classList.add('error');
  }
  messageTip.style.display = 'block';
  messageTip.classList.add('show');

  setTimeout(() => {
    messageTip.classList.remove('show');
    setTimeout(() => {
      messageTip.style.display = 'none';
      messageTip.classList.remove('success', 'error');
    }, 300); // Match this duration with the CSS transition duration
  }, 3000);
}

document.querySelector('.save-button').addEventListener('click', function() {
  const vendor = document.getElementById('vendor').value;
  const llmApiKey = document.getElementById('llm-api-key').value;
  const language = document.getElementById('language').value;
  
  chrome.storage.local.set({ 
    vendor,
    llmApiKey,
    language
  }, function() {
    console.log(`[options.js] Options saved.`);
    showMessageTip('Options saved successfully!', true);
  });

  // Update message to background.js
  chrome.runtime.sendMessage({
    action: 'SP_UPDATE_OPTIONS',
    options: {
      vendor,
      llmApiKey,
      language
    }
  });
});

// Update storage loading
chrome.storage.local.get([
  'vendor',
  'llmApiKey',
  'language'
], function(data) {
  document.getElementById('vendor').value = data.vendor || 'openai';
  document.getElementById('llm-api-key').value = data.llmApiKey || '';
  document.getElementById('language').value = data.language || 'Chinese';
});