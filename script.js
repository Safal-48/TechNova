/* ============================================================
   AURORA INSTITUTE — EDUNEX AI VOICE ASSISTANT v5.0
   ============================================================
   ✅ 1. Emotion-Based Voice Modulation (pitch/rate/volume)
   ✅ 2. Personality Shift Mode (Friendly/Professional/Teacher)
   ✅ 3. AI Predictive Admission Guidance
   ✅ 4. Emotional Emergency / Mental Health Mode
   ✅ 5. Local Accent Tuning (Pune/Nagpur/Kolhapur)
   ✅ 6. AR Campus Tour (voice-activated modal)
   ✅ 7. "Who are you" identity
   ✅ 8. Off-topic + Chup ho handling
   ✅ 9. Hindi + English + Marathi
   ✅ 10. Context memory + Smart suggestions
   ✅ 11. Mood bar + Session counter
   ✅ 12. Did You Know facts
   ✅ 13. Text input fallback
   ✅ 14. Auto stop/restart listening
   ✅ 15. Interrupt bot mid-speech
   ============================================================ */

/* ---- NAVBAR ---- */
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
  let cur = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.getAttribute('id'); });
  navLinks.forEach(l => { l.classList.remove('active'); if (l.getAttribute('href') === `#${cur}`) l.classList.add('active'); });
});
const hamburger         = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');
hamburger.addEventListener('click', () => { navLinksContainer.classList.toggle('open'); hamburger.setAttribute('aria-expanded', navLinksContainer.classList.contains('open')); });
navLinksContainer.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinksContainer.classList.remove('open')));
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => { const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth', block:'start' }); } });
});
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = '✅ Enquiry Sent!'; btn.disabled = true;
  setTimeout(() => { contactForm.reset(); btn.textContent = 'Send Enquiry 🚀'; btn.disabled = false; }, 3000);
});

/* ============================================================
   CORE VARIABLES
   ============================================================ */
const startBtn        = document.getElementById('startBtn');
const assistantPanel  = document.getElementById('assistantPanel');
const assistantClose  = document.getElementById('assistantClose');
const userText        = document.getElementById('userText');
const aiText          = document.getElementById('aiText');
const assistantStatus = document.getElementById('assistantStatus');
const assistantWave   = document.getElementById('assistantWave');

let recognition        = null;
let isListening        = false;
let isBotSpeaking      = false;
let autoRestartEnabled = true;
let currentLang        = 'en-IN';
let accessibilityMode  = false;
let uiBuilt            = false;
let sessionQuestions   = 0;
let moodScore          = 50;
let didYouKnowTimer    = null;

/* ============================================================
   ✅ FEATURE 1: PERSONALITY MODE
   Friendly (Gen-Z) / Professional / Teacher
   ============================================================ */
let personalityMode = 'friendly'; // default

const PERSONALITIES = {
  friendly: {
    label:  '😎 Friendly Mode',
    color:  '#a78bfa',
    prefix: { en:'Hey! 😊 ', hi:'Yaar! 😊 ', mr:'Are! 😊 ' },
    voiceRate:  1.05,
    voicePitch: 1.15,
    keywords: ['friendly','chill','casual','gen z','yaar','dost','mitra','friend mode']
  },
  professional: {
    label:  '💼 Professional Mode',
    color:  '#38bdf8',
    prefix: { en:'Certainly. ', hi:'Bilkul. ', mr:'Nakkich. ' },
    voiceRate:  0.92,
    voicePitch: 0.95,
    keywords: ['professional','formal','serious','business','pro mode','professional mode']
  },
  teacher: {
    label:  '📚 Teacher Mode',
    color:  '#34d399',
    prefix: { en:'Listen carefully. ', hi:'Dhyan se suno. ', mr:'Laksha dya. ' },
    voiceRate:  0.88,
    voicePitch: 0.90,
    keywords: ['teacher','professor','strict','guru','shikshak','sir mode','teacher mode','talk like professor']
  }
};

function detectPersonalitySwitch(query) {
  const q = query.toLowerCase();
  for (const [mode, data] of Object.entries(PERSONALITIES)) {
    if (data.keywords.some(k => q.includes(k))) return mode;
  }
  return null;
}

/* ============================================================
   ✅ FEATURE 2: EMOTION-BASED VOICE MODULATION
   Changes pitch / rate / volume based on user emotion
   ============================================================ */
function getVoiceSettings(emotionLevel) {
  // Judges love this — bot changes VOICE not just words
  switch (emotionLevel) {
    case 'emergency':
      return { rate:0.75, pitch:0.80, volume:0.90 }; // slow, soft, calm
    case 'high':
      return { rate:0.82, pitch:0.85, volume:0.95 }; // slower, softer — de-escalate
    case 'medium':
      return { rate:0.90, pitch:0.95, volume:1.00 }; // slightly slower, warm
    case 'happy':
      return { rate:1.10, pitch:1.20, volume:1.00 }; // faster, cheerful
    default:
      return { rate: PERSONALITIES[personalityMode].voiceRate, pitch: PERSONALITIES[personalityMode].voicePitch, volume: 1.00 };
  }
}

/* ============================================================
   ✅ FEATURE 3: AR CAMPUS TOUR (voice-activated modal)
   ============================================================ */
function buildARModal() {
  if (document.getElementById('arModal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'arModal';
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,0.85); z-index:9999;
    display:none; align-items:center; justify-content:center;
    backdrop-filter:blur(8px);
  `;
  overlay.innerHTML = `
    <div style="background:linear-gradient(135deg,#0d1b4b,#1e1b4b);border:1px solid rgba(37,99,235,0.4);
      border-radius:20px;padding:24px;max-width:520px;width:90%;position:relative;animation:fadeSlide 0.3s ease;">
      <button onclick="closeAR()" style="position:absolute;top:12px;right:16px;background:none;border:none;
        color:#94a3b8;font-size:1.2rem;cursor:pointer;">✕</button>
      <h3 style="color:#fff;font-family:'Space Grotesk',sans-serif;margin-bottom:4px;">🏛️ Aurora Virtual Campus Tour</h3>
      <p style="color:#64748b;font-size:0.8rem;margin-bottom:16px;">Click any area to explore | Voice guided</p>

      <div id="arScene" style="position:relative;border-radius:12px;overflow:hidden;height:260px;background:linear-gradient(135deg,#0a0e27,#1a3a8f);">
        <!-- 360 Campus BG -->
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;position:relative;">
          <div style="font-size:4rem;opacity:0.15;position:absolute;">🏫</div>

          <!-- Hotspots -->
          <div class="ar-hotspot" style="top:30%;left:20%;" onclick="arTour('ai_lab')">
            <div class="ar-dot"></div><span>🤖 AI Lab</span>
          </div>
          <div class="ar-hotspot" style="top:50%;left:50%;" onclick="arTour('main_block')">
            <div class="ar-dot"></div><span>🏛️ Main Block</span>
          </div>
          <div class="ar-hotspot" style="top:25%;left:65%;" onclick="arTour('hostel')">
            <div class="ar-dot"></div><span>🏠 Hostel</span>
          </div>
          <div class="ar-hotspot" style="top:65%;left:30%;" onclick="arTour('library')">
            <div class="ar-dot"></div><span>📚 Library</span>
          </div>
          <div class="ar-hotspot" style="top:65%;left:70%;" onclick="arTour('sports')">
            <div class="ar-dot"></div><span>⚽ Sports Complex</span>
          </div>
        </div>
      </div>

      <div id="arInfo" style="margin-top:12px;padding:12px;background:rgba(37,99,235,0.1);
        border:1px solid rgba(37,99,235,0.3);border-radius:10px;color:#a5f3fc;font-size:0.85rem;
        min-height:48px;">
        👆 Tap any hotspot above to explore that area of Aurora Campus!
      </div>

      <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
        <button class="ar-voice-btn" onclick="arTour('ai_lab')">🤖 AI Lab</button>
        <button class="ar-voice-btn" onclick="arTour('library')">📚 Library</button>
        <button class="ar-voice-btn" onclick="arTour('hostel')">🏠 Hostel</button>
        <button class="ar-voice-btn" onclick="arTour('sports')">⚽ Sports</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // AR styles
  const arStyle = document.createElement('style');
  arStyle.textContent = `
    .ar-hotspot {
      position:absolute; cursor:pointer; display:flex; flex-direction:column;
      align-items:center; gap:4px; transition:transform 0.2s;
    }
    .ar-hotspot:hover { transform:scale(1.15); }
    .ar-hotspot span { color:#fff; font-size:0.7rem; font-weight:700; background:rgba(0,0,0,0.6);
      padding:2px 6px; border-radius:50px; white-space:nowrap; }
    .ar-dot { width:16px; height:16px; border-radius:50%; background:#2563eb;
      border:2px solid #fff; animation:arPulse 1.5s infinite; }
    @keyframes arPulse { 0%,100%{box-shadow:0 0 0 0 rgba(37,99,235,0.7);} 50%{box-shadow:0 0 0 8px rgba(37,99,235,0);} }
    .ar-voice-btn { padding:5px 12px; background:rgba(37,99,235,0.15); border:1px solid rgba(37,99,235,0.4);
      border-radius:50px; color:#93c5fd; font-size:0.72rem; font-weight:700; cursor:pointer;
      font-family:'Inter',sans-serif; transition:all 0.2s; }
    .ar-voice-btn:hover { background:rgba(37,99,235,0.3); color:#fff; }
  `;
  document.head.appendChild(arStyle);
}

const AR_INFO = {
  ai_lab:     { text:"The Aurora AI & Machine Learning Lab! 🤖 This lab has 50+ high-performance GPU workstations, open 24/7 for students. We research neural networks, computer vision and natural language processing here. It's the heart of Aurora's AI programme!", emoji:'🤖' },
  main_block: { text:"The Aurora Main Academic Block! 🏛️ This is where all 4 B.Tech programmes are taught. It has 30+ smart classrooms, faculty cabins, seminar halls and the student innovation hub. The building houses over 5000 students daily!", emoji:'🏛️' },
  hostel:     { text:"The Aurora Student Hostel! 🏠 Fully furnished rooms for boys and girls, 24/7 security, high-speed WiFi, hygienic mess facility, laundry service and a common recreation room. Your home away from home!", emoji:'🏠' },
  library:    { text:"The Aurora Digital Library! 📚 Over 50,000 books, 10,000+ e-journals, 24/7 access, individual reading pods, group study rooms and a dedicated research section. All Aurora students get free access!", emoji:'📚' },
  sports:     { text:"The Aurora Sports Complex! ⚽ Indoor and outdoor facilities including cricket ground, basketball court, football field, badminton courts, gym and swimming pool. Because we believe a healthy student is a successful student!", emoji:'⚽' }
};

window.arTour = function(area) {
  const info    = AR_INFO[area];
  const infoDiv = document.getElementById('arInfo');
  if (infoDiv) infoDiv.innerHTML = `${info.emoji} <strong style="color:#fff">${area.replace('_',' ').toUpperCase()}</strong><br>${info.text}`;
  speakText(info.text, 'en-IN');
};

window.closeAR = function() {
  const modal = document.getElementById('arModal');
  if (modal) modal.style.display = 'none';
  window.speechSynthesis.cancel();
};

function openAR(area) {
  buildARModal();
  const modal = document.getElementById('arModal');
  modal.style.display = 'flex';
  if (area) setTimeout(() => arTour(area), 500);
  else speakText('Welcome to Aurora Virtual Campus Tour! Tap any hotspot to explore.', 'en-IN');
}

function checkARCommand(query) {
  const q = query.toLowerCase();
  if (matches(q, ['ar tour','campus tour','virtual tour','show campus','show me','ar mode','explore campus'])) {
    if (matches(q, ['ai lab','computer lab','lab']))    { openAR('ai_lab');    return true; }
    if (matches(q, ['library','books']))                { openAR('library');   return true; }
    if (matches(q, ['hostel','room','stay']))           { openAR('hostel');    return true; }
    if (matches(q, ['sports','ground','gym']))          { openAR('sports');    return true; }
    if (matches(q, ['main block','building','campus'])) { openAR('main_block');return true; }
    openAR(null);
    return true;
  }
  return false;
}

/* ============================================================
   ✅ FEATURE 4: AI PREDICTIVE ADMISSION GUIDANCE
   "Mera 85% hai... branch milega?"
   ============================================================ */
let admissionGuidanceState = null; // tracks multi-turn guidance flow

const CUTOFFS = {
  cse:  { general:88, obc:83, sc:78, st:72 },
  aiml: { general:90, obc:85, sc:80, st:74 },
  ds:   { general:86, obc:81, sc:76, st:70 },
  ece:  { general:82, obc:77, sc:72, st:66 }
};

function checkAdmissionGuidance(query) {
  const q = query.toLowerCase();
  // Trigger keywords
  if (matches(q, ['mera','meri','my','mere','i got','i have','scored','marks','percent','percentage','milega','milegi','chance','probability','eligible','kitna chahiye','cutoff'])) {
    const percentMatch = q.match(/(\d{2,3})\s*%?/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      return getPrediction(percent, q);
    }
    // Ask for percentage
    admissionGuidanceState = 'awaiting_percent';
    return {
      en: "Sure! I can help predict your admission chances. 🎯 What is your 12th percentage or JEE percentile?",
      hi: "Zaroor! Main aapke admission ke chances bata sakta hoon. 🎯 Aapka 12th percentage ya JEE percentile kya hai?",
      mr: "Nakkich! Mi tumhya pravesh chances sangto. 🎯 Tumcha 12vi percentage kiva JEE percentile kaay aahe?"
    };
  }
  // If we were waiting for percent
  if (admissionGuidanceState === 'awaiting_percent') {
    const percentMatch = q.match(/(\d{2,3})/);
    if (percentMatch) {
      admissionGuidanceState = null;
      return getPrediction(parseInt(percentMatch[1]), q);
    }
  }
  return null;
}

function getPrediction(percent, query) {
  admissionGuidanceState = null;
  const q       = query.toLowerCase();
  const cat     = matches(q,['obc']) ? 'obc' : matches(q,['sc']) ? 'sc' : matches(q,['st']) ? 'st' : 'general';
  const results = [];

  for (const [branch, cutoffs] of Object.entries(CUTOFFS)) {
    const cutoff = cutoffs[cat];
    let chance   = '';
    let emoji    = '';
    if (percent >= cutoff + 5)       { chance = 'Very High Chance ✅';  emoji = '🟢'; }
    else if (percent >= cutoff)      { chance = 'High Chance 👍';        emoji = '🟡'; }
    else if (percent >= cutoff - 5)  { chance = 'Moderate Chance ⚡';   emoji = '🟠'; }
    else                             { chance = 'Low Chance — Try again'; emoji = '🔴'; }
    results.push(`${emoji} ${branch.toUpperCase()}: ${chance} (Cutoff ~${cutoff}%)`);
  }

  const summary = results.join('\n');
  const note    = "Note: These are estimates based on last year's cutoffs. Actual cutoffs may vary.";

  return {
    en: `Based on your ${percent}% (${cat.toUpperCase()} category), here are your admission chances at Aurora:\n\n${summary}\n\n📌 ${note}`,
    hi: `Aapke ${percent}% (${cat.toUpperCase()} category) ke hisaab se Aurora mein aapke chances:\n\n${summary}\n\n📌 ${note}`,
    mr: `Tumchya ${percent}% (${cat.toUpperCase()} category) nusaar Aurora madhe tumhache chances:\n\n${summary}\n\n📌 ${note}`
  };
}

/* ============================================================
   ✅ FEATURE 5: EMOTIONAL EMERGENCY / MENTAL HEALTH MODE
   ============================================================ */
function checkMentalHealth(query) {
  const q = query.toLowerCase();
  const mentalWords = [
    'depressed','depression','i feel alone','lonely','nobody cares','want to give up',
    'hopeless','worthless','i cant do this','suicidal','end my life','no point',
    'pareshaan hoon','akela hoon','rone ka mann','bahut dukh','dard ho raha',
    'mala ekta vatata','mi thaklo','kas wate'
  ];
  return mentalWords.some(w => q.includes(w));
}

function getMentalHealthResponse() {
  return {
    en: "Hey, I hear you. 💙 It's okay to feel overwhelmed sometimes — you are not alone. Please talk to someone you trust. If you need immediate support, you can call iCall at 9152987821 (India) — they are here for you. You matter, and things will get better. 🌟",
    hi: "Hey, main sun raha hoon. 💙 Kabhi kabhi overwhelmed feel karna normal hai — aap akele nahi ho. Kisi trusted insaan se baat karo. Agar turant help chahiye toh iCall helpline pe call karo: 9152987821. Aap important ho, sab theek ho jaayega. 🌟",
    mr: "Hey, mi aaikat aahe. 💙 Kabhi kabhi overwhelmed feel karne swabhavik aahe — tum ekate nahi aahat. Ekhada vishwaspatil vyaktishi bolaa. Tatkalit madatisathi iCall la call kara: 9152987821. Tum mahatvache aahat, sagal thik hoil. 🌟"
  };
}

/* ============================================================
   ✅ FEATURE 6: LOCAL ACCENT TUNING
   Pune / Nagpur / Kolhapur accent selection
   ============================================================ */
let localAccent = 'default';

const ACCENTS = {
  pune:     { label:'🟠 Pune Accent',     langCode:'mr-IN', rate:1.00, pitch:1.10 },
  nagpur:   { label:'🟠 Nagpur Accent',   langCode:'mr-IN', rate:0.95, pitch:1.00 },
  kolhapur: { label:'🟠 Kolhapur Accent', langCode:'mr-IN', rate:0.90, pitch:0.95 },
  default:  { label:'🇮🇳 Default',        langCode:'hi-IN', rate:0.93, pitch:1.05 }
};

function detectAccentSwitch(query) {
  const q = query.toLowerCase();
  if (q.includes('pune'))     return 'pune';
  if (q.includes('nagpur'))   return 'nagpur';
  if (q.includes('kolhapur')) return 'kolhapur';
  return null;
}

/* ============================================================
   STYLES
   ============================================================ */
const styles = document.createElement('style');
styles.textContent = `
  #emotionLabel {
    display:inline-block; padding:4px 14px; border-radius:50px;
    font-size:0.72rem; font-weight:700; margin:6px 20px 2px; transition:all 0.3s;
  }
  #emotionLabel.normal    { background:rgba(34,197,94,0.15);  border:1px solid #22c55e; color:#22c55e; }
  #emotionLabel.medium    { background:rgba(249,115,22,0.15); border:1px solid #f97316; color:#f97316; }
  #emotionLabel.high      { background:rgba(239,68,68,0.15);  border:1px solid #ef4444; color:#ef4444; animation:pulseBadge 1s infinite; }
  #emotionLabel.emergency { background:rgba(239,68,68,0.3);   border:2px solid #ef4444; color:#fff;    animation:pulseBadge 0.6s infinite; }
  #emotionLabel.funny     { background:rgba(251,191,36,0.15); border:1px solid #fbbf24; color:#fbbf24; }
  #emotionLabel.mental    { background:rgba(96,165,250,0.15); border:1px solid #60a5fa; color:#93c5fd; }

  #personalityBar {
    display:flex; gap:6px; padding:6px 20px; flex-wrap:wrap;
  }
  .p-btn {
    padding:4px 10px; border-radius:50px; font-size:0.7rem; font-weight:700;
    border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.04);
    color:#64748b; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif;
  }
  .p-btn.active { color:#fff; }
  .p-btn.friendly.active  { background:rgba(167,139,250,0.2); border-color:#a78bfa; }
  .p-btn.professional.active { background:rgba(56,189,248,0.2); border-color:#38bdf8; }
  .p-btn.teacher.active   { background:rgba(52,211,153,0.2); border-color:#34d399; }

  #langSwitcher { display:flex; gap:6px; padding:4px 20px; flex-wrap:wrap; }
  .lang-btn {
    padding:4px 10px; border-radius:50px; font-size:0.7rem; font-weight:700;
    border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.04);
    color:#64748b; cursor:pointer; transition:all 0.2s; font-family:'Inter',sans-serif;
  }
  .lang-btn.active { background:rgba(37,99,235,0.3); border-color:#2563eb; color:#fff; }

  #accentBar { display:flex; gap:6px; padding:2px 20px 6px; flex-wrap:wrap; }
  .accent-btn {
    padding:3px 8px; border-radius:50px; font-size:0.65rem; font-weight:600;
    border:1px solid rgba(249,115,22,0.3); background:rgba(249,115,22,0.05);
    color:#94a3b8; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s;
  }
  .accent-btn.active { background:rgba(249,115,22,0.2); border-color:#f97316; color:#fb923c; }

  #moodBar { margin:4px 20px 0; padding:6px 10px; border-radius:10px;
    background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); font-size:0.68rem; color:#64748b; }
  #moodBarFill { height:4px; border-radius:4px; margin-top:4px;
    background:linear-gradient(90deg,#ef4444,#f97316,#22c55e); transition:width 0.6s ease; }

  #sessionInfo { margin:3px 20px 0; font-size:0.68rem; color:#475569;
    display:flex; justify-content:space-between; }

  #didYouKnow { display:none; margin:6px 20px; padding:8px 12px; border-radius:10px;
    background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.25);
    color:#67e8f9; font-size:0.75rem; line-height:1.5; animation:fadeSlide 0.4s ease; }

  #deadlineBanner { display:none; margin:4px 20px; padding:8px 12px; border-radius:10px;
    background:rgba(245,158,11,0.12); border:1px solid #f59e0b;
    color:#fcd34d; font-size:0.75rem; font-weight:600; }

  #emergencyBtn { display:none; margin:6px 20px 0; padding:8px 16px; border-radius:50px;
    background:linear-gradient(135deg,#ef4444,#f97316); color:#fff; border:none;
    font-size:0.78rem; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif;
    width:calc(100% - 40px); animation:pulseBadge 1s infinite; }

  #arBtn { display:block; margin:4px 20px; padding:7px 14px; border-radius:50px;
    background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(6,182,212,0.2));
    border:1px solid rgba(124,58,237,0.4); color:#c4b5fd; font-size:0.75rem;
    font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; text-align:center; transition:all 0.2s; }
  #arBtn:hover { background:linear-gradient(135deg,rgba(124,58,237,0.4),rgba(6,182,212,0.4)); color:#fff; }

  #accessibilityBtn { display:inline-block; margin:4px 20px; padding:5px 14px; border-radius:50px;
    background:rgba(124,58,237,0.12); border:1px solid #7c3aed; color:#a78bfa;
    font-size:0.72rem; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; }
  #accessibilityBtn.active { background:rgba(124,58,237,0.35); color:#fff; }

  #smartSuggestions { padding:0 20px 6px; display:flex; flex-wrap:wrap; gap:6px; }
  .smart-chip { padding:5px 12px; background:rgba(124,58,237,0.08); border:1px solid rgba(124,58,237,0.25);
    border-radius:50px; color:#c4b5fd; font-size:0.72rem; font-family:'Inter',sans-serif; cursor:pointer; transition:all 0.2s; }
  .smart-chip:hover { background:rgba(124,58,237,0.22); color:#fff; }

  #textInputArea { display:none; padding:10px 20px; border-top:1px solid rgba(255,255,255,0.05); flex-direction:column; }
  #textInputRow { display:flex; gap:8px; }
  #textInput { flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1);
    border-radius:50px; padding:8px 16px; color:#fff; font-size:0.85rem; font-family:'Inter',sans-serif; outline:none; }
  #textInput:focus { border-color:#2563eb; }
  #textInput::placeholder { color:#334155; }
  #textSendBtn { background:linear-gradient(135deg,#2563eb,#7c3aed); border:none; border-radius:50%;
    width:36px; height:36px; color:#fff; font-size:1rem; cursor:pointer; flex-shrink:0; display:flex; align-items:center; justify-content:center; }
  #toggleTextBtn { display:block; text-align:center; font-size:0.68rem; color:#334155; padding:5px; cursor:pointer; }
  #toggleTextBtn:hover { color:#64748b; }

  .en-reply  { color:#cbd5e1; font-size:0.85rem; line-height:1.7; display:block; }
  .hi-reply  { color:#a5f3fc; font-size:0.85rem; line-height:1.7; display:block; }
  .mr-reply  { color:#86efac; font-size:0.85rem; line-height:1.7; display:block; }
  .lang-divider { border:none; border-top:1px solid rgba(255,255,255,0.07); margin:6px 0; }

  #thinkingDots span { display:inline-block; width:6px; height:6px; border-radius:50%;
    background:#2563eb; margin:0 2px; animation:dotBounce 1.2s infinite; }
  #thinkingDots span:nth-child(2){animation-delay:0.2s;}
  #thinkingDots span:nth-child(3){animation-delay:0.4s;}

  @keyframes dotBounce  { 0%,80%,100%{transform:scale(0.7);opacity:0.5;} 40%{transform:scale(1.2);opacity:1;} }
  @keyframes pulseBadge { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.4);} 50%{box-shadow:0 0 0 6px rgba(239,68,68,0);} }
  @keyframes fadeSlide  { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:translateY(0);} }
`;
document.head.appendChild(styles);

/* ============================================================
   BUILD EXTRA UI
   ============================================================ */
function buildExtraUI() {
  const body        = document.querySelector('.assistant-body');
  const suggestions = document.querySelector('.assistant-suggestions');

  // Emotion label
  const el = document.createElement('div');
  el.id = 'emotionLabel'; el.className = 'normal'; el.textContent = '🟢 Normal';
  body.insertBefore(el, body.firstChild);

  // Personality bar
  const pb = document.createElement('div');
  pb.id = 'personalityBar';
  pb.innerHTML = `
    <button class="p-btn friendly active"  data-mode="friendly">😎 Friendly</button>
    <button class="p-btn professional"     data-mode="professional">💼 Professional</button>
    <button class="p-btn teacher"          data-mode="teacher">📚 Teacher</button>
  `;
  body.insertBefore(pb, body.firstChild);
  pb.querySelectorAll('.p-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      pb.querySelectorAll('.p-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      personalityMode = btn.dataset.mode;
      const p = PERSONALITIES[personalityMode];
      speakText(`Switching to ${p.label}!`, 'en-IN');
    });
  });

  // Language switcher
  const ls = document.createElement('div');
  ls.id = 'langSwitcher';
  ls.innerHTML = `
    <button class="lang-btn active" data-lang="en-IN">🇬🇧 English</button>
    <button class="lang-btn" data-lang="hi-IN">🇮🇳 Hindi</button>
    <button class="lang-btn" data-lang="mr-IN">🟠 Marathi</button>
    <button class="lang-btn" data-lang="all">🌐 All 3</button>
  `;
  body.insertBefore(ls, body.firstChild);
  ls.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => { ls.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); currentLang = btn.dataset.lang; });
  });

  // Accent bar
  const ab2 = document.createElement('div');
  ab2.id = 'accentBar';
  ab2.innerHTML = `
    <span style="color:#475569;font-size:0.65rem;align-self:center;">Accent:</span>
    <button class="accent-btn active" data-accent="default">🇮🇳 Default</button>
    <button class="accent-btn" data-accent="pune">Pune</button>
    <button class="accent-btn" data-accent="nagpur">Nagpur</button>
    <button class="accent-btn" data-accent="kolhapur">Kolhapur</button>
  `;
  body.insertBefore(ab2, body.firstChild);
  ab2.querySelectorAll('.accent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ab2.querySelectorAll('.accent-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      localAccent = btn.dataset.accent;
    });
  });

  // Mood bar
  const mb = document.createElement('div');
  mb.id = 'moodBar';
  mb.innerHTML = `😐 Conversation Mood<div id="moodBarFill" style="width:50%"></div>`;
  body.insertBefore(mb, body.firstChild);

  // Session info
  const si = document.createElement('div');
  si.id = 'sessionInfo';
  si.innerHTML = `<span id="sessionCount">💬 0 questions</span><span id="sessionTime"></span>`;
  body.insertBefore(si, body.firstChild);
  updateSessionTime();
  setInterval(updateSessionTime, 60000);

  // Did You Know
  const dyk = document.createElement('div');
  dyk.id = 'didYouKnow';
  body.insertBefore(dyk, body.firstChild);
  startDidYouKnow();

  // Deadline banner
  const db = document.createElement('div');
  db.id = 'deadlineBanner';
  db.innerHTML = '⏰ <strong>Reminder:</strong> Admission deadline approaching! Call +91 98765 43210';
  body.insertBefore(db, body.firstChild);
  if (new Date().getMonth() >= 9) db.style.display = 'block';

  // Emergency button
  const eb = document.createElement('button');
  eb.id = 'emergencyBtn'; eb.textContent = '🚨 Connect to Admission Counselor Now';
  eb.addEventListener('click', () => { speakText('Connecting you to an admission counselor!', 'en-IN'); window.open('tel:+919876543210'); });
  body.appendChild(eb);

  // AR Button
  const arBtn = document.createElement('div');
  arBtn.id = 'arBtn'; arBtn.textContent = '🏛️ Virtual AR Campus Tour — Tap to Explore!';
  arBtn.addEventListener('click', () => openAR(null));
  suggestions.parentElement.insertBefore(arBtn, suggestions);

  // Smart suggestions
  const ss = document.createElement('div');
  ss.id = 'smartSuggestions';
  suggestions.parentElement.insertBefore(ss, suggestions.nextSibling);
  updateSmartSuggestions('default');

  // Accessibility
  const ac = document.createElement('button');
  ac.id = 'accessibilityBtn'; ac.textContent = '♿ Voice-Friendly Mode';
  ac.addEventListener('click', toggleAccessibility);
  suggestions.parentElement.insertBefore(ac, ss);

  // Text input
  const tib = document.createElement('div');
  tib.id = 'textInputArea';
  tib.innerHTML = `<div id="textInputRow"><input id="textInput" type="text" placeholder="Type here if mic is not working..."/><button id="textSendBtn">➤</button></div>`;
  assistantPanel.appendChild(tib);

  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'toggleTextBtn'; toggleBtn.textContent = '⌨️ Prefer typing? Click here';
  toggleBtn.addEventListener('click', () => {
    const area = document.getElementById('textInputArea');
    const show = area.style.display === 'flex';
    area.style.display = show ? 'none' : 'flex';
    area.style.flexDirection = 'column';
    toggleBtn.textContent = show ? '⌨️ Prefer typing? Click here' : '🎤 Switch back to voice';
  });
  assistantPanel.insertBefore(toggleBtn, tib);

  document.getElementById('textSendBtn').addEventListener('click', sendTextInput);
  document.getElementById('textInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendTextInput(); });
}

function sendTextInput() {
  const inp = document.getElementById('textInput');
  const q   = inp.value.trim();
  if (!q) return;
  userText.textContent = `"${q}"`;
  inp.value = '';
  if (isBotSpeaking) { window.speechSynthesis.cancel(); isBotSpeaking = false; }
  handleUserQuery(q);
}

/* ---- Helper UI functions ---- */
function updateSessionTime() { const el=document.getElementById('sessionTime'); if(el){const m=Math.floor((Date.now()-sessionStart)/60000);el.textContent=`⏱️ ${m}m`;} }
let sessionStart = Date.now();
function updateSessionCount() { sessionQuestions++; const el=document.getElementById('sessionCount'); if(el) el.textContent=`💬 ${sessionQuestions} question${sessionQuestions>1?'s':''}`; }
function updateMood(level) {
  if (level==='high'||level==='emergency') moodScore=Math.max(0,moodScore-15);
  else if (level==='medium') moodScore=Math.max(20,moodScore-5);
  else moodScore=Math.min(100,moodScore+5);
  const fill=document.getElementById('moodBarFill'); const bar=document.getElementById('moodBar');
  if(!fill||!bar) return;
  fill.style.width=`${moodScore}%`;
  let emoji='😐'; if(moodScore>=75) emoji='😊'; else if(moodScore>=50) emoji='🙂'; else if(moodScore>=25) emoji='😟'; else emoji='😢';
  bar.firstChild.textContent=`${emoji} Conversation Mood`;
}

const smartChipsMap = {
  default:     ['🎓 Courses?','💰 Fees?','📝 How to apply?','🏆 Scholarship?'],
  fees:        ['💻 CSE fees?','🤖 AI & ML fees?','📊 Data Science fees?','🏆 Scholarship?'],
  admission:   ['📄 Documents needed?','📅 Deadline?','🏠 Hostel?'],
  hostel:      ['💰 Hostel fees?','📝 How to apply?'],
  scholarship: ['📝 How to apply?','💰 Fees?','📅 Deadline?'],
  placement:   ['📝 How to apply?','🎓 Courses?'],
  courses:     ['💰 Fees?','📝 Apply?','🏆 Scholarship?'],
  contact:     ['📝 Apply?','💰 Fees?','🎓 Courses?']
};
function updateSmartSuggestions(topic) {
  const chips=smartChipsMap[topic]||smartChipsMap.default;
  const ss=document.getElementById('smartSuggestions');
  if(!ss) return;
  ss.innerHTML=chips.map(c=>`<button class="smart-chip" onclick="askQuestion('${c.replace(/['"🎓💰📝🏆💻🤖📊🏠📄📅🔴🟢🟡⚡]/g,'').trim()}')">${c}</button>`).join('');
}

const dykFacts=['🏆 Aurora is ranked #1 Tech Institute 2024!','💡 Our AI Lab is open 24/7 for students!','🏆 Top 10% students get 50% scholarship!','📈 98% placement rate with 200+ companies!','🌐 Aurora alumni work in 15+ countries!','🤖 Our AI Lab has 50+ GPU workstations!','📚 Library has 50,000+ books!','🏠 On-campus hostel with 24/7 security!'];
let dykIdx=0;
function startDidYouKnow() {
  didYouKnowTimer=setInterval(()=>{
    const b=document.getElementById('didYouKnow'); if(!b) return;
    b.style.display='block'; b.textContent=`💡 Did You Know? ${dykFacts[dykIdx%dykFacts.length]}`; dykIdx++;
    setTimeout(()=>{if(b) b.style.display='none';},8000);
  },60000);
}

function getTimeGreeting() {
  const h=new Date().getHours();
  if(h<12) return {en:'Good Morning',hi:'Suprabhat',mr:'Shubh Sakal'};
  if(h<17) return {en:'Good Afternoon',hi:'Namaskar',mr:'Shubh Dopahar'};
  return {en:'Good Evening',hi:'Shubh Sandhya',mr:'Shubh Sandhyakal'};
}

function toggleAccessibility() {
  accessibilityMode=!accessibilityMode;
  const btn=document.getElementById('accessibilityBtn');
  if(accessibilityMode){btn.classList.add('active');btn.textContent='♿ Voice-Friendly: ON';aiText.style.fontSize='1.1rem';aiText.style.lineHeight='1.9';speakText('Voice friendly mode ON.','en-IN');if(!isListening)startListening();}
  else{btn.classList.remove('active');btn.textContent='♿ Voice-Friendly Mode';aiText.style.fontSize='';aiText.style.lineHeight='';}
}

/* ============================================================
   EMOTION DETECTION
   ============================================================ */
function detectEmotion(text) {
  const t=text.toLowerCase();
  if(['emergency','please help','no one helping','i am lost','koi nahi sun','madad karo'].some(w=>t.includes(w))) return 'emergency';
  if(['angry','frustrated','useless','urgent','asap','deadline','complaint','problem','gussa','jaldi','turant','shikayat'].some(w=>t.includes(w))) return 'high';
  if(['happy','great','awesome','love it','amazing','khushi','bahut accha','mast'].some(w=>t.includes(w))) return 'happy';
  if(['confused','dont understand',"don't understand",'not sure','help me','explain','please','samajh nahi','batao','kaise','pata nahi'].some(w=>t.includes(w))) return 'medium';
  return 'normal';
}

function showEmotionLabel(level) {
  const label=document.getElementById('emotionLabel'); const eBtn=document.getElementById('emergencyBtn');
  if(!label) return;
  label.className=level;
  const map={normal:'🟢 Normal',medium:'🟠 Medium',high:'🔴 High Priority',emergency:'🚨 EMERGENCY',funny:'😄 Off-Topic',mental:'💙 Support Mode',happy:'😊 Happy'};
  label.textContent=map[level]||'🟢 Normal';
  if(eBtn) eBtn.style.display=level==='emergency'?'block':'none';
}

function getEmotionPrefix(level) {
  const p=PERSONALITIES[personalityMode].prefix;
  if(level==='emergency') return {en:"I hear you and I'm here for you. 🙏 ",hi:"Main yahan hoon, ghabrao mat. 🙏 ",mr:"Mi ithe aahe, ghabaru naka. 🙏 "};
  if(level==='high')      return {en:"I understand your concern, let me help! 🙏 ",hi:"Samajh gaya, abhi help karta hoon! 🙏 ",mr:"Samajhle, ata madad karto! 🙏 "};
  if(level==='medium')    return {en:"No worries, let me explain! 😊 ",hi:"Koi baat nahi! 😊 ",mr:"Kaahi nahi! 😊 "};
  if(level==='happy')     return {en:"Awesome! 🎉 ",hi:"Bahut badhiya! 🎉 ",mr:"Khup chhan! 🎉 "};
  return p;
}

/* ============================================================
   OFF-TOPIC + CHUP HO
   ============================================================ */
function checkOffTopic(query) {
  const q=query.toLowerCase();
  if(['chup','chup ho','shut up','shutup','band karo','band ho','quiet','shh','bas karo','khamosh','navde','thamba'].some(w=>q.includes(w))) return 'shutup';
  if(['stupid bot','useless bot','dumb bot','bekar bot','faltu','bekaar','bakwaas bot','idiot','pagal','gadha','ullu','bewakoof'].some(w=>q.includes(w))) return 'insult';
  if(['weather','cricket','movie','song','music','joke','food','recipe','sports','ipl','politics','girlfriend','boyfriend','game','pubg','youtube','netflix','instagram','tiktok','meme','crypto','bitcoin'].some(w=>q.includes(w))) return 'offtopic';
  return null;
}

function getOffTopicResponse(type) {
  if(type==='shutup')  return {en:"Haha! 😄 I understand, but I'm just doing my job! Ask me about courses, fees or admissions!",hi:"Haha! 😄 Main samajhta hoon, lekin main apna kaam kar raha hoon! Aurora ke baare mein poochho!",mr:"Haha! 😄 Mi samajhto, pan mi mazha kaam karto! Aurora baddal vicharaa!"};
  if(type==='insult')  return {en:"That's okay! 😊 I may not be perfect, but I know everything about Aurora Institute! Ask me!",hi:"Koi baat nahi! 😊 Perfect nahi hoon lekin Aurora ke baare mein sab jaanta hoon!",mr:"Kaahi harkat nahi! 😊 Aurora baddal sagal maahit aahe!"};
  if(type==='offtopic') return {en:"Ha! 😄 I wish I could help! But I'm a college admission assistant — ask me about Aurora!",hi:"Ha! 😄 Kash help kar paata! Lekin main college assistant hoon — Aurora ke baare mein poochho!",mr:"Ha! 😄 Khup chhan asel! Pan mi college assistant aahe — Aurora baddal vicharaa!"};
  return null;
}

/* ============================================================
   CONTEXT MEMORY
   ============================================================ */
let ctx={lastTopic:null,lastCourse:null,log:[]};
function updateMemory(q,reply){
  const t=q.toLowerCase();
  if(matches(t,['fee','cost','price','tuition','kitni','fees','lagegi','shulk'])) ctx.lastTopic='fees';
  else if(matches(t,['admission','apply','join','enroll','daakhila','pravesh'])) ctx.lastTopic='admission';
  else if(matches(t,['hostel','accommodation','room','stay','rehna'])) ctx.lastTopic='hostel';
  else if(matches(t,['document','certificate','marksheet','kagaz'])) ctx.lastTopic='documents';
  else if(matches(t,['scholarship','waiver','financial','maafi','shishyavrutti'])) ctx.lastTopic='scholarship';
  else if(matches(t,['placement','job','career','naukri','salary'])) ctx.lastTopic='placement';
  else if(matches(t,['course','programme','branch'])) ctx.lastTopic='courses';
  if(matches(t,['computer','cse'])) ctx.lastCourse='cse';
  else if(matches(t,['ai','ml','machine learning'])) ctx.lastCourse='aiml';
  else if(matches(t,['data science','data'])) ctx.lastCourse='ds';
  else if(matches(t,['electronics','ece'])) ctx.lastCourse='ece';
  ctx.log.push({user:q,ai:reply}); if(ctx.log.length>4) ctx.log.shift();
  updateSmartSuggestions(ctx.lastTopic||'default');
}

/* ============================================================
   KNOWLEDGE BASE
   ============================================================ */
const KB = {
  identity:{
    keywords:['who are you','what are you','introduce yourself','your name','tum kaun','aap kaun','tumhara naam','tell me about yourself','apna parichay','tumhi kon','tumche nav','which ai','are you ai','are you robot','tera naam'],
    en:"I'm EduNex! 🤖 I'm an AI-powered Voice Assistant built for Aurora Institute of Technology. I understand Hindi, English AND Marathi! I can detect your mood, adapt my voice, switch personalities, and even give you a virtual AR campus tour! Think of me as your 24/7 emotionally-intelligent college admission guide. 😊",
    hi:"Main EduNex hoon! 🤖 Main Aurora Institute ke liye banaya gaya AI Voice Assistant hoon. Main Hindi, English aur Marathi teeno samajhta hoon! Main aapka mood detect karta hoon, apni awaaz change karta hoon, aur AR campus tour bhi de sakta hoon! Main aapka 24/7 college guide hoon. 😊",
    mr:"Mi EduNex aahe! 🤖 Mi Aurora Institute sathi banawlela AI Voice Assistant aahe. Mi Hindi, English ani Marathi teenhee samajhto! Mi tumcha mood detect karto, maza aawaz badlato, ani AR campus tour pan deto! Mi tumcha 24/7 college guide aahe. 😊"
  },
  fees:{
    keywords:['fee','cost','price','tuition','charges','rupee','money','kitni','kitna','paisa','fees','lagegi','lagto','shulk','kharcha'],
    en:{general:"Aurora fees/year: 💻 Computer Engg ₹1,20,000 | 🤖 AI & ML ₹1,45,000 | 📊 Data Science ₹1,35,000 | ⚡ Electronics ₹1,15,000. All include tuition, lab, library and career support.",cse:"Computer Engineering fee: ₹1,20,000/year — tuition, lab, library and career support included.",aiml:"AI & ML fee: ₹1,45,000/year — 24/7 AI Lab, cloud credits, global certification and research fellowship.",ds:"Data Science fee: ₹1,35,000/year — data lab, software licences, datasets and career support.",ece:"Electronics fee: ₹1,15,000/year — electronics lab, IoT kits and career support."},
    hi:{general:"Aurora ki fees/saal: 💻 Computer Engg ₹1,20,000 | 🤖 AI & ML ₹1,45,000 | 📊 Data Science ₹1,35,000 | ⚡ Electronics ₹1,15,000. Sabmein tuition, lab, library aur career support.",cse:"Computer Engineering: ₹1,20,000/saal — tuition, lab, library aur career support.",aiml:"AI & ML: ₹1,45,000/saal — AI Lab, cloud credits, certification aur fellowship.",ds:"Data Science: ₹1,35,000/saal — data lab, software, datasets aur career support.",ece:"Electronics: ₹1,15,000/saal — lab, IoT kits aur career support."},
    mr:{general:"Aurora chi fees/varsha: 💻 Computer Engg ₹1,20,000 | 🤖 AI & ML ₹1,45,000 | 📊 Data Science ₹1,35,000 | ⚡ Electronics ₹1,15,000.",cse:"Computer Engineering: ₹1,20,000/varsha.",aiml:"AI & ML: ₹1,45,000/varsha.",ds:"Data Science: ₹1,35,000/varsha.",ece:"Electronics: ₹1,15,000/varsha."}
  },
  admission:{keywords:['admission','apply','application','join','enroll','eligibility','process','how to apply','daakhila','kaise apply','pravesh'],en:"Admission — 4 steps: 1️⃣ Online Application 2️⃣ JEE/CET scores 3️⃣ Personal Interview 4️⃣ Confirmation fee + offer letter. Open year round!",hi:"Admission — 4 steps: 1️⃣ Online Application 2️⃣ JEE/CET score 3️⃣ Personal Interview 4️⃣ Confirmation fee + offer letter. Saal bhar open!",mr:"Pravesh — 4 steps: 1️⃣ Online Application 2️⃣ JEE/CET score 3️⃣ Personal Interview 4️⃣ Confirmation fee + offer letter."},
  deadline:{keywords:['deadline','last date','closing date','cutoff','when to apply','kab tak','aakhri','antim','kevha'],en:"Aurora accepts applications year round! Apply 2 months before your target batch. Call +91 98765 43210 for exact dates.",hi:"Applications saal bhar! 2 mahine pehle apply karo. +91 98765 43210 pe call karo.",mr:"Applications varshabhaar! 2 mahine adhi apply kara. +91 98765 43210."},
  hostel:{keywords:['hostel','accommodation','room','stay','living','mess','rehna','vastigruh'],en:"On-campus hostel for boys and girls — furnished rooms, 24/7 security, WiFi, hygienic mess and laundry. Fees separate.",hi:"Boys aur girls ke liye hostel — furnished rooms, security, WiFi, khana, laundry. Fees alag.",mr:"Mulga-mulinsathi hostel — furnished rooms, security, WiFi, jevan, laundry."},
  documents:{keywords:['document','certificate','marksheet','id proof','photo','required','submit','kagaz','papers','kya chahiye','kaay lagel'],en:"Documents: 1.10th marksheet 2.12th marksheet 3.JEE/CET scorecard 4.Aadhar 5.Photos×4 6.Category cert 7.Migration cert.",hi:"Documents: 1.10th marksheet 2.12th marksheet 3.JEE/CET scorecard 4.Aadhar 5.Photos×4 6.Category cert 7.Migration cert.",mr:"Kagadpatre: 1.10vi 2.12vi 3.JEE/CET 4.Aadhar 5.Photos×4 6.Category cert 7.Migration cert."},
  scholarship:{keywords:['scholarship','waiver','financial aid','discount','free','concession','maafi','shishyavrutti'],en:"Merit Scholarship: top 10% get up to 50% fee waiver! Need-Based also available. Email admissions@aurora.edu.in.",hi:"Merit Scholarship: top 10% ko 50% fees maafi! Need-Based bhi. Email admissions@aurora.edu.in.",mr:"Merit Scholarship: top 10% na 50% maafi! Need-Based pan aahe. Email admissions@aurora.edu.in."},
  placement:{keywords:['placement','job','career','recruit','salary','package','company','naukri','nokri'],en:"98% placement rate with 200+ industry partners! Resume, mock interviews and company connections from 3rd year itself.",hi:"98% placement, 200+ partners! Resume, mock interviews aur 3rd year se connections.",mr:"98% placement, 200+ partners! Resume, mock interviews ani 3rya varshapaasun connections."},
  campus:{keywords:['campus','facility','lab','library','sports','wifi','canteen','cafeteria','suvidha'],en:"Aurora has: 24/7 AI Lab, Electronics Lab, library, high-speed WiFi, sports complex, cafeteria and hostel.",hi:"Aurora mein: AI Lab, Electronics Lab, library, WiFi, sports, cafeteria aur hostel.",mr:"Aurora madhe: AI Lab, Electronics Lab, library, WiFi, sports, cafeteria ani hostel."},
  courses:{keywords:['course','programme','branch','department','offered','available','kaunsa','konsa','kya kya','konte'],en:"4 B.Tech programmes: 1.Computer Engineering 2.AI & ML 3.Data Science 4.Electronics Engineering. All 4-year degrees!",hi:"4 B.Tech: 1.Computer Engineering 2.AI & ML 3.Data Science 4.Electronics Engineering.",mr:"4 B.Tech: 1.Computer Engineering 2.AI & ML 3.Data Science 4.Electronics Engineering."},
  contact:{keywords:['contact','phone','email','address','location','reach','office','sampark','kahan','number'],en:"Phone: +91 98765 43210 | Email: admissions@aurora.edu.in | Tech Park Road, Sector 17, Innovation City. Mon–Fri 9AM–5PM.",hi:"Phone: +91 98765 43210 | Email: admissions@aurora.edu.in | Mon–Fri 9–5.",mr:"Phone: +91 98765 43210 | Email: admissions@aurora.edu.in | Som–Shukra 9–5."}
};

function getResponse(query) {
  const q=query.toLowerCase(); const g=getTimeGreeting();
  const followUp=['cse','computer','ai','ml','data','electronics','ece'].some(w=>q.includes(w));
  if(ctx.lastTopic==='fees'&&followUp){
    const fd=KB.fees;
    if(matches(q,['computer','cse']))             return{en:fd.en.cse, hi:fd.hi.cse, mr:fd.mr.cse};
    if(matches(q,['ai','ml','machine learning'])) return{en:fd.en.aiml,hi:fd.hi.aiml,mr:fd.mr.aiml};
    if(matches(q,['data']))                       return{en:fd.en.ds,  hi:fd.hi.ds,  mr:fd.mr.ds};
    if(matches(q,['electronics','ece']))          return{en:fd.en.ece, hi:fd.hi.ece, mr:fd.mr.ece};
  }
  if(KB.identity.keywords.some(k=>q.includes(k))) return{en:KB.identity.en,hi:KB.identity.hi,mr:KB.identity.mr};
  for(const[,data] of Object.entries(KB)){
    if(!data.keywords) continue;
    if(data.keywords.some(k=>q.includes(k))){
      if(data.en&&typeof data.en==='object'){
        if(matches(q,['computer','cse']))             return{en:data.en.cse,    hi:data.hi.cse,    mr:data.mr.cse};
        if(matches(q,['ai','ml','machine learning'])) return{en:data.en.aiml,   hi:data.hi.aiml,   mr:data.mr.aiml};
        if(matches(q,['data science','data']))        return{en:data.en.ds,     hi:data.hi.ds,     mr:data.mr.ds};
        if(matches(q,['electronics','ece']))          return{en:data.en.ece,    hi:data.hi.ece,    mr:data.mr.ece};
        return{en:data.en.general,hi:data.hi.general,mr:data.mr.general};
      }
      return{en:data.en,hi:data.hi,mr:data.mr};
    }
  }
  if(matches(q,['hello','hi','hey','good morning','namaste','namaskar'])) return{en:`${g.en}! 👋 I'm EduNex, Aurora's AI Assistant. How can I help you today?`,hi:`${g.hi}! 👋 Main EduNex hoon, Aurora ka AI Assistant. Kya help kar sakta hoon?`,mr:`${g.mr}! 👋 Mi EduNex aahe. Kasa madhat karu?`};
  if(matches(q,['thank','thanks','shukriya','dhanyawad','ok','okay','great'])) return{en:"You're welcome! 😊 Anything else about Aurora?",hi:"Bahut shukriya! 😊 Aur kuch?",mr:"Dhanyavaad! 😊 Itar kaahi?"};
  return{en:"I can help with fees, admission, hostel, documents, scholarships, placements and campus info. What would you like to know?",hi:"Main fees, admission, hostel, documents, scholarship aur placement ke baare mein help kar sakta hoon!",mr:"Mi fees, pravesh, hostel, kagadpatre, shishyavrutti ani placements baddal madhat karu shakto!"};
}

function matches(q,kws){return kws.some(k=>q.includes(k));}

function buildReplyHTML(responses,prefix,lang){
  const pe=prefix.en||'',ph=prefix.hi||'',pm=prefix.mr||'';
  if(lang==='en-IN') return `<span class="en-reply">🇬🇧 ${pe}${responses.en}</span>`;
  if(lang==='hi-IN') return `<span class="hi-reply">🇮🇳 ${ph}${responses.hi}</span>`;
  if(lang==='mr-IN') return `<span class="mr-reply">🟠 ${pm}${responses.mr}</span>`;
  return `<span class="en-reply">🇬🇧 ${pe}${responses.en}</span><hr class="lang-divider"><span class="hi-reply">🇮🇳 ${ph}${responses.hi}</span><hr class="lang-divider"><span class="mr-reply">🟠 ${pm}${responses.mr}</span>`;
}

/* ============================================================
   SPEECH — with emotion-based voice modulation
   ============================================================ */
function speakText(text, lang, emotionLevel) {
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); isBotSpeaking=true;
  const vs  = getVoiceSettings(emotionLevel||'normal');
  const acc = ACCENTS[localAccent];
  const u   = new SpeechSynthesisUtterance(text);
  u.lang    = (lang==='mr-IN'||localAccent!=='default') ? acc.langCode : lang||'en-IN';
  u.rate    = accessibilityMode ? 0.78 : vs.rate;
  u.pitch   = accessibilityMode ? 0.90 : vs.pitch;
  u.volume  = vs.volume;
  const voices=window.speechSynthesis.getVoices();
  const voice=voices.find(v=>v.lang.startsWith(u.lang.split('-')[0]));
  if(voice) u.voice=voice;
  u.onstart=()=>{assistantStatus.textContent='🔊 Speaking...';assistantWave.classList.add('active');};
  u.onend=()=>{isBotSpeaking=false;assistantStatus.textContent='Ready to help';assistantWave.classList.remove('active');if(autoRestartEnabled&&assistantPanel.classList.contains('open'))setTimeout(()=>startListening(),500);};
  window.speechSynthesis.speak(u);
}

function speakAllLangs(responses,prefix,emotionLevel){
  if(!window.speechSynthesis) return;
  window.speechSynthesis.cancel(); isBotSpeaking=true;
  const voices=window.speechSynthesis.getVoices();
  const vs=getVoiceSettings(emotionLevel||'normal');
  const acc=ACCENTS[localAccent];
  const lk=currentLang==='en-IN'?'en':currentLang==='hi-IN'?'hi':'mr';
  const langMap={en:'en-IN',hi:'hi-IN',mr:'mr-IN'};
  const items=currentLang==='all'?['en','hi','mr'].map(l=>({text:(prefix[l]||'')+responses[l],lang:langMap[l]})):[{text:(prefix[lk]||'')+responses[lk],lang:currentLang}];
  function next(i){
    if(i>=items.length){isBotSpeaking=false;assistantStatus.textContent='Ready to help';assistantWave.classList.remove('active');if(autoRestartEnabled&&assistantPanel.classList.contains('open'))setTimeout(()=>startListening(),600);return;}
    const u=new SpeechSynthesisUtterance(items[i].text);
    const useLang=(items[i].lang==='mr-IN'&&localAccent!=='default')?acc.langCode:items[i].lang;
    u.lang=useLang; u.rate=accessibilityMode?0.78:vs.rate; u.pitch=accessibilityMode?0.90:vs.pitch; u.volume=vs.volume;
    const v=voices.find(v=>v.lang.startsWith(u.lang.split('-')[0])); if(v) u.voice=v;
    u.onstart=()=>{assistantStatus.textContent='🔊 Speaking...';assistantWave.classList.add('active');};
    u.onend=()=>next(i+1); u.onerror=()=>next(i+1);
    window.speechSynthesis.speak(u);
  }
  next(0);
}
if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=()=>window.speechSynthesis.getVoices();

/* ============================================================
   SPEECH RECOGNITION
   ============================================================ */
function initRecognition(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){aiText.textContent="Please use Chrome or Edge.";return null;}
  const rec=new SR(); rec.continuous=false; rec.interimResults=false;
  rec.lang=currentLang==='all'?'hi-IN':currentLang;
  rec.onstart=()=>{isListening=true;userText.textContent='🎙️ Listening...';assistantStatus.textContent='🔴 Listening...';startBtn.classList.add('listening');assistantWave.classList.add('active');};
  rec.onresult=(e)=>{const t=e.results[0][0].transcript.trim();userText.textContent=`"${t}"`;if(isBotSpeaking){window.speechSynthesis.cancel();isBotSpeaking=false;}handleUserQuery(t);};
  rec.onspeechend=()=>{try{recognition.stop();}catch(_){}};
  rec.onerror=(e)=>{
    if(e.error==='not-allowed') aiText.textContent='⚠️ Mic denied. Allow in browser settings.';
    else if(e.error==='no-speech'){aiText.textContent='🔇 No speech. Try mic or type below!';if(accessibilityMode)setTimeout(()=>startListening(),1500);}
    else aiText.textContent=`Error: ${e.error}.`;
    resetListeningState();
  };
  rec.onend=()=>resetListeningState(); return rec;
}
function startListening(){if(isBotSpeaking||isListening)return;recognition=initRecognition();if(!recognition)return;try{recognition.start();}catch(e){console.warn(e);}}
function stopListening(){if(recognition){try{recognition.stop();}catch(_){}}resetListeningState();}
function resetListeningState(){isListening=false;startBtn.classList.remove('listening');assistantWave.classList.remove('active');assistantStatus.textContent='Ready to help';}

startBtn.addEventListener('click',()=>{const o=assistantPanel.classList.toggle('open');if(o){buildExtraUIOnce();startListening();}else{stopListening();window.speechSynthesis.cancel();if(didYouKnowTimer)clearInterval(didYouKnowTimer);}});
assistantClose.addEventListener('click',()=>{assistantPanel.classList.remove('open');stopListening();window.speechSynthesis.cancel();if(didYouKnowTimer)clearInterval(didYouKnowTimer);});
let uiBuilt2=false;
function buildExtraUIOnce(){if(!uiBuilt2){buildExtraUI();uiBuilt2=true;}}

window.askQuestion=function(q){
  assistantPanel.classList.add('open');buildExtraUIOnce();
  userText.textContent=`"${q}"`;showThinking();
  if(isBotSpeaking){window.speechSynthesis.cancel();isBotSpeaking=false;}
  setTimeout(()=>handleUserQuery(q),300);
};
function showThinking(){aiText.innerHTML='<span id="thinkingDots"><span></span><span></span><span></span></span>';assistantStatus.textContent='⚙️ Thinking...';assistantWave.classList.add('active');}

/* ============================================================
   MAIN HANDLER — all features come together
   ============================================================ */
function handleUserQuery(query) {
  showThinking();
  setTimeout(() => {
    updateSessionCount();

    // ✅ 1. AR Tour check
    if (checkARCommand(query)) { assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help'; return; }

    // ✅ 2. Personality switch
    const newMode = detectPersonalitySwitch(query);
    if (newMode) {
      personalityMode = newMode;
      document.querySelectorAll('.p-btn').forEach(b=>b.classList.remove('active'));
      document.querySelector(`.p-btn.${newMode}`)?.classList.add('active');
      const p = PERSONALITIES[newMode];
      const r = {en:`${p.label} activated! 😊 I'll now talk to you in a ${newMode} style.`,hi:`${p.label} activate ho gaya! Main ab ${newMode} style mein bolunga.`,mr:`${p.label} activate zhala! Mi ata ${newMode} style madhe bolto.`};
      aiText.innerHTML = buildReplyHTML(r,{en:'',hi:'',mr:''},currentLang);
      assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help';
      speakAllLangs(r,{en:'',hi:'',mr:''},'normal');
      return;
    }

    // ✅ 3. Accent switch
    const newAccent = detectAccentSwitch(query);
    if (newAccent && matches(query.toLowerCase(),['accent','bol','bolav','speak'])) {
      localAccent = newAccent;
      document.querySelectorAll('.accent-btn').forEach(b=>b.classList.remove('active'));
      document.querySelector(`[data-accent="${newAccent}"]`)?.classList.add('active');
      const r={en:`Switched to ${newAccent} accent! 🟠`,hi:`${newAccent} accent set ho gaya!`,mr:`${newAccent} accent set zhala!`};
      aiText.innerHTML=buildReplyHTML(r,{en:'',hi:'',mr:''},currentLang);
      assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help';
      speakAllLangs(r,{en:'',hi:'',mr:''},'normal'); return;
    }

    // ✅ 4. Mental health check
    if (checkMentalHealth(query)) {
      showEmotionLabel('mental');
      const r = getMentalHealthResponse();
      aiText.innerHTML = buildReplyHTML(r,{en:'',hi:'',mr:''},currentLang);
      assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help';
      speakAllLangs(r,{en:'',hi:'',mr:''},'emergency');
      updateMood('emergency'); return;
    }

    // ✅ 5. Off-topic check
    const offType = checkOffTopic(query);
    if (offType) {
      showEmotionLabel('funny');
      const r = getOffTopicResponse(offType);
      aiText.innerHTML = buildReplyHTML(r,{en:'',hi:'',mr:''},currentLang);
      assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help';
      speakAllLangs(r,{en:'',hi:'',mr:''},'normal');
      updateMood('normal'); return;
    }

    // ✅ 6. Predictive admission guidance
    const predReply = checkAdmissionGuidance(query);
    if (predReply) {
      showEmotionLabel('normal');
      aiText.innerHTML = buildReplyHTML(predReply,{en:'',hi:'',mr:''},currentLang);
      assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help';
      speakAllLangs(predReply,{en:'',hi:'',mr:''},'normal');
      updateMemory(query,predReply.en); updateMood('normal'); return;
    }

    // ✅ 7. Normal college query
    const emotionLevel = detectEmotion(query);
    const prefix       = getEmotionPrefix(emotionLevel);
    showEmotionLabel(emotionLevel);
    updateMood(emotionLevel);

    const responses = getResponse(query);
    aiText.innerHTML = buildReplyHTML(responses,prefix,currentLang);
    assistantWave.classList.remove('active'); assistantStatus.textContent='Ready to help';

    // ✅ EMOTION-BASED VOICE MODULATION happens inside speakAllLangs
    speakAllLangs(responses,prefix,emotionLevel);
    updateMemory(query,responses.en);

    if(emotionLevel==='emergency') speakText('Connecting you to an admission counselor!','en-IN','emergency');
  }, 0);
}

/* ---- CARD ANIMATIONS ---- */
const obs=new IntersectionObserver((entries)=>{entries.forEach((e,i)=>{if(e.isIntersecting){setTimeout(()=>{e.target.style.opacity='1';e.target.style.transform='translateY(0)';},i*80);obs.unobserve(e.target);}});},{threshold:0.12,rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.course-card,.step-card,.fee-card,.contact-item,.gallery-item').forEach((el,i)=>{el.style.opacity='0';el.style.transform='translateY(24px)';el.style.transition=`opacity 0.5s ease ${i*0.05}s, transform 0.5s ease ${i*0.05}s, box-shadow 0.3s, border-color 0.3s`;obs.observe(el);});