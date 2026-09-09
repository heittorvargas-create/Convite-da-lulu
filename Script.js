(() => {
  'use strict';

  const CONFIG = {
    eventDate: '2026-12-05T20:00:00',
    whatsappNumber: '5513996752376',
    whatsappMessage: 'Olá! Estou confirmando minha presença no XV da Lulu. 💙',
    pixKey: '13996752376',
    address: ''
  };

  const $ = (id) => document.getElementById(id);
  const pages = { entry: $('entry-page'), invite: $('invite-page'), gifts: $('gifts-page') };
  const toast = $('toast');
  let toastTimer;
  let audioContext;
  let oceanNodes = [];

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  function showPage(name) {
    Object.entries(pages).forEach(([key, page]) => {
      const active = key === name;
      page.hidden = !active;
      page.classList.toggle('is-active', active);
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateCountdown() {
    const target = new Date(CONFIG.eventDate).getTime();
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    $('days').textContent = String(days).padStart(2, '0');
    $('hours').textContent = String(hours).padStart(2, '0');
    $('minutes').textContent = String(minutes).padStart(2, '0');
    $('seconds').textContent = String(seconds).padStart(2, '0');
  }

  function confirmPresence() {
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(CONFIG.whatsappMessage)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  function openLocation() {
    if (!CONFIG.address.trim()) {
      showToast('O local da festa ainda não foi definido.');
      return;
    }
    const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONFIG.address)}`;
    window.open(maps, '_blank', 'noopener,noreferrer');
  }

  async function copyPix() {
    try {
      await navigator.clipboard.writeText(CONFIG.pixKey);
      showToast('Chave Pix copiada! 💙');
    } catch {
      showToast(`Pix: ${CONFIG.pixKey}`);
    }
  }

  function toggleOceanSound() {
    if (audioContext && audioContext.state !== 'closed') {
      oceanNodes.forEach(node => { try { node.stop?.(); } catch {} });
      oceanNodes = [];
      audioContext.close();
      audioContext = null;
      $('btn-sound').textContent = '♫';
      showToast('Som do mar desligado.');
      return;
    }

    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      last = last * 0.985 + white * 0.015;
      data[i] = last;
    }
    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gain = audioContext.createGain();
    source.buffer = buffer;
    source.loop = true;
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    gain.gain.value = 0.055;
    source.connect(filter).connect(gain).connect(audioContext.destination);
    source.start();
    oceanNodes = [source];
    $('btn-sound').textContent = '◼';
    showToast('Som do mar ligado. 🌊');
  }

  $('btn-enter').addEventListener('click', () => showPage('invite'));
  $('btn-gifts').addEventListener('click', () => showPage('gifts'));
  $('btn-back').addEventListener('click', () => showPage('invite'));
  $('btn-confirm').addEventListener('click', confirmPresence);
  $('btn-location').addEventListener('click', openLocation);
  $('pix-key').addEventListener('click', copyPix);
  $('btn-sound').addEventListener('click', toggleOceanSound);
  $('btn-share').addEventListener('click', async () => {
    const shareData = { title: 'XV da Lulu', text: 'Você está convidado(a) para o XV da Lulu! 💙', url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); showToast('Link copiado!'); }
    } catch {}
  });

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Quando o endereço final existir, basta preencher CONFIG.address acima.
  if (CONFIG.address.trim()) {
    const button = $('btn-location');
    button.disabled = false;
    button.innerHTML = '📍 <span>Ver localização</span>';
  }
})();
