/**
 * E-ink Wallpaper Maker — Main Application Logic
 * Pure vanilla JS, no framework dependencies
 */

'use strict';

/* ============================================================
   CONSTANTS & DEVICE PROFILES
   ============================================================ */
const DEVICE_PROFILES = {
  // ── Kindle ──────────────────────────────────────────────────────────────
  K45T:  { brand:'Kindle',      name:'Kindle 4/5/Touch (2011–12)',  width: 600,  height: 800,  ppi:167, grayLevels:16, tech:'E Ink Pearl'       },
  KPW1:  { brand:'Kindle',      name:'Kindle PW1 (2012)',          width: 758,  height:1024,  ppi:212, grayLevels:16, tech:'E Ink Pearl'       },
  KPW2:  { brand:'Kindle',      name:'Kindle PW2 (2013)',          width: 758,  height:1024,  ppi:212, grayLevels:16, tech:'E Ink Pearl'       },
  KPW34: { brand:'Kindle',      name:'Kindle PW3/4 (2015–18)',     width:1072,  height:1448,  ppi:300, grayLevels:16, tech:'E Ink Carta HD'     },
  KPW5:  { brand:'Kindle',      name:'Kindle PW5 11G (2021)',      width:1236,  height:1648,  ppi:300, grayLevels:16, tech:'E Ink Carta 1200'   },
  KPW6:  { brand:'Kindle',      name:'Kindle PW6 12G (2024)',      width:1264,  height:1680,  ppi:300, grayLevels:16, tech:'E Ink Carta 1200'   },
  KO3:   { brand:'Kindle',      name:'Kindle Oasis 3 (2019)',      width:1264,  height:1680,  ppi:300, grayLevels:16, tech:'E Ink Carta'         },
  KS:    { brand:'Kindle',      name:'Kindle Scribe (2022)',        width:1860,  height:2480,  ppi:300, grayLevels:16, tech:'E Ink Carta 1200'   },
  KC:    { brand:'Kindle',      name:'Kindle Colorsoft (2024)',     width:1264,  height:1680,  ppi:300, grayLevels:16, tech:'E Ink Colorsoft',   color:true, colorLevels:4096 },
  KSC:   { brand:'Kindle',      name:'Kindle Scribe Colorsoft (2025)', width:1980, height:2640, ppi:300, grayLevels:16, tech:'E Ink Colorsoft',   color:true, colorLevels:4096 },
  // ── Kobo ────────────────────────────────────────────────────────────────
  KoboLibra2:   { brand:'Kobo', name:'Kobo Libra 2 (2021)',        width:1264,  height:1680,  ppi:300, grayLevels:16, tech:'E Ink Carta 1200'   },
  KoboElipsa2E: { brand:'Kobo', name:'Kobo Elipsa 2E (2023)',      width:1404,  height:1872,  ppi:227, grayLevels:16, tech:'E Ink Carta 1200'   },
  KoboLibraC:   { brand:'Kobo', name:'Kobo Libra Colour (2024)',   width:1264,  height:1680,  ppi:300, grayLevels:16, tech:'E Ink Kaleido 3', color:true, colorLevels:4096 },
  KoboClaraC:   { brand:'Kobo', name:'Kobo Clara Colour (2024)',   width:1072,  height:1448,  ppi:300, grayLevels:16, tech:'E Ink Kaleido 3', color:true, colorLevels:4096 },
  // ── Other brands ────────────────────────────────────────────────────────
  RM2:       { brand:'reMarkable',  name:'reMarkable 2 (2020)',         width:1872, height:2404, ppi:226, grayLevels:16, tech:'E Ink Carta'         },
  SNA5X:     { brand:'Supernote',   name:'Supernote A5X (2021)',        width:1404, height:1872, ppi:226, grayLevels:16, tech:'E Ink Carta'         },
  BooxNA3:   { brand:'Boox',        name:'Boox Note Air3 (2023)',       width:1404, height:1872, ppi:227, grayLevels:32, tech:'E Ink Carta 1200'   },
  BooxNA3C:  { brand:'Boox',        name:'Boox Note Air3 C (2023)',     width:1404, height:1872, ppi:227, grayLevels:16, tech:'E Ink Kaleido 3', color:true, colorLevels:4096 },
  BooxTabX:  { brand:'Boox',        name:'Boox Tab X (2023)',           width:2480, height:3248, ppi:227, grayLevels:32, tech:'E Ink Carta 1200'   },
  BooxPalma: { brand:'Boox',        name:'Boox Palma (2023)',           width: 824, height:1648, ppi:300, grayLevels:16, tech:'E Ink Carta 1200'   },
  PBIPColor3:{ brand:'PocketBook',  name:'PocketBook InkPad Color 3',  width:1404, height:1872, ppi:150, grayLevels:16, tech:'E Ink Kaleido 3', color:true, colorLevels:4096 },
};

const STORAGE_KEY = 'eink_maker_settings';
const THEME_KEY   = 'eink_maker_theme';

/** Bayer 8×8 ordered dithering threshold matrix (values 0–63, MSB-first scan order). */
const BAYER_8X8 = [
  [ 0,32, 8,40, 2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],
  [60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],
  [51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],
  [63,31,55,23,61,29,53,21],
];

/** Bayer 4×4 ordered dithering threshold matrix. */
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5],
];

/** Bayer 2x2 ordered dithering threshold matrix. */
const BAYER_2X2 = [
  [0, 2],
  [3, 1],
];

/**
 * Build a uniform grayscale palette with `levels` entries spanning 0-255.
 * E.g. buildPalette(16) → [0,17,34,...,255]; buildPalette(256) → [0,1,2,...,255]
 */
function buildPalette(levels) {
  return Array.from({ length: levels }, (_, i) => Math.round(i * 255 / (levels - 1)));
}

/**
 * Return the smallest valid PNG bit depth that can represent `levels` gray tones.
 * PNG grayscale supports: 1 | 2 | 4 | 8 bits.
 */
function getBitDepth(levels) {
  if (levels <=  2) return 1;
  if (levels <=  4) return 2;
  if (levels <= 16) return 4;
  return 8;
}

/* ============================================================
   STATE
   ============================================================ */
let state = {
  cropper: null,
  processedCanvas: null,
  fitZoomRatio: null,   // the zoom ratio that shows the full image in the container
  originalFileSize: null,
  settings: {
    device: 'KPW2',
    customWidth: 758,
    customHeight: 1024,
    customGrayLevels: 16,
    customColor: false,
    brightness: 0,
    contrast: 0,
    gamma: 1.0,
    sharpness: 0,
    saturation: 0,
    invert: false,
    autoLevel: false,
    ditherAlgorithm: 'floyd-steinberg',
    dithering: true,
    downloadFormat: 'png',
    jpgQuality: 85,
    bayerSize: 8,
  },
};

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const $ = id => document.getElementById(id);

const dom = {
  leftPane:          $('left-pane'),
  dropzone:          $('dropzone'),
  fileInput:         $('file-input'),
  cropperWrapper:    $('cropper-wrapper'),
  cropperImage:      $('cropper-image'),
  statusBadge:       $('status-badge'),
  deviceSelect:      $('device-select'),
  customDims:        $('custom-dims'),
  customWidth:       $('custom-width'),
  customHeight:      $('custom-height'),
  customGrayLevels:  $('custom-gray-levels'),
  customColorToggle: $('custom-color-toggle'),
  ditherSelect:      $('dither-select'),
  bayerSizeContainer:$('bayer-size-container'),
  bayerSizeSelect:   $('bayer-size-select'),
  toggleInvert:      $('toggle-invert'),
  toggleAutoLevel:   $('toggle-auto-level'),
  sliderSaturation:  $('slider-saturation'),
  valSaturation:     $('val-saturation'),
  colorControls:     $('color-controls'),
  downloadFormat:      $('download-format'),
  jpgQualityContainer: $('jpg-quality-container'),
  sliderJpgQuality:    $('slider-jpg-quality'),
  valJpgQuality:       $('val-jpg-quality'),
  loupeCanvas:       $('loupe-canvas'),
  deviceInfo:        $('device-info'),
  dimsLabel:         $('dims-label'),
  ratioLabel:        $('ratio-label'),
  sliderBrightness:  $('slider-brightness'),
  sliderContrast:    $('slider-contrast'),
  sliderGamma:       $('slider-gamma'),
  sliderSharpness:   $('slider-sharpness'),
  valBrightness:     $('val-brightness'),
  valContrast:       $('val-contrast'),
  valGamma:          $('val-gamma'),
  valSharpness:      $('val-sharpness'),
  toggleDithering:   $('toggle-dithering'),
  btnPreview:        $('btn-preview'),
  btnDownload:       $('btn-download'),
  btnExport:         $('btn-export-profile'),
  btnImport:         $('btn-import-profile'),
  profileImportInput:$('profile-import-input'),
  btnReset:          $('btn-reset-adjustments'),
  btnRotateL:        $('btn-rotate-left'),
  btnRotateR:        $('btn-rotate-right'),
  btnFlipH:          $('btn-flip-h'),
  btnFit:            $('btn-fit'),
  btnClear:          $('btn-clear'),
  btnInstall:        $('btn-install'),
  btnThemeToggle:    $('btn-theme-toggle'),
  previewCanvas:     $('preview-canvas'),
  previewPlaceholder:$('preview-placeholder'),
  processingOverlay: $('processing-overlay'),
  histogramCanvas:   $('histogram-canvas'),
  statsCard:         $('stats-card'),
  statResolution:    $('stat-resolution'),
  statLevels:        $('stat-levels'),
  statTime:          $('stat-time'),
  statTones:         $('stat-tones'),
  statSize:          $('stat-size'),
  statRatio:         $('stat-ratio'),
  toast:             $('toast'),
  toastMsg:          $('toast-msg'),
  toastIcon:         $('toast-icon'),
  resizeHandle:      $('resize-handle'),
  rightPane:         $('right-pane'),
  zoomBadge:         $('zoom-badge'),
};

function loadTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) { /* ignore */ }
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  loadTheme();
  loadSettings();
  bindEvents();
  updateDimsDisplay();
  updateSliderTrack(dom.sliderBrightness);
  updateSliderTrack(dom.sliderContrast);
  updateSliderTrack(dom.sliderGamma);
  updateSliderTrack(dom.sliderSharpness);
  if (dom.sliderSaturation) updateSliderTrack(dom.sliderSaturation);
  if (dom.sliderJpgQuality) updateSliderTrack(dom.sliderJpgQuality);
  setupLoupe();
}

/* ============================================================
   SETTINGS PERSISTENCE
   ============================================================ */
function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.settings = { ...state.settings, ...parsed };
    }
  } catch (e) { /* ignore */ }

  applySettingsToUI();
}

function saveSettings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.settings));
  } catch (e) { /* ignore */ }
}

function applySettingsToUI() {
  const s = state.settings;
  dom.deviceSelect.value = s.device;
  dom.customWidth.value  = s.customWidth;
  dom.customHeight.value = s.customHeight;
  if (dom.customGrayLevels) {
    dom.customGrayLevels.value = String(s.customGrayLevels);
    dom.customGrayLevels.disabled = !!s.customColor;
  }
  if (dom.customColorToggle) {
    dom.customColorToggle.checked = !!s.customColor;
  }
  if (dom.ditherSelect)      dom.ditherSelect.value      = s.ditherAlgorithm;
  if (dom.bayerSizeSelect) {
    dom.bayerSizeSelect.value = String(s.bayerSize || 8);
  }
  if (dom.bayerSizeContainer) {
    if (s.ditherAlgorithm === 'ordered') {
      dom.bayerSizeContainer.classList.remove('hidden');
    } else {
      dom.bayerSizeContainer.classList.add('hidden');
    }
  }
  if (dom.toggleInvert)      dom.toggleInvert.checked    = s.invert;
  if (dom.toggleAutoLevel)   dom.toggleAutoLevel.checked = s.autoLevel;
  if (dom.sliderSaturation)  dom.sliderSaturation.value  = s.saturation;
  if (dom.valSaturation)     dom.valSaturation.textContent = s.saturation;

  dom.sliderBrightness.value = s.brightness;
  dom.sliderContrast.value   = s.contrast;
  dom.sliderGamma.value      = Math.round(s.gamma * 100);
  dom.sliderSharpness.value  = s.sharpness;
  dom.toggleDithering.checked = s.dithering;

  dom.valBrightness.textContent = s.brightness;
  dom.valContrast.textContent   = s.contrast;
  dom.valGamma.textContent      = s.gamma.toFixed(2);
  dom.valSharpness.textContent  = s.sharpness;

  if (s.device === 'custom') dom.customDims.classList.remove('hidden');
  else dom.customDims.classList.add('hidden');

  if (dom.downloadFormat) {
    dom.downloadFormat.value = s.downloadFormat || 'png';
  }
  if (dom.sliderJpgQuality) {
    dom.sliderJpgQuality.value = s.jpgQuality || 85;
  }
  if (dom.valJpgQuality) {
    dom.valJpgQuality.textContent = (s.jpgQuality || 85) + '%';
  }
  if (dom.jpgQualityContainer) {
    if ((s.downloadFormat || 'png') === 'jpg') {
      dom.jpgQualityContainer.classList.remove('hidden');
    } else {
      dom.jpgQualityContainer.classList.add('hidden');
    }
  }

  updateDimsDisplay();
}

/* ============================================================
   DEVICE PROFILE HELPERS
   ============================================================ */
function getCurrentProfile() {
  const d = state.settings.device;
  if (d === 'custom') {
    return {
      name:       'Custom',
      brand:      'Custom',
      width:      parseInt(dom.customWidth.value,       10) || 758,
      height:     parseInt(dom.customHeight.value,      10) || 1024,
      grayLevels: parseInt(dom.customGrayLevels?.value, 10) || state.settings.customGrayLevels || 16,
      ppi:        0,
      tech:       'Custom',
      color:      !!state.settings.customColor,
    };
  }
  return DEVICE_PROFILES[d] || DEVICE_PROFILES.KPW2;
}

/** Return the gray-level count for the currently selected device profile. */
function getCurrentGrayLevels() {
  return getCurrentProfile().grayLevels || 16;
}

function updateDimsDisplay() {
  const p = getCurrentProfile();
  dom.dimsLabel.textContent  = `${p.width} × ${p.height} px`;
  dom.ratioLabel.textContent = `Ratio ${(p.width / p.height).toFixed(2)}:1`;

  if (dom.deviceInfo) {
    const parts = [];
    if (p.ppi)  parts.push(`${p.ppi} PPI`);
    if (p.tech) parts.push(p.tech);
    if (p.color) parts.push('🎨 Color');
    dom.deviceInfo.textContent = parts.join(' · ');
  }

  // Show/hide color-only controls
  if (dom.colorControls) {
    if (p.color) dom.colorControls.classList.remove('hidden');
    else         dom.colorControls.classList.add('hidden');
  }

  if (state.cropper) {
    state.cropper.setAspectRatio(p.width / p.height);
    requestAnimationFrame(fitCropBox);
  }
}

/* ============================================================
   SLIDER HELPERS
   ============================================================ */
function updateSliderTrack(input) {
  const min = parseFloat(input.min);
  const max = parseFloat(input.max);
  const val = parseFloat(input.value);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--pct', `${pct}%`);
}

/* ============================================================
   EVENT BINDING
   ============================================================ */
function bindEvents() {

  /* ── Drag & Drop ── */
  dom.dropzone.addEventListener('dragover', e => {
    e.preventDefault();
    dom.dropzone.classList.add('dropzone-active');
  });
  dom.dropzone.addEventListener('dragleave', () => {
    dom.dropzone.classList.remove('dropzone-active');
  });
  dom.dropzone.addEventListener('drop', e => {
    e.preventDefault();
    dom.dropzone.classList.remove('dropzone-active');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) loadImage(file);
    else showToast('⚠️ Please drop an image file.', 'warn');
  });

  /* ── File Input (click-to-browse) ── */
  dom.fileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) loadImage(file);
  });

  /* ── Paste from Clipboard ── */
  document.addEventListener('paste', e => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        loadImage(item.getAsFile());
        break;
      }
    }
  });

  /* ── Device Select ── */
  dom.deviceSelect.addEventListener('change', () => {
    state.settings.device = dom.deviceSelect.value;
    if (state.settings.device === 'custom') {
      dom.customDims.classList.remove('hidden');
    } else {
      dom.customDims.classList.add('hidden');
    }
    updateDimsDisplay();
    saveSettings();
  });

  dom.customWidth.addEventListener('input', () => {
    state.settings.customWidth = parseInt(dom.customWidth.value, 10);
    updateDimsDisplay();
    saveSettings();
  });
  dom.customHeight.addEventListener('input', () => {
    state.settings.customHeight = parseInt(dom.customHeight.value, 10);
    updateDimsDisplay();
    saveSettings();
  });
  dom.customGrayLevels?.addEventListener('change', () => {
    state.settings.customGrayLevels = parseInt(dom.customGrayLevels.value, 10);
    saveSettings();
  });
  dom.customColorToggle?.addEventListener('change', () => {
    state.settings.customColor = dom.customColorToggle.checked;
    if (dom.customGrayLevels) {
      dom.customGrayLevels.disabled = state.settings.customColor;
    }
    updateDimsDisplay();
    saveSettings();
    if (state.cropper) {
      runPipeline();
    }
  });

  /* ── Dither algorithm ── */
  dom.ditherSelect?.addEventListener('change', () => {
    state.settings.ditherAlgorithm = dom.ditherSelect.value;
    if (dom.bayerSizeContainer) {
      if (state.settings.ditherAlgorithm === 'ordered') {
        dom.bayerSizeContainer.classList.remove('hidden');
      } else {
        dom.bayerSizeContainer.classList.add('hidden');
      }
    }
    saveSettings();
    if (state.cropper) {
      runPipeline();
    }
  });

  /* ── Bayer Array Size ── */
  dom.bayerSizeSelect?.addEventListener('change', () => {
    state.settings.bayerSize = parseInt(dom.bayerSizeSelect.value, 10);
    saveSettings();
    if (state.cropper) {
      runPipeline();
    }
  });

  /* ── Invert toggle ── */
  dom.toggleInvert?.addEventListener('change', () => {
    state.settings.invert = dom.toggleInvert.checked;
    saveSettings();
  });

  /* ── Auto-level toggle ── */
  dom.toggleAutoLevel?.addEventListener('change', () => {
    state.settings.autoLevel = dom.toggleAutoLevel.checked;
    saveSettings();
  });

  /* ── Saturation (color devices) ── */
  dom.sliderSaturation?.addEventListener('input', () => {
    const v = parseInt(dom.sliderSaturation.value, 10);
    state.settings.saturation = v;
    if (dom.valSaturation) dom.valSaturation.textContent = v;
    updateSliderTrack(dom.sliderSaturation);
    saveSettings();
  });

  /* ── Download Format & JPG Quality ── */
  dom.downloadFormat?.addEventListener('change', () => {
    state.settings.downloadFormat = dom.downloadFormat.value;
    if (dom.jpgQualityContainer) {
      if (state.settings.downloadFormat === 'jpg') {
        dom.jpgQualityContainer.classList.remove('hidden');
      } else {
        dom.jpgQualityContainer.classList.add('hidden');
      }
    }
    saveSettings();
    updateOutputSizeStat();
  });

  dom.sliderJpgQuality?.addEventListener('input', () => {
    const v = parseInt(dom.sliderJpgQuality.value, 10);
    state.settings.jpgQuality = v;
    if (dom.valJpgQuality) {
      dom.valJpgQuality.textContent = v + '%';
    }
    updateSliderTrack(dom.sliderJpgQuality);
    saveSettings();
    updateOutputSizeStat();
  });

  /* ── Sliders ── */
  dom.sliderBrightness.addEventListener('input', () => {
    const v = parseInt(dom.sliderBrightness.value, 10);
    state.settings.brightness = v;
    dom.valBrightness.textContent = v;
    updateSliderTrack(dom.sliderBrightness);
    saveSettings();
  });
  dom.sliderContrast.addEventListener('input', () => {
    const v = parseInt(dom.sliderContrast.value, 10);
    state.settings.contrast = v;
    dom.valContrast.textContent = v;
    updateSliderTrack(dom.sliderContrast);
    saveSettings();
  });
  dom.sliderGamma.addEventListener('input', () => {
    const v = parseInt(dom.sliderGamma.value, 10);
    state.settings.gamma = v / 100;
    dom.valGamma.textContent = (v / 100).toFixed(2);
    updateSliderTrack(dom.sliderGamma);
    saveSettings();
  });
  dom.sliderSharpness.addEventListener('input', () => {
    const v = parseInt(dom.sliderSharpness.value, 10);
    state.settings.sharpness = v;
    dom.valSharpness.textContent = v;
    updateSliderTrack(dom.sliderSharpness);
    saveSettings();
  });
  dom.toggleDithering.addEventListener('change', () => {
    state.settings.dithering = dom.toggleDithering.checked;
    saveSettings();
  });

  /* ── Reset Adjustments ── */
  dom.btnReset.addEventListener('click', () => {
    state.settings.brightness = 0;
    state.settings.contrast   = 0;
    state.settings.gamma      = 1.0;
    state.settings.sharpness  = 0;
    state.settings.dithering  = true;
    applySettingsToUI();
    updateSliderTrack(dom.sliderBrightness);
    updateSliderTrack(dom.sliderContrast);
    updateSliderTrack(dom.sliderGamma);
    updateSliderTrack(dom.sliderSharpness);
    saveSettings();
    showToast('✓ Adjustments reset', 'ok');
  });

  /* ── Cropper Controls ── */
  dom.btnRotateL.addEventListener('click', () => state.cropper?.rotate(-90));
  dom.btnRotateR.addEventListener('click', () => state.cropper?.rotate(90));
  dom.btnFlipH.addEventListener('click',   () => {
    const d = state.cropper?.getData() || {};
    state.cropper?.scaleX(d.scaleX === -1 ? 1 : -1);
  });
  dom.btnFit.addEventListener('click', fitCropBox);
  dom.btnClear.addEventListener('click', clearImage);

  /* ── Mouse-wheel zoom on the cropper area ── */
  setupWheelZoom();

  /* ── Preview & Download ── */
  dom.btnPreview.addEventListener('click', runPipeline);
  dom.btnDownload.addEventListener('click', downloadOutput);

  /* ── Export / Import Profile ── */
  dom.btnExport.addEventListener('click', exportProfile);
  dom.btnImport.addEventListener('click', () => dom.profileImportInput.click());
  dom.profileImportInput.addEventListener('change', importProfile);

  /* ── Resize Handle ── */
  setupResizeHandle();

  /* ── Mobile Auto-Collapse Header ── */
  dom.rightPane.addEventListener('scroll', () => {
    if (window.innerWidth <= 768) {
      const header = document.querySelector('header');
      if (dom.rightPane.scrollTop > 20) {
        header.classList.add('header-collapsed');
      } else {
        header.classList.remove('header-collapsed');
      }
    }
  });

  dom.leftPane?.addEventListener('touchstart', () => {
    if (window.innerWidth <= 768) {
      document.querySelector('header').classList.add('header-collapsed');
    }
  }, { passive: true });

  /* ── Theme Toggle ── */
  dom.btnThemeToggle?.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
      showToast('✓ Light theme enabled', 'ok');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
      showToast('✓ Dark theme enabled', 'ok');
    }
    if (state.lastHistogram) {
      renderHistogram(state.lastHistogram);
    }
  });

  /* ── PWA Install Prompt ── */
  setupInstallPrompt();
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  loadSettings();
  bindEvents();
  updateDimsDisplay();
  updateSliderTrack(dom.sliderBrightness);
  updateSliderTrack(dom.sliderContrast);
  updateSliderTrack(dom.sliderGamma);
  updateSliderTrack(dom.sliderSharpness);
  if (dom.sliderSaturation) updateSliderTrack(dom.sliderSaturation);
  setupLoupe();
}

/* ============================================================
   IMAGE LOADING & CROPPER
   ============================================================ */
function loadImage(file) {
  state.originalFileSize = file.size;
  const reader = new FileReader();
  reader.onload = e => {
    const dataURL = e.target.result;

    dom.cropperImage.src = dataURL;
    dom.dropzone.classList.add('hidden');
    dom.cropperWrapper.classList.remove('hidden');
    dom.cropperWrapper.classList.add('animate-fade-in-up');
    dom.statusBadge.classList.remove('hidden');
    dom.statusBadge.classList.add('flex');

    // Destroy existing cropper
    if (state.cropper) {
      state.cropper.destroy();
      state.cropper = null;
    }

    const profile = getCurrentProfile();

    state.cropper = new Cropper(dom.cropperImage, {
      aspectRatio: profile.width / profile.height,
      viewMode: 1,
      dragMode: 'move',
      autoCropArea: 1.0,   // start at maximum — fitCropBox will refine
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      background: true,
      ready() {
        zoomToFit();            // scale image to fill container, fully visible
        fitCropBox();           // then snap crop box to max fitting aspect ratio
        updateZoomBadge();      // show initial zoom level
      },
      zoom() {
        if (window.innerWidth <= 768) {
          document.querySelector('header')?.classList.add('header-collapsed');
        }
        // Defer so Cropper has committed the new canvas data
        requestAnimationFrame(updateZoomBadge);
      },
      cropstart() {
        if (window.innerWidth <= 768) {
          document.querySelector('header')?.classList.add('header-collapsed');
        }
      },
    });

    showToast('✓ Image loaded — scroll to zoom, drag to reposition', 'ok');
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  if (state.cropper) {
    state.cropper.destroy();
    state.cropper = null;
  }
  dom.cropperImage.src = '';
  dom.cropperWrapper.classList.add('hidden');
  dom.dropzone.classList.remove('hidden');
  dom.statusBadge.classList.add('hidden');
  dom.statusBadge.classList.remove('flex');
  dom.previewCanvas.classList.add('hidden');
  dom.previewPlaceholder.classList.remove('hidden');
  dom.btnDownload.disabled = true;
  dom.statsCard.classList.add('hidden');
  state.processedCanvas = null;
  state.originalFileSize = null;
  state.lastGray = null;
  state.lastRGB  = null;
  state.isColorOutput = false;
  dom.fileInput.value = '';
  showToast('Image cleared', 'info');
}

/* ============================================================
   E-INK PROCESSING PIPELINE
   ============================================================ */
async function runPipeline() {
  if (!state.cropper) {
    showToast('⚠️ Please load an image first', 'warn');
    return;
  }

  dom.processingOverlay.classList.remove('hidden');
  dom.btnPreview.disabled = true;
  await new Promise(r => setTimeout(r, 20));

  const t0 = performance.now();

  try {
    const profile   = getCurrentProfile();
    const { brightness, contrast, gamma, sharpness, saturation,
            invert, autoLevel, ditherAlgorithm, dithering } = state.settings;

    /* 1. Get cropped canvas at target resolution */
    const src = state.cropper.getCroppedCanvas({
      width:  profile.width,
      height: profile.height,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    });

    const w = src.width, h = src.height;
    const rgba = src.getContext('2d').getImageData(0, 0, w, h).data;

    if (profile.color) {
      /* ════════════════════════════════════════════════
         COLOR E-INK PIPELINE (E Ink Kaleido 3 — 4096 colors)
         ════════════════════════════════════════════════ */
      const rBuf = new Float32Array(w * h);
      const gBuf = new Float32Array(w * h);
      const bBuf = new Float32Array(w * h);

      const sat = (saturation + 100) / 100; // 0 = gray, 1 = original, 2 = boosted

      for (let i = 0; i < w * h; i++) {
        let r = rgba[i*4], g = rgba[i*4+1], b = rgba[i*4+2];

        /* Brightness */
        const bright = brightness * 2.55;
        r = clamp(r + bright, 0, 255);
        g = clamp(g + bright, 0, 255);
        b = clamp(b + bright, 0, 255);

        /* Contrast */
        if (contrast !== 0) {
          const f = (259 * (contrast + 255)) / (255 * (259 - contrast));
          r = clamp(f * (r - 128) + 128, 0, 255);
          g = clamp(f * (g - 128) + 128, 0, 255);
          b = clamp(f * (b - 128) + 128, 0, 255);
        }

        /* Gamma */
        if (gamma !== 1.0) {
          const inv = 1.0 / gamma;
          r = 255 * Math.pow(r / 255, inv);
          g = 255 * Math.pow(g / 255, inv);
          b = 255 * Math.pow(b / 255, inv);
        }

        /* Saturation */
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        r = clamp(lum + (r - lum) * sat, 0, 255);
        g = clamp(lum + (g - lum) * sat, 0, 255);
        b = clamp(lum + (b - lum) * sat, 0, 255);

        /* Invert */
        if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }

        rBuf[i] = r; gBuf[i] = g; bBuf[i] = b;
      }

      /* Color dithering (FS per channel, 16 levels each) */
      const outR = new Uint8ClampedArray(w * h);
      const outG = new Uint8ClampedArray(w * h);
      const outB = new Uint8ClampedArray(w * h);
      floydSteinbergColor(rBuf, gBuf, bBuf, outR, outG, outB, w, h);

      /* Build RGBA canvas data */
      const outData = new Uint8ClampedArray(w * h * 4);
      const uniqueColors = new Set();
      for (let i = 0; i < w * h; i++) {
        outData[i*4]   = outR[i];
        outData[i*4+1] = outG[i];
        outData[i*4+2] = outB[i];
        outData[i*4+3] = 255;
        uniqueColors.add((outR[i] << 16) | (outG[i] << 8) | outB[i]);
      }

      /* Store for export */
      const rgbOut = new Uint8Array(w * h * 3);
      for (let i = 0; i < w * h; i++) {
        rgbOut[i*3]   = outR[i];
        rgbOut[i*3+1] = outG[i];
        rgbOut[i*3+2] = outB[i];
      }
      state.lastRGB       = rgbOut;
      state.lastGray      = null;
      state.lastGrayW     = w;
      state.lastGrayH     = h;
      state.lastBitDepth  = 24;
      state.lastGrayLevels = 4096;
      state.isColorOutput  = true;

      const offscreen = document.createElement('canvas');
      offscreen.width = w; offscreen.height = h;
      offscreen.getContext('2d').putImageData(new ImageData(outData, w, h), 0, 0);
      state.processedCanvas = offscreen;

      const elapsed = performance.now() - t0;
      state.lastHistogram = buildColorHistogram(outR, outG, outB, w * h);
      renderPreview(outData, w, h);
      renderHistogram(state.lastHistogram);
      updateStats(w, h, elapsed, uniqueColors.size, 4096, 24);

    } else {
      /* ════════════════════════════════════════════════
         GRAYSCALE PIPELINE
         ════════════════════════════════════════════════ */
      const grayLevels = getCurrentGrayLevels();
      const palette    = buildPalette(grayLevels);
      const bitDepth   = getBitDepth(grayLevels);

      /* 2. Build grayscale float buffer */
      const gray = new Float32Array(w * h);
      for (let i = 0; i < w * h; i++) {
        let r = rgba[i*4], g = rgba[i*4+1], b = rgba[i*4+2];

        const bright = brightness * 2.55;
        r = clamp(r + bright, 0, 255);
        g = clamp(g + bright, 0, 255);
        b = clamp(b + bright, 0, 255);

        if (contrast !== 0) {
          const f = (259 * (contrast + 255)) / (255 * (259 - contrast));
          r = clamp(f * (r - 128) + 128, 0, 255);
          g = clamp(f * (g - 128) + 128, 0, 255);
          b = clamp(f * (b - 128) + 128, 0, 255);
        }

        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        gray[i] = gamma !== 1.0 ? 255 * Math.pow(lum / 255, 1.0 / gamma) : lum;
      }

      if (sharpness > 0) applySharpness(gray, w, h, sharpness / 100);
      if (invert)        for (let i = 0; i < gray.length; i++) gray[i] = 255 - gray[i];
      if (autoLevel)     histogramEqualize(gray, w, h);

      const output = new Uint8ClampedArray(w * h);
      if (!dithering) {
        for (let i = 0; i < gray.length; i++) output[i] = quantize(gray[i], palette);
      } else if (ditherAlgorithm === 'ordered') {
        orderedDither(gray, output, w, h, palette);
      } else if (ditherAlgorithm === 'atkinson') {
        atkinsonDither(gray, output, w, h, palette);
      } else if (ditherAlgorithm === 'jjn') {
        jjnDither(gray, output, w, h, palette);
      } else {
        floydSteinberg(gray, output, w, h, palette);
      }

      const outData    = new Uint8ClampedArray(w * h * 4);
      const histogram  = new Uint32Array(256);
      const uniqueTones = new Set();
      for (let i = 0; i < w * h; i++) {
        const v = output[i];
        outData[i*4] = outData[i*4+1] = outData[i*4+2] = v;
        outData[i*4+3] = 255;
        histogram[v]++;
        uniqueTones.add(v);
      }

      const grayOut = new Uint8Array(w * h);
      for (let i = 0; i < w * h; i++) grayOut[i] = output[i];
      state.lastGray       = grayOut;
      state.lastRGB        = null;
      state.lastGrayW      = w;
      state.lastGrayH      = h;
      state.lastBitDepth   = bitDepth;
      state.lastGrayLevels = grayLevels;
      state.isColorOutput  = false;

      const offscreen = document.createElement('canvas');
      offscreen.width = w; offscreen.height = h;
      offscreen.getContext('2d').putImageData(new ImageData(outData, w, h), 0, 0);
      state.processedCanvas = offscreen;

      const elapsed = performance.now() - t0;
      state.lastHistogram = histogram;
      renderPreview(outData, w, h);
      renderHistogram(state.lastHistogram);
      updateStats(w, h, elapsed, uniqueTones.size, grayLevels, bitDepth);
    }

    dom.btnDownload.disabled = false;
    dom.statsCard.classList.remove('hidden');
    showToast(`✓ Processed in ${(performance.now() - t0).toFixed(0)}ms`, 'ok');

  } catch (err) {
    console.error(err);
    showToast('✗ Processing failed: ' + err.message, 'error');
  } finally {
    dom.processingOverlay.classList.add('hidden');
    dom.btnPreview.disabled = false;
  }
}

/* ============================================================
   PIXEL PROCESSING UTILITIES
   ============================================================ */
function clamp(v, lo, hi) {
  return v < lo ? lo : (v > hi ? hi : v);
}

/** Quantize a float gray value to the nearest entry in `palette`. */
function quantize(v, palette) {
  const clamped = clamp(v, 0, 255);
  const idx = Math.round(clamped / 255 * (palette.length - 1));
  return palette[idx];
}

/** Floyd-Steinberg Dithering — propagates quantisation error using `palette`. */
function floydSteinberg(gray, output, w, h, palette) {
  const buf = new Float32Array(gray);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const old = clamp(buf[idx], 0, 255);
      const neu = quantize(old, palette);
      const err = old - neu;
      output[idx] = neu;

      if (x + 1 < w)               buf[idx + 1]      += err * (7/16);
      if (y + 1 < h && x - 1 >= 0) buf[idx + w - 1]  += err * (3/16);
      if (y + 1 < h)               buf[idx + w]       += err * (5/16);
      if (y + 1 < h && x + 1 < w)  buf[idx + w + 1]  += err * (1/16);
    }
  }
}

/** Unsharp mask — very lightweight convolution */
function applySharpness(gray, w, h, amount) {
  const blur  = new Float32Array(gray.length);
  const kern  = [1,2,1, 2,4,2, 1,2,1];
  const ksize = 3;
  const half  = 1;
  const kSum  = 16;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      for (let ky = -half; ky <= half; ky++) {
        for (let kx = -half; kx <= half; kx++) {
          const sy = clamp(y + ky, 0, h-1);
          const sx = clamp(x + kx, 0, w-1);
          const ki = (ky + half) * ksize + (kx + half);
          sum += gray[sy * w + sx] * kern[ki];
        }
      }
      blur[y * w + x] = sum / kSum;
    }
  }

  for (let i = 0; i < gray.length; i++) {
    gray[i] = clamp(gray[i] + amount * (gray[i] - blur[i]), 0, 255);
  }
}

/* ============================================================
   RENDER PREVIEW
   ============================================================ */
function renderPreview(outData, srcW, srcH) {
  const container = dom.previewCanvas.parentElement;
  const maxW = container.clientWidth || 280;
  const scale = Math.min(1, maxW / srcW);
  const pw = Math.round(srcW * scale);
  const ph = Math.round(srcH * scale);

  dom.previewCanvas.width  = pw;
  dom.previewCanvas.height = ph;

  const pctx = dom.previewCanvas.getContext('2d');

  /* Draw full-res then scale down for preview */
  const temp = document.createElement('canvas');
  temp.width  = srcW;
  temp.height = srcH;
  temp.getContext('2d').putImageData(new ImageData(outData, srcW, srcH), 0, 0);

  pctx.drawImage(temp, 0, 0, pw, ph);

  dom.previewCanvas.classList.remove('hidden');
  dom.previewPlaceholder.classList.add('hidden');
}

/* ============================================================
   HISTOGRAM
   ============================================================ */
function renderHistogram(histogram) {
  const canvas = dom.histogramCanvas;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  const max = Math.max(...histogram) || 1;
  const isDark = document.documentElement.classList.contains('dark');

  // Background
  ctx.fillStyle = isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.9)';
  ctx.fillRect(0, 0, w, h);

  // Bars
  const barW = w / 256;
  for (let i = 0; i < 256; i++) {
    const barH = (histogram[i] / max) * (h - 4);
    if (barH < 0.5) continue;
    const brightness = i / 255;
    ctx.fillStyle = isDark
      ? `rgba(${91 + brightness*164}, ${99 + brightness*156}, ${246 - brightness*10}, ${0.6 + brightness*0.4})`
      : `rgba(${72 + brightness*100}, ${67 + brightness*100}, ${235 - brightness*50}, ${0.7 + brightness*0.3})`;
    ctx.fillRect(i * barW, h - barH, barW + 0.5, barH);
  }

  // Palette level markers (use last rendered palette when available)
  const markerPalette = buildPalette(state.lastGrayLevels || 16);
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  ctx.lineWidth = 1;
  for (const level of markerPalette) {
    const x = (level / 255) * w;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}

/* ============================================================
   OUTPUT STATS
   ============================================================ */
function updateStats(w, h, ms, tones, grayLevels, bitDepth) {
  dom.statResolution.textContent = `${w}×${h}`;
  dom.statTime.textContent       = `${ms.toFixed(0)}ms`;
  dom.statTones.textContent      = `${tones} / ${grayLevels}`;
  dom.statLevels.textContent     = `${grayLevels} (${bitDepth}-bit)`;
  updateOutputSizeStat();
}

async function updateOutputSizeStat() {
  if (!state.processedCanvas) {
    if (dom.statSize) dom.statSize.textContent = '—';
    if (dom.statRatio) dom.statRatio.textContent = '—';
    return;
  }

  const format = dom.downloadFormat ? dom.downloadFormat.value : 'png';
  let bytesCount = 0;

  try {
    if (format === 'png') {
      if (state.isColorOutput) {
        const blob = await new Promise(r => state.processedCanvas.toBlob(r, 'image/png'));
        bytesCount = blob.size;
      } else if (state.lastGray) {
        const bitDepth   = state.lastBitDepth   || 4;
        const grayLevels = state.lastGrayLevels || 16;
        if (typeof CompressionStream !== 'undefined') {
          const pngBytes = await encodeGrayscalePNG(
            state.lastGray,
            state.lastGrayW,
            state.lastGrayH,
            bitDepth,
            grayLevels,
          );
          bytesCount = pngBytes.length;
        } else {
          const blob = await new Promise(r => state.processedCanvas.toBlob(r, 'image/png'));
          bytesCount = blob.size;
        }
      }
    } else if (format === 'bmp') {
      const w = state.lastGrayW;
      const h = state.lastGrayH;
      if (state.isColorOutput && state.lastRGB) {
        const rowStride = Math.floor((w * 3 + 3) / 4) * 4;
        bytesCount = 54 + rowStride * h;
      } else if (state.lastGray) {
        const bitDepth = state.lastBitDepth || 4;
        const paletteColors = 1 << bitDepth;
        const rowStride = Math.floor(((w * bitDepth + 31) / 32)) * 4;
        bytesCount = 54 + paletteColors * 4 + rowStride * h;
      }
    } else if (format === 'jpg') {
      const quality = (state.settings.jpgQuality || 85) / 100;
      const blob = await new Promise(r => state.processedCanvas.toBlob(r, 'image/jpeg', quality));
      bytesCount = blob.size;
    }

    if (bytesCount > 0) {
      const kb = (bytesCount / 1024).toFixed(1);
      if (dom.statSize) dom.statSize.textContent = `${kb} KB`;

      if (state.originalFileSize && dom.statRatio) {
        const pct = ((bytesCount / state.originalFileSize) * 100).toFixed(1);
        dom.statRatio.textContent = `${pct}%`;
      } else {
        if (dom.statRatio) dom.statRatio.textContent = '—';
      }
    } else {
      if (dom.statSize) dom.statSize.textContent = '—';
      if (dom.statRatio) dom.statRatio.textContent = '—';
    }
  } catch (e) {
    console.error('Error estimating output size:', e);
    if (dom.statSize) dom.statSize.textContent = '—';
    if (dom.statRatio) dom.statRatio.textContent = '—';
  }
}

/* ============================================================
   DOWNLOAD OUTPUT
   ============================================================ */
async function downloadOutput() {
  if (!state.processedCanvas) return;

  const profile  = getCurrentProfile();
  const ts       = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 15);
  const btnHTML  = dom.btnDownload.innerHTML;
  dom.btnDownload.disabled = true;
  dom.btnDownload.textContent = '⏳ Encoding…';

  const format = dom.downloadFormat ? dom.downloadFormat.value : 'png';

  try {
    let bytes;
    let filename;
    let mimeType;
    let savedMsg;

    if (format === 'png') {
      mimeType = 'image/png';
      if (state.isColorOutput) {
        /* Color e-ink — use canvas toDataURL (24-bit PNG, preserves RGB) */
        filename = `${profile.name.replace(/\s/g, '_')}_color_${ts}.png`;
        const dataURL = state.processedCanvas.toDataURL('image/png');
        const res = await fetch(dataURL);
        bytes  = new Uint8Array(await res.arrayBuffer());
      } else if (state.lastGray) {
        const bitDepth   = state.lastBitDepth   || 4;
        const grayLevels = state.lastGrayLevels || 16;
        filename = `${profile.name.replace(/\s/g, '_')}_${bitDepth}bit_${ts}.png`;

        if (typeof CompressionStream !== 'undefined') {
          bytes = await encodeGrayscalePNG(
            state.lastGray,
            state.lastGrayW,
            state.lastGrayH,
            bitDepth,
            grayLevels,
          );
        } else {
          /* Fallback: 8-bit RGBA PNG via Canvas */
          const dataURL = state.processedCanvas.toDataURL('image/png');
          const res  = await fetch(dataURL);
          bytes   = new Uint8Array(await res.arrayBuffer());
          showToast('⚠ CompressionStream unavailable — using 8-bit RGBA fallback', 'warn');
        }
      } else {
        showToast('⚠ No processed image — run Preview first', 'warn');
        return;
      }
      savedMsg = `✓ PNG saved · ${(bytes.length / 1024).toFixed(1)} KB`;

    } else if (format === 'bmp') {
      mimeType = 'image/bmp';
      if (state.isColorOutput && state.lastRGB) {
        /* 24-bit color BMP */
        filename = `${profile.name.replace(/\s/g,'_')}_24bit_${ts}.bmp`;
        bytes = encodeBMP3(state.lastRGB, state.lastGrayW, state.lastGrayH, 24, []);
      } else if (state.lastGray) {
        const bitDepth   = state.lastBitDepth;
        const grayLevels = state.lastGrayLevels;
        const palette    = buildPalette(grayLevels);
        filename = `${profile.name.replace(/\s/g,'_')}_${bitDepth}bit_${ts}.bmp`;
        bytes = encodeBMP3(state.lastGray, state.lastGrayW, state.lastGrayH, bitDepth, palette);
      } else {
        showToast('⚠ No processed image — run Preview first', 'warn');
        return;
      }
      savedMsg = `✓ BMP3 saved · ${(bytes.length / 1024).toFixed(1)} KB`;

    } else if (format === 'jpg') {
      mimeType = 'image/jpeg';
      filename = `${profile.name.replace(/\s/g, '_')}_${ts}.jpg`;
      const quality = (state.settings.jpgQuality || 85) / 100;
      const dataURL = state.processedCanvas.toDataURL('image/jpeg', quality);
      const res = await fetch(dataURL);
      bytes = new Uint8Array(await res.arrayBuffer());
      savedMsg = `✓ JPG saved · ${(bytes.length / 1024).toFixed(1)} KB`;
    }

    if (bytes) {
      const blob = new Blob([bytes], { type: mimeType });
      const url  = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
      showToast(savedMsg, 'ok');
    }

  } catch (err) {
    console.error('Export error:', err);
    showToast(`✗ Export failed: ${err.message}`, 'error');
  } finally {
    dom.btnDownload.innerHTML = btnHTML;
    dom.btnDownload.disabled  = false;
  }
}

/* ============================================================
   PROFILE EXPORT / IMPORT
   ============================================================ */
function exportProfile() {
  const profile = {
    version: 1,
    device:           state.settings.device,
    customWidth:      state.settings.customWidth,
    customHeight:     state.settings.customHeight,
    customGrayLevels:  state.settings.customGrayLevels,
    customColor:       state.settings.customColor,
    brightness:        state.settings.brightness,
    contrast:          state.settings.contrast,
    gamma:             state.settings.gamma,
    sharpness:         state.settings.sharpness,
    saturation:        state.settings.saturation,
    invert:            state.settings.invert,
    autoLevel:         state.settings.autoLevel,
    ditherAlgorithm:   state.settings.ditherAlgorithm,
    dithering:         state.settings.dithering,
    exportedAt:       new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `eink_profile_${Date.now()}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
  showToast('✓ Profile exported', 'ok');
}

function importProfile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (parsed.version !== 1) throw new Error('Unknown profile version');
      state.settings = { ...state.settings, ...parsed };
      applySettingsToUI();
      saveSettings();
      updateSliderTrack(dom.sliderBrightness);
      updateSliderTrack(dom.sliderContrast);
      updateSliderTrack(dom.sliderGamma);
      updateSliderTrack(dom.sliderSharpness);
      showToast('✓ Profile imported', 'ok');
    } catch (err) {
      showToast('✗ Invalid profile file', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // allow reimport of same file
}

/* ============================================================
   AUTO-FIT CROP BOX
   Expands the crop box to the largest rectangle that fits the
   canvas while maintaining the locked aspect ratio.
   ============================================================ */
function fitCropBox() {
  if (!state.cropper) return;

  const profile    = getCurrentProfile();           // target device dims
  const targetAR   = profile.width / profile.height;
  const canvasData = state.cropper.getCanvasData(); // rendered canvas rect

  const canvasW = canvasData.width;
  const canvasH = canvasData.height;
  const canvasAR = canvasW / canvasH;

  let boxW, boxH;
  if (targetAR > canvasAR) {
    // Crop box is wider relative to canvas → constrain by width
    boxW = canvasW;
    boxH = canvasW / targetAR;
  } else {
    // Crop box is taller relative to canvas → constrain by height
    boxH = canvasH;
    boxW = canvasH * targetAR;
  }

  // Center the crop box within the canvas
  const left = canvasData.left + (canvasW - boxW) / 2;
  const top  = canvasData.top  + (canvasH - boxH) / 2;

  state.cropper.setCropBoxData({ left, top, width: boxW, height: boxH });
  requestAnimationFrame(updateZoomBadge);
}

/* ============================================================
   WHEEL ZOOM  (proportional — consistent feel at any zoom level)
   ============================================================ */
function setupWheelZoom() {
  const ZOOM_PCT  = 0.12;   // zoom by 12% of current ratio per wheel tick
  let   badgeTimer = null;

  dom.cropperWrapper.addEventListener('wheel', e => {
    if (!state.cropper) return;
    e.preventDefault();

    const direction = e.deltaY < 0 ? 1 : -1;   // scroll up = zoom in

    const imgData      = state.cropper.getImageData();
    const currentRatio = imgData.ratio || state.fitZoomRatio || 1;

    // Proportional step: feels identical whether image is tiny or huge
    const step     = currentRatio * ZOOM_PCT * direction;
    const newRatio = currentRatio + step;

    // Floor: can always zoom back out to the fitted view (never further)
    const minRatio = (state.fitZoomRatio || 0.01) * 0.8;
    const maxRatio = (state.fitZoomRatio || 1)    * 16;
    if (newRatio < minRatio || newRatio > maxRatio) return;

    state.cropper.zoom(step);

    // Pulse the badge then fade out
    showZoomBadge();
    if (badgeTimer) clearTimeout(badgeTimer);
    badgeTimer = setTimeout(hideZoomBadge, 1400);
  }, { passive: false });
}

/* ============================================================
   ZOOM TO FIT
   Scales the Cropper canvas so the entire image is visible
   within the container — no clipping, no scrolling needed.
   Stores the resulting ratio as the zoom-out floor.
   ============================================================ */
function zoomToFit() {
  if (!state.cropper) return;

  const container = state.cropper.getContainerData();
  const image     = state.cropper.getImageData();

  if (!container.width || !container.height || !image.naturalWidth || !image.naturalHeight) return;

  // Compute the ratio that fits the image inside the container with 8px padding
  const pad  = 16;
  const scaleW = (container.width  - pad) / image.naturalWidth;
  const scaleH = (container.height - pad) / image.naturalHeight;
  const fitRatio = Math.min(scaleW, scaleH);

  state.fitZoomRatio = fitRatio;
  state.cropper.zoomTo(fitRatio);
}

function updateZoomBadge() {
  if (!state.cropper || !dom.zoomBadge) return;
  const imgData  = state.cropper.getImageData();
  const fitRatio = state.fitZoomRatio || imgData.ratio || 1;
  // Display as % relative to fitted view: 100% = fully fitted, 200% = 2× zoomed in
  const pct = imgData.ratio != null
    ? Math.round((imgData.ratio / fitRatio) * 100)
    : 100;
  dom.zoomBadge.querySelector('span').textContent = `${pct}%`;
}

function showZoomBadge() {
  updateZoomBadge();
  dom.zoomBadge?.classList.remove('opacity-0', 'scale-90');
  dom.zoomBadge?.classList.add('opacity-100', 'scale-100');
}

function hideZoomBadge() {
  dom.zoomBadge?.classList.remove('opacity-100', 'scale-100');
  dom.zoomBadge?.classList.add('opacity-0', 'scale-90');
}

/* ============================================================
   RESIZE HANDLE (drag to resize sidebar on desktop / drawer height on mobile)
   ============================================================ */
function setupResizeHandle() {
  let dragging = false;
  let startX, startY;
  let startW, startH;

  const onStart = (clientX, clientY) => {
    dragging = true;
    startX = clientX;
    startY = clientY;
    startW = dom.rightPane.offsetWidth;
    startH = dom.leftPane.offsetHeight;
    document.body.style.userSelect = 'none';
  };

  const onMove = (clientX, clientY) => {
    if (!dragging) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      // Vertical drag: dragging down expands left pane
      const dy = clientY - startY;
      const mainElement = dom.rightPane.parentElement;
      const mainH = mainElement.offsetHeight;
      
      // Limit left pane height between 20% and 80% of main height
      const newH = clamp(startH + dy, mainH * 0.20, mainH * 0.80);
      dom.leftPane.style.height = `${newH}px`;
      if (state.cropper) {
        state.cropper.resize();
      }
    } else {
      // Horizontal drag: dragging left expands sidebar
      const dx = startX - clientX;
      const newW = clamp(startW + dx, 260, 480);
      dom.rightPane.style.width = `${newW}px`;
    }
  };

  const onEnd = () => {
    if (dragging) {
      dragging = false;
      document.body.style.userSelect = '';
    }
  };

  // Mouse Listeners
  dom.resizeHandle.addEventListener('mousedown', e => {
    onStart(e.clientX, e.clientY);
    document.body.style.cursor = window.innerWidth <= 768 ? 'row-resize' : 'col-resize';
  });

  document.addEventListener('mousemove', e => {
    onMove(e.clientX, e.clientY);
  });

  document.addEventListener('mouseup', () => {
    onEnd();
    document.body.style.cursor = '';
  });

  // Touch Listeners
  dom.resizeHandle.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      onStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (dragging && e.touches.length === 1) {
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  document.addEventListener('touchend', onEnd);
  document.addEventListener('touchcancel', onEnd);
}

/* ============================================================
   PWA INSTALL PROMPT
   ============================================================ */
function setupInstallPrompt() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    dom.btnInstall.classList.remove('hidden');
  });

  dom.btnInstall.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      dom.btnInstall.classList.add('hidden');
      showToast('✓ App installed!', 'ok');
    }
    deferredPrompt = null;
  });

  window.addEventListener('appinstalled', () => {
    dom.btnInstall.classList.add('hidden');
  });
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
let toastTimer = null;

function showToast(msg, type = 'info') {
  const icons = { ok: '✓', warn: '⚠', error: '✗', info: 'ℹ' };
  const colors = {
    ok:    'border-emerald-500/40 text-emerald-300',
    warn:  'border-amber-500/40 text-amber-300',
    error: 'border-rose-500/40 text-rose-300',
    info:  'border-slate-500/40 text-slate-300',
  };

  dom.toast.className = `toast ${colors[type] || colors.info}`;
  dom.toastIcon.textContent = icons[type] || '';
  dom.toastMsg.textContent  = msg;

  // Force re-flow then show
  dom.toast.classList.remove('show');
  void dom.toast.offsetWidth;
  dom.toast.classList.add('show');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    dom.toast.classList.remove('show');
  }, 3000);
}

/* ============================================================
   ORDERED (BAYER) DITHERING
   ============================================================ */
function orderedDither(gray, output, w, h, palette) {
  const step = 255 / (palette.length - 1); // step between palette entries
  const size = state.settings.bayerSize || 8;

  let matrix = BAYER_8X8;
  let divisor = 64;
  let mask = 7;

  if (size === 2) {
    matrix = BAYER_2X2;
    divisor = 4;
    mask = 1;
  } else if (size === 4) {
    matrix = BAYER_4X4;
    divisor = 16;
    mask = 3;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      // Add bias: (bayer / divisor - 0.5) × step gives symmetric spread around zero
      const bias = (matrix[y & mask][x & mask] / divisor - 0.5) * step;
      output[idx] = quantize(clamp(gray[idx] + bias, 0, 255), palette);
    }
  }
}

/* ============================================================
   ATKINSON DITHERING
   (Distributes 6/8 of the error — discards 2/8 for a lighter look)
   ============================================================ */
function atkinsonDither(gray, output, w, h, palette) {
  const buf = new Float32Array(gray);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const old = clamp(buf[idx], 0, 255);
      const neu = quantize(old, palette);
      const e   = (old - neu) / 8; // 1/8 per neighbour
      output[idx] = neu;

      if (x + 1 < w)               buf[idx + 1]         += e;
      if (x + 2 < w)               buf[idx + 2]         += e;
      if (y + 1 < h && x > 0)      buf[idx + w - 1]     += e;
      if (y + 1 < h)               buf[idx + w]          += e;
      if (y + 1 < h && x + 1 < w)  buf[idx + w + 1]     += e;
      if (y + 2 < h)               buf[idx + w * 2]      += e;
    }
  }
}

/* ============================================================
   JARVIS, JUDICE, NINKE (JJN) DITHERING
   ============================================================ */
function jjnDither(gray, output, w, h, palette) {
  const buf = new Float32Array(gray);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const old = clamp(buf[idx], 0, 255);
      const neu = quantize(old, palette);
      const e   = (old - neu) / 48;
      output[idx] = neu;

      // Current row
      if (x + 1 < w) buf[idx + 1] += e * 7;
      if (x + 2 < w) buf[idx + 2] += e * 5;

      // Row + 1
      if (y + 1 < h) {
        if (x - 2 >= 0) buf[idx + w - 2] += e * 3;
        if (x - 1 >= 0) buf[idx + w - 1] += e * 5;
        buf[idx + w] += e * 7;
        if (x + 1 < w) buf[idx + w + 1] += e * 5;
        if (x + 2 < w) buf[idx + w + 2] += e * 3;
      }

      // Row + 2
      if (y + 2 < h) {
        if (x - 2 >= 0) buf[idx + w * 2 - 2] += e * 1;
        if (x - 1 >= 0) buf[idx + w * 2 - 1] += e * 3;
        buf[idx + w * 2] += e * 5;
        if (x + 1 < w) buf[idx + w * 2 + 1] += e * 3;
        if (x + 2 < w) buf[idx + w * 2 + 2] += e * 1;
      }
    }
  }
}

/* ============================================================
   AUTO-LEVEL — CDF histogram equalization
   ============================================================ */
function histogramEqualize(gray, w, h) {
  const n = w * h;

  // Build histogram
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) hist[Math.round(gray[i])]++;

  // Cumulative distribution
  const cdf = new Uint32Array(256);
  cdf[0] = hist[0];
  for (let i = 1; i < 256; i++) cdf[i] = cdf[i-1] + hist[i];

  // Find cdf_min (first non-zero bucket)
  let cdfMin = 0;
  for (let i = 0; i < 256; i++) { if (cdf[i]) { cdfMin = cdf[i]; break; } }

  // Build LUT
  const lut = new Uint8Array(256);
  const denom = n - cdfMin || 1;
  for (let i = 0; i < 256; i++) {
    lut[i] = Math.round((cdf[i] - cdfMin) / denom * 255);
  }

  // Apply
  for (let i = 0; i < n; i++) gray[i] = lut[Math.round(clamp(gray[i], 0, 255))];
}

/* ============================================================
   COLOR FLOYD-STEINBERG  (per-channel, 16 levels each → 4096 colors)
   ============================================================ */
function quantizeChannel(v) {
  return Math.round(clamp(v, 0, 255) / 255 * 15) * 17;
}

function floydSteinbergColor(rBuf, gBuf, bBuf, outR, outG, outB, w, h) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const qR = quantizeChannel(rBuf[idx]);
      const qG = quantizeChannel(gBuf[idx]);
      const qB = quantizeChannel(bBuf[idx]);
      const eR = rBuf[idx] - qR;
      const eG = gBuf[idx] - qG;
      const eB = bBuf[idx] - qB;
      outR[idx] = qR; outG[idx] = qG; outB[idx] = qB;

      function spread(buf, err) {
        if (x + 1 < w)               buf[idx + 1]      += err * (7/16);
        if (y + 1 < h && x > 0)      buf[idx + w - 1]  += err * (3/16);
        if (y + 1 < h)               buf[idx + w]       += err * (5/16);
        if (y + 1 < h && x + 1 < w)  buf[idx + w + 1]  += err * (1/16);
      }
      spread(rBuf, eR); spread(gBuf, eG); spread(bBuf, eB);
    }
  }
}

/** Build a combined grayscale histogram from RGB output (luma-weighted). */
function buildColorHistogram(outR, outG, outB, n) {
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) {
    const luma = Math.round(0.299 * outR[i] + 0.587 * outG[i] + 0.114 * outB[i]);
    hist[luma]++;
  }
  return hist;
}

/* ============================================================
   MAGNIFYING LOUPE
   Shows a 3× pixel-accurate zoom circle on the preview canvas.
   ============================================================ */
function setupLoupe() {
  const loupe   = dom.loupeCanvas;
  if (!loupe) return;

  const DIAM   = 140;  // loupe diameter in CSS px
  const ZOOM   = 4;    // magnification factor
  const HALF   = DIAM / 2;
  const SRC_R  = Math.ceil(HALF / ZOOM); // source radius in processed canvas px

  loupe.width  = DIAM;
  loupe.height = DIAM;

  function update(e) {
    if (!state.processedCanvas) { loupe.classList.remove('visible'); return; }

    const preview = dom.previewCanvas;
    const rect    = preview.getBoundingClientRect();
    const cssX    = e.clientX - rect.left;
    const cssY    = e.clientY - rect.top;

    // Clamp so loupe stays inside preview bounds
    if (cssX < 0 || cssY < 0 || cssX > rect.width || cssY > rect.height) {
      loupe.classList.remove('visible'); return;
    }

    // Map to source canvas coords
    const scaleX = state.processedCanvas.width  / (rect.width  || 1);
    const scaleY = state.processedCanvas.height / (rect.height || 1);
    const srcX   = Math.round(cssX * scaleX);
    const srcY   = Math.round(cssY * scaleY);

    // Position loupe: top-right of cursor offset by 16px
    const lx = e.clientX + 16;
    const ly = e.clientY - HALF - 16;
    loupe.style.left = `${lx}px`;
    loupe.style.top  = `${ly}px`;
    loupe.classList.add('visible');

    // Draw magnified content
    const ctx = loupe.getContext('2d');
    ctx.clearRect(0, 0, DIAM, DIAM);

    ctx.save();
    ctx.beginPath();
    ctx.arc(HALF, HALF, HALF - 2, 0, Math.PI * 2);
    ctx.clip();

    ctx.imageSmoothingEnabled = false;  // crisp pixel grid
    ctx.drawImage(
      state.processedCanvas,
      srcX - SRC_R, srcY - SRC_R, SRC_R * 2, SRC_R * 2,
      0, 0, DIAM, DIAM
    );
    ctx.restore();

    // Border ring
    ctx.beginPath();
    ctx.arc(HALF, HALF, HALF - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(117,133,252,0.9)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // Crosshair
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(HALF, HALF-10); ctx.lineTo(HALF, HALF+10); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(HALF-10, HALF); ctx.lineTo(HALF+10, HALF); ctx.stroke();
  }

  dom.previewCanvas.addEventListener('mousemove', update);
  dom.previewCanvas.addEventListener('mouseleave', () => loupe.classList.remove('visible'));
}

/* ============================================================
   BMP3 ENCODER  (BITMAPINFOHEADER, uncompressed BI_RGB)
   Supports 1-bit, 4-bit, 8-bit grayscale and 24-bit color.
   ============================================================ */
function encodeBMP3(data, w, h, bitDepth, palette) {
  const isColor    = bitDepth === 24;
  const paletteLen = isColor ? 0 : palette.length;
  const clrTblSize = paletteLen * 4;                           // 4 bytes per RGBQUAD
  const pxBPP      = isColor ? 24 : bitDepth;                  // bits per pixel
  const rowRawBytes = isColor ? w * 3 : Math.ceil(w * bitDepth / 8);
  const rowStride  = Math.ceil(rowRawBytes / 4) * 4;           // 4-byte aligned
  const pixelBytes = rowStride * h;
  const hdrSize    = 14 + 40;                                   // file + DIB headers
  const fileSize   = hdrSize + clrTblSize + pixelBytes;
  const dataOffset = hdrSize + clrTblSize;

  const buf = new Uint8Array(fileSize);
  const dv  = new DataView(buf.buffer);

  /* ── BITMAPFILEHEADER (14 bytes) ── */
  buf[0] = 0x42; buf[1] = 0x4D;            // 'BM'
  dv.setUint32(2,  fileSize,   true);
  dv.setUint16(6,  0,          true);       // reserved
  dv.setUint16(8,  0,          true);       // reserved
  dv.setUint32(10, dataOffset, true);

  /* ── BITMAPINFOHEADER (40 bytes) ── */
  dv.setUint32(14, 40,         true);       // biSize
  dv.setInt32 (18, w,          true);       // biWidth
  dv.setInt32 (22, h,          true);       // biHeight (positive = bottom-up)
  dv.setUint16(26, 1,          true);       // biPlanes
  dv.setUint16(28, pxBPP,      true);       // biBitCount
  dv.setUint32(30, 0,          true);       // biCompression = BI_RGB
  dv.setUint32(34, pixelBytes, true);       // biSizeImage
  dv.setInt32 (38, 2835,       true);       // biXPelsPerMeter (~72 DPI)
  dv.setInt32 (42, 2835,       true);       // biYPelsPerMeter
  dv.setUint32(46, paletteLen, true);       // biClrUsed
  dv.setUint32(50, paletteLen, true);       // biClrImportant

  /* ── Color table (grayscale RGBQUAD entries) ── */
  let off = 54;
  for (const v of palette) {
    buf[off++] = v; buf[off++] = v; buf[off++] = v; buf[off++] = 0;
  }

  /* ── Pixel data (bottom-to-top row order) ── */
  for (let imgRow = 0; imgRow < h; imgRow++) {
    const fileRow = h - 1 - imgRow;          // BMP stores bottom row first
    const rowOff  = dataOffset + fileRow * rowStride;

    if (isColor) {
      /* 24-bit color: BGR byte order */
      for (let x = 0; x < w; x++) {
        buf[rowOff + x*3    ] = data[imgRow * w * 3 + x*3 + 2]; // B
        buf[rowOff + x*3 + 1] = data[imgRow * w * 3 + x*3 + 1]; // G
        buf[rowOff + x*3 + 2] = data[imgRow * w * 3 + x*3    ]; // R
      }
    } else if (bitDepth === 8) {
      for (let x = 0; x < w; x++) {
        const v   = data[imgRow * w + x];
        const idx = Math.round(v / 255 * (palette.length - 1));
        buf[rowOff + x] = idx;
      }
    } else if (bitDepth === 4) {
      for (let x = 0; x < w; x++) {
        const v   = data[imgRow * w + x];
        const idx = Math.round(v / 255 * 15) & 0x0F;
        const b   = rowOff + (x >> 1);
        buf[b] = (x & 1) ? (buf[b] | idx) : (idx << 4);
      }
    } else if (bitDepth === 1) {
      for (let x = 0; x < w; x++) {
        const bit = data[imgRow * w + x] > 127 ? 1 : 0;
        const b   = rowOff + (x >> 3);
        buf[b] |= bit << (7 - (x & 7));
      }
    }
  }

  return buf;
}



/* ============================================================
   PNG ENCODER — true grayscale PNG at 1 / 2 / 4 / 8-bit depth
   Uses the browser's native CompressionStream('deflate') API
   which outputs the zlib format that PNG IDAT chunks require.
   Supported since Chrome 80, Firefox 113, Safari 16.4.
   ============================================================ */

/** Pre-computed CRC-32 lookup table (IEEE polynomial 0xEDB88320). */
const CRC32_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function pngCrc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ buf[i]) & 0xFF];
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Wrap `data` in a PNG chunk:
 *   [4 B length] [4 B type] [data] [4 B CRC over type+data]
 */
function pngChunk(typeStr, data) {
  const type = new TextEncoder().encode(typeStr);  // always 4 ASCII bytes
  const out  = new Uint8Array(12 + data.length);
  const dv   = new DataView(out.buffer);

  dv.setUint32(0, data.length);   // length field (big-endian)
  out.set(type, 4);               // chunk type
  out.set(data, 8);               // chunk data

  // CRC covers the type bytes + data bytes
  const crcInput = new Uint8Array(4 + data.length);
  crcInput.set(type, 0);
  crcInput.set(data, 4);
  dv.setUint32(8 + data.length, pngCrc32(crcInput));

  return out;
}

/**
 * Compress `raw` with zlib (deflate + zlib wrapper).
 * CompressionStream('deflate') outputs RFC-1950 zlib format,
 * which is exactly what PNG IDAT chunks expect.
 */
async function zlibCompress(raw) {
  const cs     = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  const reader = cs.readable.getReader();

  writer.write(raw);
  writer.close();

  const chunks = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const size = chunks.reduce((s, c) => s + c.length, 0);
  const out  = new Uint8Array(size);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

/**
 * Encode a grayscale image as a PNG file with the given bit depth.
 *
 * @param {Uint8Array} gray      - One byte per pixel (0-255), row-major
 * @param {number}     w         - Width in pixels
 * @param {number}     h         - Height in pixels
 * @param {number}     depth     - PNG bit depth: 1 | 2 | 4 | 8
 * @param {number}     grayLevels- Number of distinct tones (e.g. 16)
 * @returns {Promise<Uint8Array>} Complete PNG file as raw bytes
 */
async function encodeGrayscalePNG(gray, w, h, depth, grayLevels) {
  const pixPerByte = 8 / depth;                         // e.g. 2 px/byte for 4-bit
  const rowBytes   = Math.ceil(w / pixPerByte);         // pixel bytes per row
  const maxVal     = (1 << depth) - 1;                  // e.g. 15 for 4-bit
  // Map 0-255 input to 0-maxVal index (the palette values ARE multiples of 255/maxVal)
  const scale      = 255 / maxVal;                      // e.g. 17 for 4-bit

  /* ── Build raw scanlines: [1 filter byte] [row pixel bytes…] per row ── */
  const raw = new Uint8Array(h * (1 + rowBytes));

  for (let y = 0; y < h; y++) {
    const rowOff = y * (1 + rowBytes);
    raw[rowOff]  = 0;                                   // filter method: None

    if (depth === 8) {
      /* 8-bit: one byte per pixel — straight copy */
      raw.set(gray.subarray(y * w, y * w + w), rowOff + 1);
    } else {
      /* Sub-8-bit: pack multiple pixels per byte, MSB first (PNG spec §7.2) */
      for (let x = 0; x < w; x++) {
        const idx    = Math.round(gray[y * w + x] / scale); // 0 … maxVal
        const shift  = (8 - depth) - (x % pixPerByte) * depth;
        raw[rowOff + 1 + Math.floor(x / pixPerByte)] |= (idx & maxVal) << shift;
      }
    }
  }

  /* ── Compress the scanlines with zlib ── */
  const idat = await zlibCompress(raw);

  /* ── IHDR: 13 bytes of image metadata ── */
  const ihdr   = new Uint8Array(13);
  const ihdrDV = new DataView(ihdr.buffer);
  ihdrDV.setUint32(0, w);   // image width
  ihdrDV.setUint32(4, h);   // image height
  ihdr[8]  = depth;         // bit depth
  ihdr[9]  = 0;             // color type 0 = grayscale
  ihdr[10] = 0;             // compression: deflate/inflate
  ihdr[11] = 0;             // filter: adaptive
  ihdr[12] = 0;             // interlace: none

  /* ── Assemble final PNG ── */
  const sig  = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]); // PNG magic bytes
  const IHDR = pngChunk('IHDR', ihdr);
  const IDAT = pngChunk('IDAT', idat);
  const IEND = pngChunk('IEND', new Uint8Array(0));

  const total = sig.length + IHDR.length + IDAT.length + IEND.length;
  const png   = new Uint8Array(total);
  let off = 0;
  png.set(sig,  off); off += sig.length;
  png.set(IHDR, off); off += IHDR.length;
  png.set(IDAT, off); off += IDAT.length;
  png.set(IEND, off);

  return png;
}

/* ============================================================
   BOOT
   ============================================================ */
document.addEventListener('DOMContentLoaded', init);
