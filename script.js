const countBox1 = document.getElementById('countBox1');
const countBox2 = document.getElementById('countBox2');
const countBox3 = document.getElementById('countBox3');
const totalJaapEl = document.getElementById('totalJaap');
const historyList = document.getElementById('historyList');
const statusEl = document.getElementById('status');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

let count = 0;       // Current mala count (0 to 108)
let malaCount = 0;   // Number of malas completed
let totalCount = 0;  // Total "राम" counted overall

let stopRequested = false;

function getTodayKey() {
  const d = new Date();
  return `jaap_${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
}

function saveDailyCount(count) {
  localStorage.setItem(getTodayKey(), count);
}

function loadDailyCount() {
  return parseInt(localStorage.getItem(getTodayKey())) || 0;
}

function updateHistory() {
  historyList.innerHTML = '';
  Object.keys(localStorage).filter(key => key.startsWith('jaap_'))
    .sort((a,b) => a.localeCompare(b))
    .forEach(key => {
      const dateStr = key.replace('jaap_','');
      const val = localStorage.getItem(key);
      const li = document.createElement('li');
      li.textContent = `${dateStr} : ${val} जप`;
      historyList.appendChild(li);
    });
}

function updateCounters() {
  countBox1.textContent = `जप (राम) : ${count} / 108`;
  countBox2.textContent = `माला : ${malaCount}`;
  countBox3.textContent = `कुल जप : ${totalCount}`;
  totalJaapEl.textContent = totalCount;

  saveDailyCount(totalCount);
  updateHistory();
}

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!window.SpeechRecognition) {
  alert("क्षमा करें, आपका ब्राउज़र Speech Recognition को सपोर्ट नहीं करता।");
  statusEl.textContent = "Speech Recognition समर्थित नहीं है।";
}

let recognition = null;
if (window.SpeechRecognition) {
  recognition = new window.SpeechRecognition();
  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.continuous = true;
}

if (recognition) {
  recognition.addEventListener('result', (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        const transcript = event.results[i][0].transcript.trim().toLowerCase();
        // Check how many times 'राम' appeared
        const matches = transcript.match(/राम/g);
        if (matches) {
          let ramCount = matches.length;
          for (let j = 0; j < ramCount; j++) {
            count++;
            totalCount++;
            if (count > 108) {
              malaCount++;
              count = 1;
            }
          }
          updateCounters();
        }
      }
    }
  });

  recognition.onend = () => {
    if (!stopRequested) {
      recognition.start();
      statusEl.textContent = 'सुनना जारी है... कृपया बोलते रहें "राम"';
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusEl.textContent = 'सुनना बंद हो गया। फिर से शुरू करने के लिए Start दबाएँ।';
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event.error);
    statusEl.textContent = `त्रुटि: ${event.error}`;
  };
}

startBtn.addEventListener('click', () => {
  if (recognition) {
    stopRequested = false;
    recognition.start();
    statusEl.textContent = 'सुनना शुरू हुआ... कृपया बोलें "राम"';
    startBtn.disabled = true;
    stopBtn.disabled = false;
  }
});

stopBtn.addEventListener('click', () => {
  if (recognition) {
    stopRequested = true;
    recognition.stop();
    statusEl.textContent = 'सुनना बंद किया गया।';
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

window.onload = () => {
  totalCount = loadDailyCount();
  malaCount = Math.floor(totalCount / 108);
  count = totalCount % 108;
  updateCounters();
  updateHistory();
};
