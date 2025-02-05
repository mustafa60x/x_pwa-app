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

      if ('SyncManager' in window) {
        console.log('Background Sync destekleniyor!');
        // registerBackgroundSync();
      } else {
        console.log('Background Sync desteklenmiyor!');
      }

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

saveNoteBtn.addEventListener('click', async () => {
  const noteText = noteInput.value.trim();
  if (noteText) {
    notes.push({
      text: noteText,
      date: new Date().toISOString()
    });
    localStorage.setItem('notes', JSON.stringify(notes));
    noteInput.value = '';
    renderNotes();


    if(!navigator.onLine) {
      // Save data to cache
      await saveDataToCache(notes); // Veriyi önbelleğe al
      await registerBackgroundSync(); // Sync'i tetikle
    }
    
    // Background sync
    // testApi(); // hata olunca sync çalışır
  }
});

async function saveDataToCache(data: any) {
  const cache = await caches.open('data-cache');
  await cache.put('/pending-data', new Response(JSON.stringify(data)));
  console.log('Veri önbelleğe alındı:', data);
}

// Background sync
async function registerBackgroundSync() {
  const registration = await navigator.serviceWorker.ready;
  
  try {
    await registration.sync.register('send-data');
    console.log('Sync kaydedildi!');
  } catch (err) {
    console.error('Sync hatası:', err); // NotAllowedError burada yakalanır
  }
}

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

/* function testApi() {
  fetch('https://api.example.com/data')
  .catch(() => registerBackgroundSync());
} */

/* async function requestPeriodicSync() {
  const status = await navigator.permissions.query({
    name: 'periodic-background-sync' as PermissionName
  }) as { state: 'granted' | 'denied' };

  if (status.state === 'granted') {
    const registration = await navigator.serviceWorker.ready as ServiceWorkerRegistration;
    await registration.periodicSync.register('get-updates', {
      minInterval: 24 * 60 * 60 * 1000 // 1 gün
    });
  } else {
    console.log('İzin reddedildi!');
  }
}
 */
