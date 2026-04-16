const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');

function popup(message, error = false) {
  const p = document.getElementById('popup');
  p.textContent = message;
  p.className = 'popup show' + (error ? ' error' : '');

  setTimeout(() => {
    p.className = 'popup';
  }, 3000);
}

async function translateText() {
  const key = document.getElementById('apiKey').value.trim();
  const region = document.getElementById('region').value.trim();
  const from = document.getElementById('fromLang').value;
  const to = document.getElementById('toLang').value;
  const text = inputText.value.trim();

  if (!key || !region) {
    popup('Enter API key and region.', true);
    return;
  }

  if (!text) {
    popup('Enter text to translate.', true);
    return;
  }

  outputText.value = 'Translating...';

  try {
    const response = await fetch(
  `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}`,
      {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': key,
          'Ocp-Apim-Subscription-Region': region,
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
    console.log(response.status);
console.log(data);

    console.log('Azure response:', data);

    if (!response.ok) {
      popup(data.error?.message || 'Azure request failed.', true);
      outputText.value = '';
      return;
    }

    outputText.value = data[0].translations[0].text;
    popup('Translation successful.');
  } catch (err) {
    console.error(err);
    popup('Network or CORS error. Open console with F12.', true);
    outputText.value = '';
  }
}

function swapLanguages() {
  const from = document.getElementById('fromLang');
  const to = document.getElementById('toLang');

  [from.value, to.value] = [to.value, from.value];
  [inputText.value, outputText.value] = [outputText.value, inputText.value];
}

async function pasteText() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
    popup('Text pasted.');
  } catch {
    popup('Clipboard access denied.', true);
  }
}

function clearInput() {
  inputText.value = '';
}

function copyOutput() {
  if (!outputText.value) {
    popup('Nothing to copy.', true);
    return;
  }

  navigator.clipboard.writeText(outputText.value);
  popup('Copied translated text.');
}

function speakOutput() {
  if (!outputText.value) {
    popup('Nothing to speak.', true);
    return;
  }

  const speech = new SpeechSynthesisUtterance(outputText.value);
  speechSynthesis.speak(speech);
}
