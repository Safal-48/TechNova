// =============================================
//  AURORA INSTITUTE OF TECHNOLOGY — script.js
//  EduNex AI Voice Assistant + UI Logic
// =============================================

/* ---- NAVBAR: Scroll Effect & Active Links ---- */
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Sticky style
  navbar.classList.toggle('scrolled', window.scrollY > 40);

  // Active nav link highlight
  let current = '';
  sections.forEach(section => {
    if (window.scrollY >= section.offsetTop - 120) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
});

/* ---- MOBILE HAMBURGER ---- */
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinksContainer.classList.toggle('open');
  const isOpen = navLinksContainer.classList.contains('open');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu when a link is clicked
navLinksContainer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinksContainer.classList.remove('open');
  });
});

/* ---- SMOOTH SCROLL (fallback for older browsers) ---- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- CONTACT FORM SUBMIT ---- */
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', e => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = '✅ Enquiry Sent!';
  btn.disabled = true;
  btn.style.opacity = '0.8';
  setTimeout(() => {
    contactForm.reset();
    btn.textContent = 'Send Enquiry 🚀';
    btn.disabled = false;
    btn.style.opacity = '1';
  }, 3000);
});

/* ============================================
   EDUNEX AI VOICE ASSISTANT
   ============================================ */

const startBtn         = document.getElementById('startBtn');
const assistantPanel   = document.getElementById('assistantPanel');
const assistantClose   = document.getElementById('assistantClose');
const userText         = document.getElementById('userText');
const aiText           = document.getElementById('aiText');
const assistantStatus  = document.getElementById('assistantStatus');
const assistantWave    = document.getElementById('assistantWave');

let isListening = false;
let recognition  = null;

/* --- Open / Close panel --- */
startBtn.addEventListener('click', () => {
  const isOpen = assistantPanel.classList.toggle('open');
  if (isOpen) {
    startListening();
  } else {
    stopListening();
  }
});

assistantClose.addEventListener('click', () => {
  assistantPanel.classList.remove('open');
  stopListening();
});

/* --- Speech Recognition Setup --- */
function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    aiText.textContent = "Speech recognition isn't supported in this browser. Try Chrome or Edge.";
    return null;
  }

  const rec = new SpeechRecognition();
  rec.continuous      = false;
  rec.interimResults  = false;
  rec.lang            = 'en-IN';

  rec.onstart = () => {
    isListening = true;
    userText.textContent    = 'Listening...';
    aiText.textContent      = 'Processing your request...';
    assistantStatus.textContent = '🔴 Listening...';
    startBtn.classList.add('listening');
    assistantWave.classList.add('active');
  };

  rec.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    userText.textContent = `"${transcript}"`;
    processQuery(transcript);
  };

  rec.onerror = (event) => {
    if (event.error === 'not-allowed') {
      aiText.textContent = '⚠️ Microphone access denied. Please allow mic permissions in browser settings.';
    } else if (event.error === 'no-speech') {
      aiText.textContent = "I didn't catch that. Please try again!";
    } else {
      aiText.textContent = `Error: ${event.error}. Please try again.`;
    }
    resetListeningState();
  };

  rec.onend = () => {
    resetListeningState();
  };

  return rec;
}

function startListening() {
  recognition = initRecognition();
  if (!recognition) return;

  userText.textContent  = 'Listening...';
  aiText.textContent    = 'Processing your request...';

  try {
    recognition.start();
  } catch (err) {
    console.warn('Recognition already started:', err);
  }
}

function stopListening() {
  if (recognition) {
    try { recognition.stop(); } catch (_) {}
  }
  resetListeningState();
}

function resetListeningState() {
  isListening = false;
  startBtn.classList.remove('listening');
  assistantWave.classList.remove('active');
  assistantStatus.textContent = 'Ready to help';
}

/* --- Suggestion chip helper --- */
window.askQuestion = function(question) {
  assistantPanel.classList.add('open');
  userText.textContent  = `"${question}"`;
  aiText.textContent    = 'Processing your request...';
  assistantWave.classList.add('active');
  setTimeout(() => {
    processQuery(question);
  }, 600);
};

/* --- AI Knowledge Base --- */
function processQuery(query) {
  const q = query.toLowerCase();
  let response = '';

  if (matches(q, ['course', 'programme', 'study', 'degree', 'branch', 'offered'])) {
    response = "Aurora Institute offers 4 B.Tech programmes: Computer Engineering, AI & Machine Learning, Data Science, and Electronics Engineering. All are 4-year degree programmes with industry exposure.";
  } else if (matches(q, ['fee', 'cost', 'price', 'tuition', 'charges', 'money', 'rupee'])) {
    response = "Fees range from ₹1,15,000 to ₹1,45,000 per year depending on the course. AI & ML is ₹1,45,000, Data Science is ₹1,35,000, Computer Engineering is ₹1,20,000, and Electronics is ₹1,15,000.";
  } else if (matches(q, ['admission', 'apply', 'application', 'join', 'enroll', 'eligibility'])) {
    response = "Admissions involve 4 steps: Online Application → Entrance Exam (AIT/JEE/CET) → Personal Interview → Confirmation. You can apply through our website or contact the admissions office.";
  } else if (matches(q, ['scholarship', 'financial aid', 'discount', 'waiver', 'free'])) {
    response = "Merit scholarships are available! Top 10% scorers receive up to 50% fee waiver. Need-based scholarships are also offered. Contact admissions for details.";
  } else if (matches(q, ['placement', 'job', 'career', 'recruit', 'hire', 'package', 'salary'])) {
    response = "Aurora has a 98% placement rate with 200+ industry partners including top tech firms. Our career cell provides dedicated support for internships and full-time placements.";
  } else if (matches(q, ['contact', 'phone', 'email', 'address', 'location', 'reach', 'office'])) {
    response = "You can reach us at +91 98765 43210 or admissions@aurora.edu.in. We're located at Aurora Campus, Tech Park Road, Sector 17, Innovation City – 400 001. Office hours: Mon–Fri 9AM–5PM.";
  } else if (matches(q, ['ai', 'machine learning', 'ml', 'artificial intelligence', 'deep learning'])) {
    response = "Our AI & Machine Learning programme is our most popular course! It covers neural networks, NLP, computer vision, and deep learning with a dedicated AI Research Lab and 24/7 lab access.";
  } else if (matches(q, ['computer', 'cse', 'software', 'programming', 'engineering'])) {
    response = "Computer Engineering covers software development, OS, databases, networking, and modern dev practices. It's a 4-year B.Tech with guaranteed internship placements.";
  } else if (matches(q, ['data science', 'data', 'analytics', 'big data', 'python', 'statistics'])) {
    response = "Data Science at Aurora covers Python, R, statistical modelling, big data tools like Hadoop & Spark, and real-world capstone projects. Great for aspiring data engineers and analysts.";
  } else if (matches(q, ['electronics', 'iot', 'vlsi', 'embedded', 'hardware', 'circuit'])) {
    response = "Electronics Engineering covers embedded systems, VLSI design, IoT, and signal processing. Students get hands-on IoT kits and access to our state-of-the-art electronics lab.";
  } else if (matches(q, ['campus', 'facilities', 'hostel', 'infrastructure', 'library', 'lab'])) {
    response = "Aurora has world-class facilities: AI Research Lab, Electronics Lab, a 24/7 library, high-speed Wi-Fi, on-campus hostel, sports complex, cafeteria, and an innovation hub.";
  } else if (matches(q, ['hello', 'hi', 'hey', 'greet', 'namaste', 'good morning', 'good afternoon'])) {
    response = "Hello! 👋 I'm EduNex, Aurora Institute's AI Voice Assistant. You can ask me about courses, fees, admissions, placements, or anything else about Aurora Institute of Technology!";
  } else if (matches(q, ['thank', 'thanks', 'okay', 'ok', 'great', 'awesome', 'nice'])) {
    response = "You're welcome! 😊 Feel free to ask me anything else about Aurora Institute. I'm here to help you make the best decision for your future!";
  } else {
    response = "I'm EduNex AI, Aurora's voice assistant. I can help with info about courses, fees, admissions, placements, and campus life. Could you rephrase your question? Or try one of the quick suggestions below!";
  }

  setTimeout(() => {
    aiText.textContent = response;
    assistantWave.classList.remove('active');
    speakResponse(response);
  }, 800);
}

function matches(query, keywords) {
  return keywords.some(kw => query.includes(kw));
}

/* --- Text-to-Speech Response --- */
function speakResponse(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang   = 'en-IN';
  utterance.rate   = 0.95;
  utterance.pitch  = 1.05;
  utterance.volume = 1;

  utterance.onstart = () => {
    assistantStatus.textContent = '🔊 Speaking...';
    assistantWave.classList.add('active');
  };
  utterance.onend = () => {
    assistantStatus.textContent = 'Ready to help';
    assistantWave.classList.remove('active');
  };

  // Try to use a natural voice
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Female'))
  );
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

// Pre-load voices
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

/* ---- INTERSECTION OBSERVER: Card Animations ---- */
const observerOptions = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 80);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply animation to cards
document.querySelectorAll('.course-card, .step-card, .fee-card, .contact-item, .gallery-item').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.05}s, transform 0.5s ease ${i * 0.05}s, box-shadow 0.3s ease, border-color 0.3s ease`;
  observer.observe(el);
});
