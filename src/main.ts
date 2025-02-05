// import '../public/style.css'

// Check if service worker is supported
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((_registration: any) => {
        // console.log('ServiceWorker registration successful', registration);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// Connection status check
const checkConnectionBtn = document.getElementById('checkConnection') as HTMLButtonElement;
checkConnectionBtn.addEventListener('click', () => {
  const status = navigator.onLine ? 'online' : 'offline';
  alert(`You are currently ${status}`);
});


// Notes functionality with offline support
const noteInput = document.getElementById('noteInput') as HTMLInputElement;
const saveNoteBtn = document.getElementById('saveNote') as HTMLButtonElement;
const notesList = document.getElementById('notesList') as HTMLUListElement;

// Load notes from localStorage
const notes = JSON.parse(localStorage.getItem('notes') || '[]');
renderNotes();

saveNoteBtn.addEventListener('click', () => {
  const noteText = noteInput.value.trim();
  if (noteText) {
    notes.push({
      text: noteText,
      date: new Date().toISOString()
    });
    localStorage.setItem('notes', JSON.stringify(notes));
    noteInput.value = '';
    renderNotes();
  }
});

function renderNotes() {
  notesList.innerHTML = notes
    .map((note: { text: string; date: string; }) => `<li>${note.text}</li>`)
    .join('');
}


// Install PWA
const installButton = document.getElementById('installButton') as HTMLButtonElement;
installButton.addEventListener('click', () => {
  const prompt = (window as any).PromptEvent;
  if (prompt) {
    prompt.prompt();
  }
});

let beforeInstallPromptEvent: any;
window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    beforeInstallPromptEvent = e

    installButton.style.display = 'block'
    installButton.addEventListener("click", function() {
        beforeInstallPromptEvent.prompt();
    });
    installButton.hidden = false;
});

// Generate random image
const picsumUrl = 'https://picsum.photos/200';
function getRandomImage() {
    return fetch(picsumUrl)
        .then(response => response.blob())
        .then(blob => URL.createObjectURL(blob));
}

const generateRandomImageBtn = document.getElementById('generateRandomImage') as HTMLButtonElement;
generateRandomImageBtn.addEventListener('click', () => {
    getRandomImage().then(imageUrl => {
        const image = document.getElementById('randomImage') as HTMLImageElement;
        image.src = imageUrl;
    });
});