const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const charCount = document.getElementById('charCount');

inputText.addEventListener('input', () => {
  charCount.innerText = `${inputText.value.length} characters`;
});

function showPopup(message, type = 'success') {
  const popup = document.getElementById('popup');
  popup.innerText = message;
  popup.className = `popup show ${type}`;

  setTimeout(() => {
    popup.className = 'popup';
  }, 3000);
}

async function translateText() {
  const text = inputText.value.trim();
  const from = document.getElementById('fromLang').value;
  const to = document.getElementById('toLang').value;

  if (!text) {
    showPopup('Enter text before translating.', 'error');
    return;
  }

  outputText.value = 'Translating...';

  try {
  const response = await fetch(
  `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${from}&to=${to}`,
  {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': '5N7jdarfMH7QZSsTdQNVzkcizZhqh1Id50AkCz39d8PIAe8XiFptJQQJ99CDAC3pKaRXJ3w3AAAbACOGnit0',
      'Ocp-Apim-Subscription-Region': 'eastasia',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      {
        Text: text
      }
    ])
  }
);
    const data = await response.json();

    if (!data[0] || !data[0].translations) {
      throw new Error('Invalid Azure response');
    }

    const translated = data[0].translations[0].text;
    outputText.value = translated;

    saveHistory(text, translated, from, to);
    showPopup('Translation complete.');
  } catch (error) {
    console.error(error);
    outputText.value = '';
    showPopup('Azure translation failed. Check endpoint, key and region.', 'error');
  }
}

function swapLanguages() {
  const from = document.getElementById('fromLang');
  const to = document.getElementById('toLang');

  [from.value, to.value] = [to.value, from.value];
  [inputText.value, outputText.value] = [outputText.value, inputText.value];

  charCount.innerText = `${inputText.value.length} characters`;

  showPopup('Languages swapped.');
}

function clearText() {
  inputText.value = '';
  outputText.value = '';
  charCount.innerText = '0 characters';
  showPopup('Text cleared.');
}

async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    charCount.innerText = `${text.length} characters`;
    showPopup('Text pasted.');
  } catch {
    showPopup('Clipboard access denied.', 'error');
  }
}

function copyOutput() {
  if (!outputText.value) {
    showPopup('No translated text to copy.', 'error');
    return;
  }

  navigator.clipboard.writeText(outputText.value);
  showPopup('Translated text copied.');
}

function speakOutput() {
  if (!outputText.value) {
    showPopup('Nothing to speak.', 'error');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(outputText.value);
  speechSynthesis.speak(utterance);
}

function speakInput() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    showPopup('Speech recognition not supported.', 'error');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.start();

  showPopup('Listening...');

  recognition.onresult = (event) => {
    inputText.value += ' ' + event.results[0][0].transcript;
    charCount.innerText = `${inputText.value.length} characters`;
    showPopup('Voice captured.');
  };

  recognition.onerror = () => {
    showPopup('Voice recognition failed.', 'error');
  };
}

function saveHistory(original, translated, from, to) {
  const history = JSON.parse(localStorage.getItem('translatorHistory')) || [];

  history.unshift({
    original,
    translated,
    from,
    to,
    time: new Date().toLocaleString()
  });

  localStorage.setItem(
    'translatorHistory',
    JSON.stringify(history.slice(0, 10))
  );
}

function openHistory() {
  const history = JSON.parse(localStorage.getItem('translatorHistory')) || [];
  const historyList = document.getElementById('historyList');

  if (history.length === 0) {
    historyList.innerHTML = '<p style="color:#94a3b8;">No translations yet.</p>';
  } else {
    historyList.innerHTML = history
      .map(
        (item) => `
        <div class="history-item">
          <strong>${item.from} → ${item.to}</strong><br><br>
          <div><b>Original:</b> ${item.original}</div><br>
          <div><b>Translated:</b> ${item.translated}</div><br>
          <small style="color:#94a3b8;">${item.time}</small>
        </div>
      `
      )
      .join('');
  }

  document.getElementById('historyModal').classList.add('active');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('active');
}
