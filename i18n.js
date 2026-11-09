/**
 * NagarMitra Internationalization (i18n) Module
 * Seamless English <-> Hindi Bilingual Support
 */

const I18N_DICT = {
  en: {
    // Navigation
    navHome: "Home",
    navReport: "Report",
    navTrack: "Track",
    navMyReports: "My Reports",
    navAdmin: "Admin",
    navLogin: "Login",
    navRegister: "Register",
    navLogout: "Logout",
    navInstall: "Install App",
    langLabel: "हिन्दी",

    // Hero Section
    heroBadge: "City Complaint Portal v2.0",
    heroTitle1: "Report Problems.",
    heroTitle2: "Build Better Cities.",
    heroDesc: "NagarMitra helps citizens report city issues, track progress and send complaints to the right department — with real-time updates and public accountability.",
    btnReport: "Report a Problem",
    btnTrack: "Track Complaint",
    statTotal: "Total Filed",
    statResolved: "Resolved",
    statPending: "In Progress / Pending",

    // How It Works
    howTitle: "HOW IT WORKS",
    howHeading: "Easy. Clear. Reliable.",
    howSub: "Report public issues and follow their progress from start to finish.",
    step1Title: "Report",
    step1Desc: "Submit a public problem with description, photo and location.",
    step2Title: "Review",
    step2Desc: "We review details and suggest best category and priority.",
    step3Title: "Assignment",
    step3Desc: "The complaint is sent to the right department for action.",
    step4Title: "Resolution",
    step4Desc: "Citizens keep checking status until the issue is resolved.",

    // Problem Categories
    catRoad: "Road Damage",
    catRoadSub: "Potholes and broken roads",
    catGarbage: "Garbage & Waste",
    catGarbageSub: "Overflowing bins & littering",
    catLight: "Street Lighting",
    catLightSub: "Broken lights & open wiring",
    catWater: "Water Supply",
    catWaterSub: "Pipeline bursts & dirty water",
    catDrain: "Drainage & Sewage",
    catDrainSub: "Clogged sewers & foul smell",
    catTraffic: "Traffic & Signals",
    catTrafficSub: "Signal failure & congestion",
    catPed: "Pedestrian & Footpath",
    catPedSub: "Broken walkways & safety hazards",
    catAnimal: "Stray Animals",
    catAnimalSub: "Animal threats & road hazards",
    catOther: "Other Civic Issues",
    catOtherSub: "Report any other public problem",

    // Helplines
    hubTag: "DIRECT HELPLINE HUB",
    hubHeading: "Emergency & Civic Contacts",
    hubSub: "Direct click-to-call helpline numbers for immediate civic assistance, municipal complaints, and city emergencies.",
    callNow: "Call Now",
    tollFree: "Toll Free",
    chatNow: "Chat Now",

    // Map Section
    mapHeading: "Live City Grievance Map",
    mapSub: "View all reported municipal problems across the city in real-time.",
    mapFilterAll: "All Complaints",
    mapFilterPending: "Pending / Review",
    mapFilterInProgress: "In Progress",
    mapFilterResolved: "Resolved",

    // Report Form
    reportPageTitle: "Report a Public Problem",
    reportPageSub: "Provide accurate information so the problem can be routed to the right department.",
    formCatLabel: "Problem Category *",
    formCatPlaceholder: "Select category",
    formDescLabel: "Description *",
    formDescPlaceholder: "Describe the problem in detail...",
    formPhotoLabel: "Upload Photo",
    formPhotoClick: "Click to upload photo",
    formLocLabel: "Location / Address *",
    locStreetLabel: "Street / House No. *",
    locAreaLabel: "Area / Colony *",
    locCityLabel: "City *",
    locPincodeLabel: "PIN Code *",
    locStateLabel: "State *",
    locCountryLabel: "Country",
    btnCurrentLoc: "Auto-Fill My Current Location",
    btnPickOnMap: "Pick Location on Map",
    btnSubmitComplaint: "Submit Complaint",

    // Track Form
    trackPageTitle: "Track Your Complaint",
    trackPageSub: "Enter your Complaint ID to see live resolution progress.",
    trackInputPlaceholder: "Example: PRB-001",
    btnTrackNow: "Track Complaint",
    btnDownloadPdf: "Download Official Receipt (PDF)",

    // Statuses
    statusSubmitted: "Submitted",
    statusReview: "Under Review",
    statusAssigned: "Assigned",
    statusProgress: "In Progress",
    statusResolved: "Resolved",

    // Contact Us
    contactTitle: "CONTACT US",
    contactHeading: "We're here to help.",
    contactName: "Your Name",
    contactEmail: "Email ID",
    contactPhone: "Mobile Number",
    contactMessage: "Description / Message",
    btnSendMessage: "Send Message"
  },

  hi: {
    // Navigation
    navHome: "मुख्य पृष्ठ",
    navReport: "शिकायत दर्ज करें",
    navTrack: "स्थिति देखें",
    navMyReports: "मेरी शिकायतें",
    navAdmin: "प्रशासन",
    navLogin: "लॉग इन",
    navRegister: "पंजीकरण करें",
    navLogout: "लॉग आउट",
    navInstall: "ऐप इंस्टॉल करें",
    langLabel: "English",

    // Hero Section
    heroBadge: "स्मार्ट सिटी शिकायत पोर्टल v2.0",
    heroTitle1: "समस्याएं दर्ज करें।",
    heroTitle2: "बेहतर शहर बनाएं।",
    heroDesc: "नगरमित्र नागरिकों को शहर की समस्याओं की रिपोर्ट करने, वास्तविक समय में प्रगति ट्रैक करने और संबंधित विभागों तक शिकायतें पहुंचाने में मदद करता है।",
    btnReport: "समस्या दर्ज करें",
    btnTrack: "शिकायत ट्रैक करें",
    statTotal: "कुल शिकायतें",
    statResolved: "निस्तारित (हल)",
    statPending: "प्रगति पर / लंबित",

    // How It Works
    howTitle: "यह कैसे काम करता है",
    howHeading: "सरल। पारदर्शी। विश्वसनीय।",
    howSub: "सार्वजनिक समस्याओं की रिपोर्ट करें और समाधान तक उनकी प्रगति का पालन करें।",
    step1Title: "दर्ज करें",
    step1Desc: "विवरण, फोटो और स्थान के साथ सार्वजनिक समस्या सबमिट करें।",
    step2Title: "समीक्षा",
    step2Desc: "हम विवरण की समीक्षा कर उपयुक्त श्रेणी और प्राथमिकता तय करते हैं।",
    step3Title: "विभाग आवंटन",
    step3Desc: "शिकायत तुरंत संबंधित नगर निगम या बोर्ड को भेजी जाती है।",
    step4Title: "समाधान",
    step4Desc: "समस्या का समाधान होने तक नागरिक लाइव स्थिति देख सकते हैं।",

    // Problem Categories
    catRoad: "सड़क व गड्ढे",
    catRoadSub: "टूटी सड़कें और खतरनाक गड्ढे",
    catGarbage: "कचरा व सफाई",
    catGarbageSub: "कचरे के ढेर व ओवरफ्लो डिब्बे",
    catLight: "स्ट्रीट लाइट व खंभे",
    catLightSub: "बंद लाइटें और खुले बिजली के तार",
    catWater: "पेयजल व पाइपलाइन",
    catWaterSub: "पाइपलाइन लीकेज व गंदा पानी",
    catDrain: "सीवर व जलभराव",
    catDrainSub: "बंद गटर, सीवर और बदबू",
    catTraffic: "यातायात व सिग्नल",
    catTrafficSub: "खराब ट्रैफिक लाइट व जाम",
    catPed: "फुटपाथ व पैदल सुरक्षा",
    catPedSub: "टूटे फुटपाथ व पैदल बाधाएं",
    catAnimal: "आवारा पशु समस्या",
    catAnimalSub: "जानवरों का आतंक व सड़क खतरा",
    catOther: "अन्य नागरिक समस्याएं",
    catOtherSub: "कोई अन्य सार्वजनिक समस्या दर्ज करें",

    // Helplines
    hubTag: "सीधी हेल्पलाइन सेवा",
    hubHeading: "आपातकालीन व नागरिक संपर्क",
    hubSub: "नगर निगम, पुलिस, एम्बुलेंस और बिजली आपातकाल के लिए 24/7 सीधा कॉल संपर्क।",
    callNow: "कॉल करें",
    tollFree: "टोल फ्री",
    chatNow: "चैट करें",

    // Map Section
    mapHeading: "लाइव नगर शिकायत मानचित्र",
    mapSub: "शहर भर में दर्ज की गई नागरिक समस्याओं को वास्तविक समय में नक्शे पर देखें।",
    mapFilterAll: "सभी शिकायतें",
    mapFilterPending: "समीक्षाधीन / नई",
    mapFilterInProgress: "कार्य प्रगति पर",
    mapFilterResolved: "हल की गई",

    // Report Form
    reportPageTitle: "सार्वजनिक समस्या दर्ज करें",
    reportPageSub: "सही जानकारी दें ताकि शिकायत को संबंधित विभाग तक तेजी से पहुंचाया जा सके।",
    formCatLabel: "समस्या की श्रेणी *",
    formCatPlaceholder: "श्रेणी चुनें",
    formDescLabel: "समस्या का विवरण *",
    formDescPlaceholder: "समस्या का विस्तार से विवरण लिखें...",
    formPhotoLabel: "फोटो अपलोड करें",
    formPhotoClick: "फोटो अपलोड करने के लिए क्लिक करें",
    formLocLabel: "स्थान / पता *",
    locStreetLabel: "सड़क / मकान संख्या *",
    locAreaLabel: "इलाका / कॉलोनी *",
    locCityLabel: "शहर *",
    locPincodeLabel: "पिन कोड *",
    locStateLabel: "राज्य *",
    locCountryLabel: "देश",
    btnCurrentLoc: "मेरा वर्तमान स्थान स्वतः भरें",
    btnPickOnMap: "नक्शे पर स्थान चुनें",
    btnSubmitComplaint: "शिकायत सबमिट करें",

    // Track Form
    trackPageTitle: "अपनी शिकायत ट्रैक करें",
    trackPageSub: "लाइव स्थिति देखने के लिए अपनी शिकायत आईडी दर्ज करें।",
    trackInputPlaceholder: "उदा: PRB-001",
    btnTrackNow: "स्थिति देखें",
    btnDownloadPdf: "आधिकारिक पावती (PDF) डाउनलोड करें",

    // Statuses
    statusSubmitted: "दर्ज की गई",
    statusReview: "समीक्षाधीन",
    statusAssigned: "विभाग आवंटित",
    statusProgress: "प्रगति पर",
    statusResolved: "निस्तारित (समाधान पूर्ण)",

    // Contact Us
    contactTitle: "संपर्क करें",
    contactHeading: "हम आपकी सहायता के लिए तत्पर हैं।",
    contactName: "आपका नाम",
    contactEmail: "ईमेल आईडी",
    contactPhone: "मोबाइल नंबर",
    contactMessage: "विवरण / संदेश",
    btnSendMessage: "संदेश भेजें"
  }
};

let currentLang = localStorage.getItem('nagarmitra_lang') || 'en';

function getTranslation(key) {
  const dict = I18N_DICT[currentLang] || I18N_DICT.en;
  return dict[key] || I18N_DICT.en[key] || key;
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'hi') lang = 'en';
  currentLang = lang;
  localStorage.setItem('nagarmitra_lang', currentLang);
  applyTranslations();
  
  // Dispatch custom event for features like Map and PDF
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

function toggleLanguage() {
  const next = currentLang === 'en' ? 'hi' : 'en';
  setLanguage(next);
  if (typeof showToast === 'function') {
    showToast(next === 'hi' ? 'भाषा बदलकर हिन्दी कर दी गई है 🇮🇳' : 'Language switched to English 🌐', 'info');
  }
}

function applyTranslations() {
  const t = I18N_DICT[currentLang];
  if (!t) return;

  // Update button labels
  const langLabel = document.getElementById('currentLangLabel');
  if (langLabel) langLabel.textContent = t.langLabel;
  const mobLangLabel = document.getElementById('mobileLangLabel');
  if (mobLangLabel) mobLangLabel.textContent = t.langLabel;

  // Nav Links
  const navMap = {
    'home': t.navHome,
    'report': t.navReport,
    'track': t.navTrack,
    'myComplaints': t.navMyReports,
    'admin': t.navAdmin
  };
  document.querySelectorAll('#mainNavLinks a').forEach(a => {
    const page = a.getAttribute('data-page');
    if (page && navMap[page]) a.textContent = navMap[page];
  });
  document.querySelectorAll('.mobile-menu-links a').forEach(a => {
    const page = a.getAttribute('data-page');
    const span = a.querySelector('.mobile-link-text');
    if (page && navMap[page] && span) span.textContent = navMap[page];
  });

  // Hero Section
  const heroBadge = document.querySelector('.hero .badge');
  if (heroBadge) heroBadge.innerHTML = `<i class="fas fa-rocket"></i> ${t.heroBadge}`;
  const heroH1 = document.querySelector('.hero h1');
  if (heroH1) heroH1.innerHTML = `${t.heroTitle1}<br><span>${t.heroTitle2}</span>`;
  const heroP = document.querySelector('.hero p');
  if (heroP) heroP.textContent = t.heroDesc;
  const btnReportHero = document.querySelector('.hero-buttons button.primary');
  if (btnReportHero) btnReportHero.innerHTML = `<i class="fas fa-plus-circle"></i> ${t.btnReport}`;
  const btnTrackHero = document.querySelector('.hero-buttons button.secondary');
  if (btnTrackHero) btnTrackHero.innerHTML = `<i class="fas fa-search-location"></i> ${t.btnTrack}`;

  // Hero Stats Labels
  const statLabels = document.querySelectorAll('.hero-stat p');
  if (statLabels.length >= 3) {
    statLabels[0].textContent = t.statTotal;
    statLabels[1].textContent = t.statResolved;
    statLabels[2].textContent = t.statPending;
  }

  // How It Works
  const howSectionTitle = document.querySelector('.section-title span');
  if (howSectionTitle) howSectionTitle.textContent = t.howTitle;
  const howHeading = document.querySelector('.section-title h2');
  if (howHeading) howHeading.textContent = t.howHeading;
  const howP = document.querySelector('.section-title p');
  if (howP) howP.textContent = t.howSub;

  const stepCards = document.querySelectorAll('.step-card');
  if (stepCards.length >= 4) {
    stepCards[0].querySelector('h3').textContent = t.step1Title;
    stepCards[0].querySelector('p').textContent = t.step1Desc;
    stepCards[1].querySelector('h3').textContent = t.step2Title;
    stepCards[1].querySelector('p').textContent = t.step2Desc;
    stepCards[2].querySelector('h3').textContent = t.step3Title;
    stepCards[2].querySelector('p').textContent = t.step3Desc;
    stepCards[3].querySelector('h3').textContent = t.step4Title;
    stepCards[3].querySelector('p').textContent = t.step4Desc;
  }

  // Map Header
  const mapTitle = document.getElementById('cityMapTitle');
  if (mapTitle) mapTitle.textContent = t.mapHeading;
  const mapSub = document.getElementById('cityMapSub');
  if (mapSub) mapSub.textContent = t.mapSub;

  // Helplines Header
  const hubHeader = document.querySelector('.emergency-hub-header');
  if (hubHeader) {
    const span = hubHeader.querySelector('span');
    if (span) span.innerHTML = `<i class="fas fa-phone-volume"></i> ${t.hubTag}`;
    const h2 = hubHeader.querySelector('h2');
    if (h2) h2.textContent = t.hubHeading;
    const p = hubHeader.querySelector('p');
    if (p) p.textContent = t.hubSub;
  }

  // Report Form Labels
  const formLabels = {
    'locStreet': t.locStreetLabel,
    'locArea': t.locAreaLabel,
    'locCity': t.locCityLabel,
    'locPincode': t.locPincodeLabel,
    'locState': t.locStateLabel,
    'locCountry': t.locCountryLabel
  };
  Object.keys(formLabels).forEach(id => {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) {
      const icon = label.querySelector('i');
      const iconHTML = icon ? icon.outerHTML + ' ' : '';
      label.innerHTML = iconHTML + formLabels[id];
    }
  });

  const btnLoc = document.querySelector('.location-btn');
  if (btnLoc && !btnLoc.disabled) {
    btnLoc.innerHTML = `<i class="fas fa-crosshairs"></i> ${t.btnCurrentLoc}`;
  }
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn && !submitBtn.disabled) {
    submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t.btnSubmitComplaint}`;
  }

  // Track Form
  const trackIdInput = document.getElementById('trackId');
  if (trackIdInput) trackIdInput.placeholder = t.trackInputPlaceholder;
  const trackBtn = document.querySelector('.track-box button');
  if (trackBtn) trackBtn.innerHTML = `<i class="fas fa-search"></i> ${t.btnTrackNow}`;

  // Contact Form
  const contactHeader = document.querySelector('#contactSection span');
  if (contactHeader) contactHeader.textContent = t.contactTitle;
  const contactH2 = document.querySelector('#contactSection h2');
  if (contactH2) contactH2.textContent = t.contactHeading;
  const contactSubmitBtn = document.getElementById('contactSubmitBtn');
  if (contactSubmitBtn && !contactSubmitBtn.disabled) {
    contactSubmitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> ${t.btnSendMessage}`;
  }
}

// Auto-run on load
window.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
});
