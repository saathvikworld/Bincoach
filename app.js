/* =========================================================================
   BinCoach — prototype for Smart India Hackathon 2026
   Vanilla JS, no build step, no backend. All state lives in memory.
   ========================================================================= */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };
  var el = function (tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  /* ---------------------------------------------------------------- bins */

  var BINS = {
    wet: {
      key: 'wet', name: 'Wet waste', bin: 'Green bin', colour: '#2E7D32', colourName: 'Green',
      letter: 'W',
      why: 'It rots. Green-bin waste goes to the ward compost pit or biogas unit within 24 hours.',
      examples: ['Kitchen scraps, peels, leftovers', 'Garden leaves and flowers', 'Tea leaves, eggshells, bones']
    },
    dry: {
      key: 'dry', name: 'Dry recyclable', bin: 'Blue bin', colour: '#1565C0', colourName: 'Blue',
      letter: 'D',
      why: 'It has resale value. Rinse it, keep it dry, and the blue bin sends it to the material recovery facility.',
      examples: ['Plastic bottles, wrappers, packets', 'Paper, cardboard, newspaper', 'Glass, tin, metal, cloth, footwear']
    },
    hazard: {
      key: 'hazard', name: 'Domestic hazardous', bin: 'Red bin', colour: '#C62828', colourName: 'Red',
      letter: 'H',
      why: 'It can burn, poison or leak. Red-bin waste must reach the ward hazardous collection point, never a landfill.',
      examples: ['Batteries, bulbs, CFL tubes', 'Paints, solvents, insecticides', 'Expired medicines, syringes, aerosols']
    },
    ewaste: {
      key: 'ewaste', name: 'E-waste', bin: 'Black bin', colour: '#212121', colourName: 'Black',
      letter: 'E',
      why: 'It holds recoverable metals and toxic parts. Hand it to an authorised E-Waste Rules collection centre.',
      examples: ['Phones, laptops, keyboards, mice', 'Cables, chargers, adapters', 'Remotes, headphones, circuit boards']
    },
    sanitary: {
      key: 'sanitary', name: 'Sanitary waste', bin: 'Yellow bin', colour: '#F9A825', colourName: 'Yellow',
      letter: 'S',
      why: 'It is a biohazard for sanitation workers. Wrap it in newspaper and use the yellow bin so nobody sorts it by hand.',
      examples: ['Diapers, sanitary napkins', 'Masks, gloves, bandages', 'Used tissues and dressings']
    }
  };
  var BIN_ORDER = ['wet', 'dry', 'hazard', 'ewaste', 'sanitary'];

  function inkOn(hex) {
    var r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return lum > 0.6 ? '#1b1a10' : '#ffffff';
  }

  /* ------------------------------------------- ImageNet -> bin keyword map */

  var KEYWORDS = {
    wet: ['food', 'fruit', 'vegetable', 'banana', 'peel', 'bread', 'pizza', 'leaf', 'leaves', 'flower',
      'tea', 'eggshell', 'egg', 'apple', 'orange', 'lemon', 'lime', 'mango', 'tomato', 'potato', 'onion',
      'cabbage', 'cauliflower', 'broccoli', 'cucumber', 'corn', 'rice', 'pasta', 'noodle', 'soup', 'curry',
      'meal', 'plate of food', 'cheese', 'pomegranate', 'pineapple', 'strawberry', 'fig', 'grape', 'coconut',
      'jackfruit', 'custard apple', 'granny smith', 'bell pepper', 'zucchini', 'squash', 'artichoke', 'cardoon',
      'mushroom', 'compost', 'bone', 'meat', 'fish', 'chicken', 'mutton', 'guacamole', 'dough', 'bagel',
      'pretzel', 'cake', 'ice cream', 'chocolate sauce', 'trifle', 'daisy', 'rose', 'petal', 'plant',
      'cabbage butterfly', 'spinach', 'coffee', 'husk', 'peanut', 'shell'],
    dry: ['bottle', 'plastic', 'can', 'carton', 'paper', 'newspaper', 'newsprint', 'cardboard', 'glass',
      'tin', 'packet', 'wrapper', 'bag', 'cup', 'box', 'jar', 'envelope', 'magazine', 'book', 'notebook',
      'jug', 'container', 'pot', 'pan', 'tray', 'foil', 'cloth', 'textile', 'shoe', 'sandal', 'sock',
      'jean', 'shirt', 'jersey', 'sweater', 'toy', 'ball', 'bucket', 'mug', 'plate', 'bowl', 'spoon',
      'fork', 'knife', 'straw', 'comb', 'brush', 'pen', 'pencil', 'rubber', 'sack', 'crate', 'barrel',
      'corkscrew', 'bottlecap', 'chain', 'umbrella', 'wallet', 'purse', 'backpack',
      'suitcase', 'basket', 'hamper', 'vase', 'ashcan', 'trash can', 'water jug', 'pop bottle',
      'beer bottle', 'wine bottle', 'water bottle', 'milk can', 'tissue paper roll', 'binder', 'clipboard',
      'sunglasses', 'goggles', 'helmet', 'mat', 'rug', 'towel', 'cushion', 'pillow', 'thimble', 'ladle',
      'saltshaker', 'teapot', 'tumbler', 'coffee mug', 'beaker', 'petri dish', 'flowerpot', 'mailbag'],
    hazard: ['battery', 'paint', 'syringe', 'medicine', 'pill', 'tablet bottle', 'bulb', 'cfl', 'aerosol',
      'insecticide', 'pesticide', 'thermometer', 'bleach', 'solvent', 'thinner', 'lighter', 'matchstick',
      'matchbox', 'nail polish', 'chemical', 'acid', 'fertilizer', 'spray', 'gas canister', 'fluorescent',
      'light bulb', 'torch', 'kerosene', 'varnish', 'turpentine', 'shampoo bottle', 'phial', 'vial',
      'pill bottle', 'hypodermic', 'ampoule', 'oil filter', 'brake fluid'],
    ewaste: ['phone', 'cellular telephone', 'cellphone', 'laptop', 'keyboard', 'mouse', 'monitor', 'screen',
      'cable', 'charger', 'remote control', 'remote', 'headphone', 'earphone', 'circuit', 'computer',
      'desktop computer', 'printer', 'scanner', 'modem', 'router', 'television', 'radio', 'camera',
      'loudspeaker', 'speaker', 'microwave', 'refrigerator', 'washer', 'electric fan', 'iron', 'mixer',
      'cd player', 'ipod', 'joystick', 'hard disc', 'floppy disk', 'motherboard', 'adapter', 'calculator',
      'digital watch', 'digital clock', 'tablet computer', 'projector', 'photocopier', 'cassette',
      'tape player', 'dial telephone', 'pay-phone', 'notebook computer', 'web site', 'switch', 'plug',
      'electric', 'oscilloscope', 'space heater', 'toaster', 'vacuum', 'sewing machine'],
    sanitary: ['diaper', 'nappy', 'napkin', 'mask', 'bandage', 'tissue', 'glove', 'cotton swab',
      'sanitary pad', 'wipe', 'condom', 'dressing', 'toilet tissue', 'handkerchief', 'band aid',
      'gauze', 'surgical mask', 'face mask', 'oxygen mask', 'ski mask', 'swab', 'cotton wool']
  };

  // Flatten into a longest-first lookup so "pill bottle" beats "bottle".
  var LOOKUP = [];
  BIN_ORDER.forEach(function (k) {
    KEYWORDS[k].forEach(function (word) { LOOKUP.push({ word: word, bin: k }); });
  });
  LOOKUP.sort(function (a, b) { return b.word.length - a.word.length; });
  var KEYWORD_COUNT = LOOKUP.length;

  function matchBin(label) {
    var text = String(label).toLowerCase();
    for (var i = 0; i < LOOKUP.length; i++) {
      if (text.indexOf(LOOKUP[i].word) !== -1) return LOOKUP[i];
    }
    return null;
  }

  /* ---------------------------------------------------------------- state */

  var WARD_BASE_SCANS = 214;

  var state = {
    credits: 0,
    streak: 0,
    scans: 0,
    firstTryCorrect: 0,
    corrections: [],
    redemptions: [],
    complaints: [],
    entries: [],
    sos: [],
    complaintSeq: 4,
    current: null,           // { item, bin, confidence, preds, imageUrl, corrected }
    modelState: 'loading'    // loading | ready | failed
  };

  var HOUSEHOLDS = [
    { name: 'Sai Nagar Colony, H-42', credits: 1480 },
    { name: 'Gandhi Nagar, Block C-7', credits: 1265 },
    { name: 'Patamata Lanka, H-19', credits: 1120 },
    { name: 'Bhavanipuram, H-63', credits: 980 },
    { name: 'Ramavarappadu Ring, H-8', credits: 845 },
    { name: 'Gunadala East, H-27', credits: 720 },
    { name: 'Kanuru Gardens, H-51', credits: 605 },
    { name: 'Payakapuram, H-12', credits: 470 }
  ];

  var REWARDS = [
    { id: 'r1', cost: 500, title: '₹100 property-tax rebate', sub: 'Credited to your next half-yearly demand notice' },
    { id: 'r2', cost: 1200, title: '₹300 water-bill waiver', sub: 'Adjusted by the ULB revenue section within 15 days' },
    { id: 'r3', cost: 2500, title: 'Home composting kit + ₹500 rebate', sub: '25-litre aerobic bin delivered by the ward sanitary inspector' }
  ];

  var ASSETS = [
    { id: 'BIN-14-032', name: 'Community bin — Sai Nagar Main Road', type: 'Community bin', sla: 24 },
    { id: 'PT-14-007', name: 'Public toilet — Gunadala Bus Stop', type: 'Public toilet', sla: 12 },
    { id: 'BIN-14-018', name: 'Community bin — Patamata Market Lane', type: 'Community bin', sla: 24 },
    { id: 'PT-11-003', name: 'Public toilet — Bhavanipuram Ghat', type: 'Public toilet', sla: 12 },
    { id: 'BIN-09-054', name: 'Community bin — Kanuru Junction', type: 'Community bin', sla: 24 },
    { id: 'PT-09-011', name: 'Public toilet — Ramavarappadu Ring Road', type: 'Public toilet', sla: 12 }
  ];

  var WARDS = [
    { name: 'Ward 14 · Gunadala', rate: 58, you: true },
    { name: 'Ward 09 · Kanuru', rate: 71 },
    { name: 'Ward 11 · Bhavanipuram', rate: 46 },
    { name: 'Ward 17 · Patamata', rate: 64 },
    { name: 'Ward 22 · Payakapuram', rate: 39 },
    { name: 'Ward 05 · Gandhi Nagar', rate: 77 },
    { name: 'Ward 28 · Ramavarappadu', rate: 52 },
    { name: 'Ward 31 · Nunna Road', rate: 61 }
  ];

  var HOTSPOTS = [
    { place: 'Sai Nagar Main Road, near culvert', reports: 9, note: 'Night dumping of construction debris' },
    { place: 'Patamata Market Lane, rear gate', reports: 7, note: 'Vegetable waste outside bin, 4 days running' },
    { place: 'Gunadala Bus Stop footpath', reports: 6, note: 'Mixed waste, sanitary items in green bin' },
    { place: 'Bhavanipuram Ghat steps', reports: 5, note: 'Plastic accumulation at the water line' },
    { place: 'Kanuru Junction service road', reports: 4, note: 'Overflowing bin, collection vehicle skipping stop' }
  ];

  var TREND = [44, 47, 46, 51, 49, 53, 55, 52, 57, 56, 59, 58, 60, 58];

  /* ---------------------------------------------------------------- toast */

  function toast(msg) {
    var host = $('toastHost');
    var t = el('div', 'toast', msg);
    host.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s';
      t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, 3200);
  }

  /* ---------------------------------------------------------------- theme */

  var SUN = '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/>';
  var MOON = '<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4z"/>';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    var btn = $('themeToggle');
    $('themeIcon').innerHTML = theme === 'dark' ? SUN : MOON;
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (chart) {
      styleChart();
      chart.update('none');
    }
  }
  $('themeToggle').addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  /* ---------------------------------------------------------------- tabs */

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.tab'));

  function showView(name) {
    tabs.forEach(function (t) {
      var on = t.dataset.view === name;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      $('view-' + t.dataset.view).hidden = !on;
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (name === 'ward') ensureChart();
    if (name === 'trucks') ensureTruckSim();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { showView(t.dataset.view); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(i + d + tabs.length) % tabs.length];
      next.focus();
      showView(next.dataset.view);
    });
  });
  $('brandLink').addEventListener('click', function (e) {
    e.preventDefault();
    tabs[0].focus();
    showView('scan');
  });

  /* ================================================== SCAN & SORT: camera */

  var video = $('video'), preview = $('preview'), stream = null;
  var work = $('workCanvas');

  function setStage(mode) {
    // mode: 'empty' | 'live' | 'image'
    video.hidden = mode !== 'live';
    preview.hidden = mode !== 'image';
    $('reticle').hidden = mode === 'empty';
    $('stageBadge').hidden = mode === 'empty';
    $('stagePlaceholder').hidden = mode !== 'empty';
    $('btnCapture').hidden = mode !== 'live';
    $('stageBadge').textContent = mode === 'live' ? 'Live camera' : 'Captured frame';
  }

  function cameraError(err) {
    var box = $('cameraMsg');
    box.hidden = false;
    box.className = 'cam-msg';
    box.innerHTML = '';
    var h = el('div');
    h.innerHTML = '<strong>Camera unavailable.</strong> ' +
      (err && err.name === 'NotAllowedError'
        ? 'Permission was denied for this page.'
        : 'No camera stream could be started here (embedded previews often block it).');
    box.appendChild(h);
    box.appendChild(el('div', null, 'Open this page in a new browser tab to grant camera access, or use "Upload photo" or a built-in sample — classification works identically either way.'));
  }

  $('btnCamera').addEventListener('click', async function () {
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
      setStage('empty');
      $('btnCamera').textContent = 'Start camera';
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      cameraError({ name: 'NotSupportedError' });
      return;
    }
    $('btnCamera').disabled = true;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      video.srcObject = stream;
      await video.play();
      $('cameraMsg').hidden = true;
      setStage('live');
      $('btnCamera').textContent = 'Stop camera';
    } catch (err) {
      stream = null;
      cameraError(err);
    } finally {
      $('btnCamera').disabled = false;
    }
  });

  $('btnCapture').addEventListener('click', function () {
    var w = video.videoWidth || 640, h = video.videoHeight || 480;
    var c = document.createElement('canvas');
    var side = Math.min(w, h);
    c.width = 480; c.height = 360;
    c.getContext('2d').drawImage(video, (w - side) / 2, (h - side * 0.75) / 2, side, side * 0.75, 0, 0, 480, 360);
    var url = c.toDataURL('image/jpeg', 0.85);
    loadImageAndClassify(url, 'Camera capture');
  });

  $('fileInput').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) return;
    var r = new FileReader();
    r.onload = function () { loadImageAndClassify(r.result, f.name.replace(/\.[a-z0-9]+$/i, '')); };
    r.readAsDataURL(f);
    e.target.value = '';
  });

  /* ------------------------------------------------------------- samples */

  var SAMPLES = [
    { file: 'samples/banana.jpg', label: 'Banana peel' },
    { file: 'samples/bottle.jpg', label: 'Plastic bottle' },
    { file: 'samples/paper.jpg', label: 'Newspaper & carton' },
    { file: 'samples/syringe.jpg', label: 'Syringe & pills' },
    { file: 'samples/ewaste.jpg', label: 'Keyboard & cable' },
    { file: 'samples/mask.jpg', label: 'Used face mask' },
    { file: 'samples/battery.jpg', label: 'Dry cells (hard case)' }
  ];

  (function buildSamples() {
    var grid = $('sampleGrid');
    SAMPLES.forEach(function (s) {
      var b = el('button', 'sample');
      b.type = 'button';
      var img = el('img');
      img.src = s.file;
      img.alt = s.label;
      img.loading = 'lazy';
      b.appendChild(img);
      b.appendChild(el('span', null, s.label));
      b.addEventListener('click', function () { loadImageAndClassify(s.file, s.label); });
      grid.appendChild(b);
    });
  })();

  $('btnSamples').addEventListener('click', function () {
    var tray = $('sampleTray');
    tray.hidden = !tray.hidden;
    this.setAttribute('aria-expanded', tray.hidden ? 'false' : 'true');
  });

  /* ------------------------------------------------------ model + verdict */

  var model = null;

  function setModelStatus(text, hint) {
    $('modelStatus').textContent = text;
    $('modelStatusHint').textContent = hint ? ' ' + hint : '';
  }

  async function loadModel() {
    setModelStatus('downloading MobileNet from CDN…', 'Around 4 MB, one time.');
    if (typeof mobilenet === 'undefined' || typeof tf === 'undefined') {
      state.modelState = 'failed';
      setModelStatus('unavailable — keyword mode active.',
        'The CDN could not be reached. Capture still works: pick the bin yourself from the category buttons and BinCoach records it.');
      return;
    }
    try {
      model = await mobilenet.load({ version: 2, alpha: 1.0 });
      state.modelState = 'ready';
      setModelStatus('MobileNet v2 ready, running on-device.',
        KEYWORD_COUNT + ' keyword rules map ImageNet labels to the five statutory bins.');
    } catch (err) {
      state.modelState = 'failed';
      setModelStatus('failed to load — keyword mode active.',
        'Capture still works: pick the bin yourself from the category buttons and BinCoach records it.');
    }
  }

  function showSkeleton(on) {
    $('resultEmpty').hidden = true;
    $('resultSkeleton').hidden = !on;
    $('resultBody').hidden = on;
  }

  function loadImageAndClassify(url, name) {
    if (stream) {
      stream.getTracks().forEach(function (t) { t.stop(); });
      stream = null;
      $('btnCamera').textContent = 'Start camera';
    }
    preview.crossOrigin = 'anonymous';
    preview.src = url;
    setStage('image');
    showSkeleton(true);

    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () { classify(img, name, url); };
    img.onerror = function () {
      showSkeleton(false);
      renderVerdict({ item: name, bin: null, confidence: 0, preds: [], imageUrl: url, reason: 'image-error' });
      toast('That image could not be read. Try another file.');
    };
    img.src = url;
  }

  async function classify(img, name, url) {
    var ctx = work.getContext('2d');
    ctx.drawImage(img, 0, 0, work.width, work.height);

    if (state.modelState === 'loading') {
      // wait for the in-flight load before giving up
      var waited = 0;
      while (state.modelState === 'loading' && waited < 20000) {
        await new Promise(function (r) { setTimeout(r, 250); });
        waited += 250;
      }
    }

    if (state.modelState !== 'ready' || !model) {
      showSkeleton(false);
      renderVerdict({ item: name, bin: null, confidence: 0, preds: [], imageUrl: url, reason: 'no-model' });
      return;
    }

    var preds = [];
    try {
      preds = await model.classify(work, 3);
    } catch (err) {
      showSkeleton(false);
      renderVerdict({ item: name, bin: null, confidence: 0, preds: [], imageUrl: url, reason: 'infer-error' });
      toast('Classification failed on this image. Pick the bin manually.');
      return;
    }

    var hit = null, hitPred = null;
    for (var i = 0; i < preds.length && !hit; i++) {
      var parts = preds[i].className.split(/\s*,\s*/);
      for (var j = 0; j < parts.length && !hit; j++) {
        var m = matchBin(parts[j]);
        if (m) { hit = m; hitPred = preds[i]; }
      }
    }

    showSkeleton(false);
    renderVerdict({
      item: hitPred ? hitPred.className.split(/\s*,\s*/)[0] : (preds[0] ? preds[0].className.split(/\s*,\s*/)[0] : name),
      bin: hit ? hit.bin : null,
      matchedWord: hit ? hit.word : null,
      confidence: hitPred ? hitPred.probability : (preds[0] ? preds[0].probability : 0),
      preds: preds,
      imageUrl: url,
      reason: hit ? 'ok' : 'no-match'
    });
  }

  function titleCase(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function renderVerdict(res) {
    state.current = {
      item: res.item, bin: res.bin, confidence: res.confidence,
      preds: res.preds, imageUrl: res.imageUrl, corrected: false, reason: res.reason,
      matchedWord: res.matchedWord || null
    };
    $('resultEmpty').hidden = true;
    $('resultSkeleton').hidden = true;
    $('resultBody').hidden = false;

    paintVerdict();

    // raw predictions
    var g = $('guesses');
    g.innerHTML = '';
    if (res.preds && res.preds.length) {
      res.preds.forEach(function (p) {
        var row = el('div', 'guess');
        row.appendChild(el('span', null, p.className));
        row.appendChild(el('span', 'num', (p.probability * 100).toFixed(1) + '%'));
        g.appendChild(row);
      });
    } else {
      var note = el('div', 'guess');
      note.appendChild(el('span', null, state.modelState === 'ready'
        ? 'No prediction returned for this image.'
        : 'Model not loaded — no raw predictions available in keyword mode.'));
      g.appendChild(note);
    }

    $('correctLabel').textContent = res.bin ? 'Wrong bin? Tap the right one' : 'Tell BinCoach the right bin';
    $('btnConfirm').disabled = !res.bin;
    $('btnConfirm').textContent = res.bin ? 'Confirm & earn credits' : 'Pick a bin to continue';
    renderPills();
  }

  function paintVerdict() {
    var c = state.current;
    var bin = c.bin ? BINS[c.bin] : null;
    var dot = $('binDot');
    if (bin) {
      dot.style.background = bin.colour;
      dot.style.color = inkOn(bin.colour);
      dot.textContent = bin.letter;
      dot.style.border = '1px solid rgba(255,255,255,.25)';
      $('binName').textContent = bin.bin + ' — ' + bin.name;
      $('itemName').textContent = 'Detected: ' + titleCase(c.item) +
        (c.corrected ? ' · corrected by you'
          : c.matchedWord ? ' · matched rule "' + c.matchedWord + '"' : '');
      $('binWhy').textContent = bin.why;
    } else {
      dot.style.background = 'var(--surface)';
      dot.style.color = 'var(--text-muted)';
      dot.style.border = '1px dashed var(--border)';
      dot.textContent = '?';
      $('binName').textContent = 'Not confident enough to say';
      $('itemName').textContent = c.reason === 'no-model'
        ? 'Keyword mode — no on-device model available'
        : 'Detected: ' + titleCase(c.item || 'unknown item');
      $('binWhy').textContent = c.reason === 'no-model'
        ? 'BinCoach will not guess. Choose the correct stream below and the scan is still recorded.'
        : 'None of the model labels matched a bin rule, so BinCoach is not guessing. Choose the correct stream below — your answer is kept as training data.';
    }
    var pct = Math.round((c.confidence || 0) * 100);
    $('confValue').textContent = c.bin ? pct + '%' : '—';
    $('confFill').style.width = (c.bin ? pct : 0) + '%';
    $('confFill').style.background = pct >= 55 ? 'var(--primary)' : 'var(--accent)';
  }

  function renderPills() {
    var host = $('categoryPills');
    host.innerHTML = '';
    BIN_ORDER.forEach(function (k) {
      var b = BINS[k];
      var p = el('button', 'pill');
      p.type = 'button';
      p.setAttribute('aria-pressed', state.current && state.current.bin === k ? 'true' : 'false');
      var sw = el('span', 'pill__swatch');
      sw.style.background = b.colour;
      p.appendChild(sw);
      p.appendChild(el('span', null, b.colourName + ' · ' + b.name));
      p.addEventListener('click', function () {
        if (!state.current) return;
        var wasWrong = state.current.bin !== k;
        state.current.bin = k;
        state.current.corrected = wasWrong;
        if (wasWrong) {
          state.corrections.push({ item: state.current.item, bin: k, at: Date.now() });
          renderContrib();
        }
        paintVerdict();
        renderPills();
        $('btnConfirm').disabled = false;
        $('btnConfirm').textContent = 'Confirm & earn credits';
      });
      host.appendChild(p);
    });
  }

  function renderContrib() {
    var n = state.corrections.length;
    if (!n) {
      $('contribText').textContent = 'No corrections yet. When you correct a bin, that label is queued as anonymised training data to improve the next model version.';
      return;
    }
    var last = state.corrections.slice(-3).reverse().map(function (c) {
      return titleCase(c.item) + ' → ' + BINS[c.bin].colourName;
    });
    $('contribText').textContent = n + ' labelled example' + (n === 1 ? '' : 's') +
      ' queued for the next training run. Most recent: ' + last.join('; ') + '.';
  }

  $('btnConfirm').addEventListener('click', function () {
    var c = state.current;
    if (!c || !c.bin) { toast('Pick a bin first.'); return; }
    state.scans += 1;
    if (!c.corrected) state.firstTryCorrect += 1;
    state.streak = Math.min(30, 1 + Math.floor(state.scans / 3));
    var award = state.streak >= 3 ? 15 : 10;
    state.credits += award;
    toast('+' + award + ' Green Credits — ' + BINS[c.bin].bin +
      (state.streak >= 3 ? ' (streak bonus applied)' : ''));
    $('btnConfirm').disabled = true;
    $('btnConfirm').textContent = 'Recorded — scan the next item';
    renderAll();
  });

  /* -------------------------------------------------------- bin guide grid */

  (function buildGuide() {
    var host = $('binGuide');
    BIN_ORDER.forEach(function (k) {
      var b = BINS[k];
      var card = el('div', 'card bin-card');
      var top = el('div', 'bin-card__top');
      var dot = el('span', 'bin-dot', b.letter);
      dot.style.background = b.colour;
      dot.style.color = inkOn(b.colour);
      top.appendChild(dot);
      var t = el('div');
      t.appendChild(el('div', 'bin-card__name', b.name));
      t.appendChild(el('div', 'bin-card__colour', b.bin));
      top.appendChild(t);
      card.appendChild(top);
      var ul = el('ul');
      b.examples.forEach(function (x) { ul.appendChild(el('li', null, x)); });
      card.appendChild(ul);
      host.appendChild(card);
    });
  })();

  /* ================================================== GREEN CREDITS */

  function accuracy() {
    if (!state.scans) return null;
    return Math.round((state.firstTryCorrect / state.scans) * 100);
  }

  function renderCredits() {
    $('creditChipValue').textContent = state.credits;
    $('kpiCredits').textContent = state.credits;
    $('kpiStreak').textContent = state.streak;
    $('kpiScans').textContent = state.scans;
    $('kpiCreditsDelta').textContent = state.scans
      ? 'Earned across ' + state.scans + ' confirmed scan' + (state.scans === 1 ? '' : 's')
      : 'Scan an item to start earning';
    var a = accuracy();
    $('kpiAccuracy').textContent = a === null ? '—' : a + '%';
    $('kpiAccuracyNote').textContent = a === null
      ? 'No scans recorded'
      : state.firstTryCorrect + ' of ' + state.scans + ' binned right first time';
    $('kpiScansNote').textContent = state.corrections.length
      ? state.corrections.length + ' correction' + (state.corrections.length === 1 ? '' : 's') + ' contributed'
      : 'Lifetime confirmed scans';

    // leaderboard
    var list = HOUSEHOLDS.map(function (h) { return { name: h.name, credits: h.credits, you: false }; });
    list.push({ name: 'Your household · Gunadala East, H-27B', credits: state.credits, you: true });
    list.sort(function (a2, b2) { return b2.credits - a2.credits; });
    var host = $('leaderboard');
    host.innerHTML = '';
    list.forEach(function (h, i) {
      var r = el('div', 'row' + (h.you ? ' row--you' : ''));
      r.appendChild(el('span', 'row__rank', String(i + 1)));
      var main = el('div', 'row__main');
      main.appendChild(el('div', 'row__title', h.you ? 'You' : h.name));
      main.appendChild(el('div', 'row__sub', h.you ? h.name : 'Ward 14 household'));
      r.appendChild(main);
      var meta = el('span', 'row__meta num', h.credits.toLocaleString('en-IN'));
      r.appendChild(meta);
      host.appendChild(r);
    });

    // rewards
    var rh = $('rewards');
    rh.innerHTML = '';
    REWARDS.forEach(function (rw) {
      var r = el('div', 'row row--stack');
      var head = el('div', 'row__head');
      var left = el('div');
      left.appendChild(el('div', 'row__title', rw.title));
      left.appendChild(el('div', 'row__sub', rw.sub));
      head.appendChild(left);
      head.appendChild(el('span', 'reward__price num', rw.cost + ' cr'));
      r.appendChild(head);
      var act = el('div', 'row__actions');
      var btn = el('button', 'btn btn--primary btn--sm', 'Redeem');
      btn.type = 'button';
      var short = rw.cost - state.credits;
      if (short > 0) {
        btn.classList.remove('btn--primary');
        btn.classList.add('btn--ghost');
      }
      btn.addEventListener('click', function () {
        if (state.credits < rw.cost) {
          toast('Need ' + (rw.cost - state.credits) + ' more credits for this tier.');
          return;
        }
        state.credits -= rw.cost;
        state.redemptions.push({ title: rw.title, cost: rw.cost, at: new Date() });
        toast('Redeemed: ' + rw.title + '. ' + rw.cost + ' credits deducted.');
        renderAll();
      });
      act.appendChild(btn);
      act.appendChild(el('span', 'muted', short > 0 ? short + ' credits short' : 'Balance sufficient'));
      r.appendChild(act);
      rh.appendChild(r);
    });

    var redh = $('redemptions');
    redh.innerHTML = '';
    if (!state.redemptions.length) {
      redh.appendChild(el('p', 'muted', 'No redemptions yet.'));
    } else {
      var rows = el('div', 'rows');
      state.redemptions.slice().reverse().forEach(function (r) {
        var row = el('div', 'row');
        row.appendChild(el('span', 'row__rank', '✓'));
        var m = el('div', 'row__main');
        m.appendChild(el('div', 'row__title', r.title));
        m.appendChild(el('div', 'row__sub', 'Requested ' + r.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })));
        row.appendChild(m);
        row.appendChild(el('span', 'row__meta num', '−' + r.cost));
        rows.appendChild(row);
      });
      redh.appendChild(rows);
    }
  }

  /* ================================================== VERIFIED CLEAN */

  var STATUS = {
    open: { label: 'Open', cls: 'tag--open' },
    pending: { label: 'Awaiting verification', cls: 'tag--pending' },
    closed: { label: 'Closed', cls: 'tag--closed' }
  };

  function seedComplaints() {
    var now = Date.now(), H = 3600000;
    state.complaints = [
      {
        id: 'CMP-1041', assetId: 'BIN-14-032', rating: 2,
        note: 'Bin overflowing since Monday, waste spilling onto the footpath.',
        status: 'open', filed: now - 31 * H, slaHours: 24, beforePhoto: null, afterPhoto: null, escalation: 1
      },
      {
        id: 'CMP-1042', assetId: 'PT-14-007', rating: 1,
        note: 'No water supply, floor is flooded and unusable.',
        status: 'pending', filed: now - 7 * H, slaHours: 12, beforePhoto: null, afterPhoto: null, escalation: 0
      },
      {
        id: 'CMP-1043', assetId: 'BIN-09-054', rating: 4,
        note: 'Cleared by the crew the same evening; lid still missing.',
        status: 'closed', filed: now - 50 * H, slaHours: 24, beforePhoto: null, afterPhoto: null, escalation: 0,
        closedAt: now - 44 * H, verified: 'Photo pair differed by 34% — accepted'
      }
    ];
  }

  function assetById(id) {
    for (var i = 0; i < ASSETS.length; i++) if (ASSETS[i].id === id) return ASSETS[i];
    return { id: id, name: id, type: 'Asset', sla: 24 };
  }

  (function buildAssetSelects() {
    [$('assetSelect'), $('entryAsset')].forEach(function (sel) {
      ASSETS.forEach(function (a) {
        var o = el('option', null, a.id + ' · ' + a.name);
        o.value = a.id;
        sel.appendChild(o);
      });
    });
  })();

  var selectedAsset = ASSETS[0].id, rating = 0, beforeDataUrl = null;

  function paintAssetCard() {
    var a = assetById(selectedAsset);
    $('assetCard').hidden = false;
    $('assetTitle').textContent = a.id + ' — ' + a.name;
    $('assetMeta').textContent = a.type + ' · SLA ' + a.sla + ' h · Ward ' + a.id.split('-')[1];
  }
  $('assetSelect').addEventListener('change', function () {
    selectedAsset = this.value;
    paintAssetCard();
  });
  $('btnScanQR').addEventListener('click', function () {
    var pick = ASSETS[Math.floor(Math.random() * ASSETS.length)];
    selectedAsset = pick.id;
    $('assetSelect').value = pick.id;
    paintAssetCard();
    toast('QR decoded: ' + pick.id);
  });

  (function buildStars() {
    var host = $('stars');
    for (var i = 1; i <= 5; i++) {
      (function (v) {
        var b = el('button', 'star');
        b.type = 'button';
        b.setAttribute('role', 'radio');
        b.setAttribute('aria-checked', 'false');
        b.setAttribute('aria-label', v + ' star' + (v === 1 ? '' : 's'));
        b.dataset.value = String(v);
        b.dataset.on = 'false';
        b.innerHTML = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.5l6-.8z"/></svg>';
        b.addEventListener('click', function () { setRating(v); });
        host.appendChild(b);
      })(i);
    }
  })();

  var RATING_TEXT = ['Tap a star from 1 (filthy) to 5 (spotless).',
    'Unusable — needs same-day intervention.', 'Poor — repeat complaint territory.',
    'Passable but needs a proper wash.', 'Clean, minor issues only.', 'Spotless — log it as a good example.'];

  function setRating(v) {
    rating = v;
    Array.prototype.forEach.call($('stars').children, function (b) {
      var on = Number(b.dataset.value) <= v;
      b.dataset.on = on ? 'true' : 'false';
      b.setAttribute('aria-checked', Number(b.dataset.value) === v ? 'true' : 'false');
    });
    $('ratingHint').textContent = RATING_TEXT[v];
  }

  $('beforePhoto').addEventListener('change', function (e) {
    var f = e.target.files && e.target.files[0];
    if (!f) { beforeDataUrl = null; $('beforePreviewWrap').hidden = true; return; }
    var r = new FileReader();
    r.onload = function () {
      beforeDataUrl = r.result;
      $('beforePreview').src = beforeDataUrl;
      $('beforePreviewWrap').hidden = false;
    };
    r.readAsDataURL(f);
  });

  $('btnFileComplaint').addEventListener('click', function () {
    if (!rating) { toast('Give a cleanliness rating first.'); return; }
    var a = assetById(selectedAsset);
    var id = 'CMP-' + (1043 + state.complaintSeq);
    state.complaintSeq += 1;
    state.complaints.unshift({
      id: id, assetId: a.id, rating: rating,
      note: $('complaintNote').value.trim() || 'No additional note provided.',
      status: 'open', filed: Date.now(), slaHours: a.sla,
      beforePhoto: beforeDataUrl, afterPhoto: null, escalation: 0
    });
    toast(id + ' filed against ' + a.id + '. SLA clock started at ' + a.sla + ' h.');
    rating = 0;
    setRating(0);
    $('ratingHint').textContent = RATING_TEXT[0];
    $('complaintNote').value = '';
    beforeDataUrl = null;
    $('beforePhoto').value = '';
    $('beforePreviewWrap').hidden = true;
    renderAll();
  });

  function slaInfo(c) {
    var dueAt = c.filed + c.slaHours * 3600000;
    var remaining = dueAt - Date.now();
    var breached = remaining < 0 && c.status !== 'closed';
    var level = 0;
    if (remaining < 0) level = Math.min(3, 1 + Math.floor(Math.abs(remaining) / (c.slaHours * 3600000)));
    if (c.status !== 'closed') c.escalation = level;
    var abs = Math.abs(remaining);
    var h = Math.floor(abs / 3600000);
    var m = Math.floor((abs % 3600000) / 60000);
    var s = Math.floor((abs % 60000) / 1000);
    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    return {
      breached: breached,
      level: level,
      text: c.status === 'closed'
        ? 'SLA closed'
        : (remaining < 0 ? 'Overdue ' : 'Due in ') + h + 'h ' + pad(m) + 'm ' + pad(s) + 's',
      warn: !breached && remaining < 3 * 3600000
    };
  }

  /* --- prototype closure verification: histogram difference on canvas --- */

  function hist(img) {
    var c = document.createElement('canvas');
    c.width = 48; c.height = 48;
    var ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, 48, 48);
    var d = ctx.getImageData(0, 0, 48, 48).data;
    var bins = new Float64Array(48); // 16 buckets x 3 channels
    for (var i = 0; i < d.length; i += 4) {
      bins[Math.floor(d[i] / 16)] += 1;
      bins[16 + Math.floor(d[i + 1] / 16)] += 1;
      bins[32 + Math.floor(d[i + 2] / 16)] += 1;
    }
    var total = (48 * 48) * 3;
    for (var j = 0; j < bins.length; j++) bins[j] /= total;
    return bins;
  }

  function similarity(a, b) {
    // histogram intersection: 1.0 = identical distributions
    var s = 0;
    for (var i = 0; i < a.length; i++) s += Math.min(a[i], b[i]);
    return s;
  }

  function loadImg(src) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.crossOrigin = 'anonymous';
      im.onload = function () { res(im); };
      im.onerror = rej;
      im.src = src;
    });
  }

  async function attemptClose(c, dataUrl) {
    if (!dataUrl) { toast('An "after" photo is required before a complaint can be closed.'); return; }
    if (!c.beforePhoto) {
      c.afterPhoto = dataUrl;
      c.status = 'closed';
      c.closedAt = Date.now();
      c.verified = 'No before photo on record — after photo accepted and flagged for spot audit';
      toast(c.id + ' closed. No before photo existed, so it is flagged for a spot audit.');
      renderAll();
      return;
    }
    try {
      var pair = await Promise.all([loadImg(c.beforePhoto), loadImg(dataUrl)]);
      var sim = similarity(hist(pair[0]), hist(pair[1]));
      var pct = Math.round(sim * 100);
      if (sim > 0.92) {
        c.verified = null;
        toast('Closure rejected: after photo is ' + pct + '% identical to the before photo.');
        renderAll();
        return;
      }
      c.afterPhoto = dataUrl;
      c.status = 'closed';
      c.closedAt = Date.now();
      c.verified = 'Photo pair differed by ' + (100 - pct) + '% — accepted';
      toast(c.id + ' closed. Photo pair differed by ' + (100 - pct) + '%.');
      renderAll();
    } catch (err) {
      toast('Could not read one of the photos. Try a different image.');
    }
  }

  function complaintCard(c, officer) {
    var a = assetById(c.assetId);
    var info = slaInfo(c);
    var r = el('div', 'row row--stack');
    r.dataset.complaint = c.id;

    var head = el('div', 'row__head');
    var left = el('div');
    left.appendChild(el('div', 'row__title', c.id + ' · ' + a.id));
    left.appendChild(el('div', 'row__sub', a.name));
    head.appendChild(left);
    var tags = el('div', 'row__tags');
    var st = el('span', 'tag ' + STATUS[c.status].cls, STATUS[c.status].label);
    tags.appendChild(st);
    if (c.escalation > 0 && c.status !== 'closed') {
      tags.appendChild(el('span', 'tag tag--open', 'Escalation L' + c.escalation));
    }
    tags.appendChild(el('span', 'tag', c.rating + '/5 clean'));
    head.appendChild(tags);
    r.appendChild(head);

    r.appendChild(el('div', 'row__body', c.note));

    var meta = el('div', 'row__head');
    var sla = el('span', 'sla' + (info.breached ? ' sla--breach' : info.warn ? ' sla--warn' : ''), info.text);
    sla.dataset.sla = c.id;
    meta.appendChild(sla);
    meta.appendChild(el('span', 'muted', 'Filed ' + new Date(c.filed).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })));
    r.appendChild(meta);

    if (c.beforePhoto || c.afterPhoto) {
      var th = el('div', 'thumbs');
      [['beforePhoto', 'Before'], ['afterPhoto', 'After']].forEach(function (p) {
        if (!c[p[0]]) return;
        var fig = el('figure');
        var im = el('img');
        im.src = c[p[0]];
        im.alt = p[1] + ' photo for ' + c.id;
        fig.appendChild(im);
        fig.appendChild(el('figcaption', null, p[1]));
        th.appendChild(fig);
      });
      r.appendChild(th);
    }

    if (c.verified) r.appendChild(el('div', 'note', 'Prototype verification — v2 uses a trained model. ' + c.verified));

    var act = el('div', 'row__actions');
    if (officer) {
      if (c.status === 'open') {
        var req = el('button', 'btn btn--ghost btn--sm', 'Request verification');
        req.type = 'button';
        req.addEventListener('click', function () {
          c.status = 'pending';
          toast(c.id + ' moved to awaiting verification. Field crew notified.');
          renderAll();
        });
        act.appendChild(req);
      } else if (c.status === 'pending') {
        act.appendChild(el('span', 'muted', 'Waiting on the crew to upload an after photo in the citizen tab.'));
      } else {
        act.appendChild(el('span', 'muted', 'Closed with photo verification.'));
      }
    } else if (c.status !== 'closed') {
      var inputId = 'after-' + c.id;
      var lab = el('label', 'btn btn--primary btn--sm', 'Upload after photo & close');
      lab.setAttribute('for', inputId);
      var inp = el('input', 'sr');
      inp.type = 'file';
      inp.id = inputId;
      inp.accept = 'image/*';
      inp.addEventListener('change', function (e) {
        var f = e.target.files && e.target.files[0];
        if (!f) return;
        var rd = new FileReader();
        rd.onload = function () { attemptClose(c, rd.result); };
        rd.readAsDataURL(f);
        e.target.value = '';
      });
      act.appendChild(lab);
      act.appendChild(inp);
      var tryClose = el('button', 'btn btn--ghost btn--sm', 'Close without photo');
      tryClose.type = 'button';
      tryClose.addEventListener('click', function () { attemptClose(c, null); });
      act.appendChild(tryClose);
    } else {
      act.appendChild(el('span', 'muted', 'Closed ' + new Date(c.closedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })));
    }
    r.appendChild(act);
    return r;
  }

  function renderComplaints() {
    var host = $('complaintList');
    host.innerHTML = '';
    if (!state.complaints.length) {
      host.appendChild(el('div', 'empty', 'No complaints on record. File one from the panel on the left.'));
      return;
    }
    state.complaints.forEach(function (c) { host.appendChild(complaintCard(c, false)); });
  }

  function renderAssets() {
    var host = $('assetList');
    host.innerHTML = '';
    ASSETS.forEach(function (a) {
      var open = state.complaints.filter(function (c) { return c.assetId === a.id && c.status !== 'closed'; }).length;
      var rated = state.complaints.filter(function (c) { return c.assetId === a.id; });
      var avg = rated.length
        ? (rated.reduce(function (s, c) { return s + c.rating; }, 0) / rated.length).toFixed(1)
        : '—';
      var r = el('div', 'row');
      var dot = el('span', 'row__rank', a.type === 'Public toilet' ? 'PT' : 'CB');
      r.appendChild(dot);
      var m = el('div', 'row__main');
      m.appendChild(el('div', 'row__title', a.id));
      m.appendChild(el('div', 'row__sub', a.name + ' · SLA ' + a.sla + ' h'));
      r.appendChild(m);
      var right = el('div', 'row__tags');
      right.appendChild(el('span', 'tag', 'Avg ' + avg + '/5'));
      right.appendChild(el('span', 'tag ' + (open ? 'tag--open' : 'tag--closed'), open ? open + ' open' : 'Clear'));
      r.appendChild(right);
      host.appendChild(r);
    });
  }

  /* --------------------------------------------------- Safai Suraksha */

  $('btnSOS').addEventListener('click', function () {
    var lat = (16.5062 + (Math.random() - 0.5) * 0.02).toFixed(5);
    var lng = (80.6480 + (Math.random() - 0.5) * 0.02).toFixed(5);
    state.sos.unshift({ at: new Date(), lat: lat, lng: lng, id: 'SOS-' + (100 + state.sos.length + 1) });
    toast('SOS transmitted from ' + lat + ', ' + lng + '. Control room acknowledging.');
    renderSOS();
  });

  function renderSOS() {
    var host = $('sosLog');
    host.innerHTML = '';
    if (!state.sos.length) {
      host.appendChild(el('p', 'muted', 'No alerts raised in this session.'));
      return;
    }
    var rows = el('div', 'rows');
    state.sos.forEach(function (s) {
      var r = el('div', 'row');
      r.appendChild(el('span', 'row__rank', '!'));
      var m = el('div', 'row__main');
      m.appendChild(el('div', 'row__title', s.id + ' · acknowledged'));
      m.appendChild(el('div', 'row__sub', 'GPS ' + s.lat + ', ' + s.lng + ' · ' + s.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })));
      r.appendChild(m);
      r.appendChild(el('span', 'tag tag--pending', 'Response en route'));
      rows.appendChild(r);
    });
    host.appendChild(rows);
  }

  $('btnLogEntry').addEventListener('click', function () {
    var id = $('workerId').value.trim();
    if (!id) { toast('Worker ID is required for a hazardous-entry record.'); return; }
    var gas = $('gasCheck').value;
    state.entries.unshift({
      at: new Date(), worker: id, asset: $('entryAsset').value, gas: gas
    });
    $('workerId').value = '';
    toast(gas === 'yes'
      ? 'Entry logged for ' + id + ' with a cleared gas check.'
      : 'Entry logged for ' + id + ' and BLOCKED — no gas check on record.');
    renderEntries();
  });

  function renderEntries() {
    var body = $('entryBody');
    body.innerHTML = '';
    $('entryEmpty').hidden = state.entries.length > 0;
    $('entryTable').hidden = state.entries.length === 0;
    state.entries.forEach(function (e) {
      var tr = document.createElement('tr');
      [
        e.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        e.worker,
        e.asset
      ].forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      var tdG = document.createElement('td');
      tdG.appendChild(el('span', 'tag ' + (e.gas === 'yes' ? 'tag--closed' : 'tag--open'), e.gas === 'yes' ? 'Cleared' : 'Not done'));
      tr.appendChild(tdG);
      var tdS = document.createElement('td');
      tdS.appendChild(el('span', 'tag ' + (e.gas === 'yes' ? 'tag--closed' : 'tag--open'), e.gas === 'yes' ? 'Entry permitted' : 'Entry blocked'));
      tr.appendChild(tdS);
      body.appendChild(tr);
    });
  }

  /* ================================================== WARD COMMAND */

  function wardRates() {
    return WARDS.map(function (w) {
      if (!w.you) return { name: w.name, rate: w.rate, you: false };
      var lift = Math.min(20, state.scans * 2);
      var acc = accuracy();
      var live = w.rate + lift + (acc !== null ? Math.round((acc - 70) / 10) : 0);
      return { name: w.name, rate: Math.max(0, Math.min(99, live)), you: true };
    });
  }

  function renderWard() {
    var rates = wardRates();
    var avg = Math.round(rates.reduce(function (s, w) { return s + w.rate; }, 0) / rates.length);
    $('wKpiCompliance').textContent = avg + '%';
    $('wKpiComplianceNote').textContent = 'Target 60% · ' +
      rates.filter(function (w) { return w.rate >= 60; }).length + ' of 8 wards meeting it';
    $('wKpiComplianceNote').className = avg >= 60 ? 'kpi__delta' : 'kpi__delta kpi__delta--down';

    var scansToday = WARD_BASE_SCANS + state.scans;
    $('wKpiScans').textContent = scansToday.toLocaleString('en-IN');
    $('wKpiScansNote').textContent = state.scans
      ? 'Includes your ' + state.scans + ' scan' + (state.scans === 1 ? '' : 's') + ' just now'
      : 'Ward-wide, live';

    var open = state.complaints.filter(function (c) { return c.status !== 'closed'; });
    $('wKpiOpen').textContent = open.length;
    $('wKpiOpenNote').textContent = open.filter(function (c) { return c.status === 'pending'; }).length +
      ' awaiting verification';

    var breaches = open.filter(function (c) { return slaInfo(c).breached; });
    $('wKpiBreach').textContent = breaches.length;
    $('wKpiBreachNote').textContent = breaches.length
      ? 'Escalated to the zonal officer'
      : 'All open complaints inside SLA';
    $('wKpiBreachNote').className = breaches.length ? 'kpi__delta kpi__delta--down' : 'kpi__delta';

    // bars
    var bh = $('wardBars');
    bh.innerHTML = '';
    rates.slice().sort(function (a, b) { return b.rate - a.rate; }).forEach(function (w) {
      var row = el('div', 'bar-row');
      var top = el('div', 'bar-row__top');
      top.appendChild(el('span', 'bar-row__name', w.name + (w.you ? ' · your ward' : '')));
      top.appendChild(el('span', 'num', w.rate + '%'));
      row.appendChild(top);
      var track = el('div', 'bar-track');
      var fill = el('div', 'bar-fill');
      fill.style.width = w.rate + '%';
      fill.style.background = w.rate >= 60 ? 'var(--primary)' : 'var(--accent)';
      track.appendChild(fill);
      row.appendChild(track);
      bh.appendChild(row);
    });

    // hotspots
    var hh = $('hotspots');
    hh.innerHTML = '';
    HOTSPOTS.forEach(function (h, i) {
      var r = el('div', 'row');
      r.appendChild(el('span', 'row__rank', String(i + 1)));
      var m = el('div', 'row__main');
      m.appendChild(el('div', 'row__title', h.place));
      m.appendChild(el('div', 'row__sub', h.note));
      r.appendChild(m);
      r.appendChild(el('span', 'row__meta num', h.reports + ' rpts'));
      hh.appendChild(r);
    });

    // officer queue
    var q = $('officerQueue');
    q.innerHTML = '';
    var queue = state.complaints.filter(function (c) { return c.status !== 'closed'; });
    if (!queue.length) {
      q.appendChild(el('div', 'empty', 'Queue is clear. Every complaint has been closed with photo verification.'));
    } else {
      queue.forEach(function (c) { q.appendChild(complaintCard(c, true)); });
    }

    updateChart(rates[0].rate);
  }

  /* ------------------------------------------------------------- chart */

  var chart = null;

  function themeColour(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  }

  function styleChart() {
    if (!chart) return;
    var grid = themeColour('--border');
    var text = themeColour('--text-muted');
    var primary = themeColour('--primary');
    chart.data.datasets[0].borderColor = primary;
    chart.data.datasets[0].pointBackgroundColor = primary;
    chart.data.datasets[0].backgroundColor = themeColour('--primary-soft');
    chart.options.scales.x.grid.color = grid;
    chart.options.scales.y.grid.color = grid;
    chart.options.scales.x.ticks.color = text;
    chart.options.scales.y.ticks.color = text;
    chart.options.scales.y.border = { color: grid };
  }

  function ensureChart() {
    if (chart) { updateChart(wardRates()[0].rate); return; }
    if (typeof Chart === 'undefined') {
      $('trendChart').hidden = true;
      $('chartFallback').hidden = false;
      $('chartFallbackData').textContent = TREND.join('%, ') + '%';
      return;
    }
    var labels = [];
    var today = new Date();
    for (var i = 13; i >= 0; i--) {
      var d = new Date(today.getTime() - i * 86400000);
      labels.push(d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }));
    }
    chart = new Chart($('trendChart').getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Segregation rate (%)',
          data: TREND.slice(),
          fill: true,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 500 },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14, font: { size: 10 } } },
          y: {
            beginAtZero: false, suggestedMin: 30, suggestedMax: 90,
            ticks: { callback: function (v) { return v + '%'; }, font: { size: 10 } },
            grid: {}
          }
        }
      }
    });
    styleChart();
    chart.update('none');
  }

  function updateChart(latest) {
    if (!chart) return;
    var d = chart.data.datasets[0].data;
    if (d[d.length - 1] !== latest) {
      d[d.length - 1] = latest;
      chart.update();
    }
  }

  /* ---------------------------------------------------------------- ticker */

  function tickSLAs() {
    state.complaints.forEach(function (c) {
      var info = slaInfo(c);
      document.querySelectorAll('[data-sla="' + c.id + '"]').forEach(function (n) {
        n.textContent = info.text;
        n.className = 'sla' + (info.breached ? ' sla--breach' : info.warn ? ' sla--warn' : '');
      });
    });
  }

  /* ---------------------------------------------------------------- render */

  function renderAll() {
    renderCredits();
    renderComplaints();
    renderAssets();
    renderWard();
    renderContrib();
  }

  /* =============================================== TRUCK TRACKING (demo) */
  /* Fully client-side simulation: no server, no real GPS. Bin fill levels
     rise on a timer, crossing 100% raises an alert, an officer assigns an
     idle truck, and the truck's marker is animated toward the bin and back
     on the map below. Swap in real sensor/GPS feeds for production. */

  var TRUCK_MAP_W = 400, TRUCK_MAP_H = 220;

  var TRUCK_BIN_DEFS = [
    { id: 'B1', name: 'Sai Nagar Main Road', x: 60, y: 50 },
    { id: 'B2', name: 'Patamata Market Lane', x: 310, y: 40 },
    { id: 'B3', name: 'Gunadala Bus Stop', x: 340, y: 130 },
    { id: 'B4', name: 'Bhavanipuram Ghat', x: 90, y: 170 },
    { id: 'B5', name: 'Kanuru Junction', x: 210, y: 190 },
    { id: 'B6', name: 'Ramavarappadu Ring', x: 200, y: 90 }
  ];

  var TRUCK_DEFS = [
    { id: 'TRK-01', depotX: 20, depotY: 20 },
    { id: 'TRK-02', depotX: 20, depotY: 200 },
    { id: 'TRK-03', depotX: 380, depotY: 200 }
  ];

  var TRUCK_TICK_MS = 200;
  var TRUCK_LEG_TICKS = 45;     // ~9s per leg at 200ms/tick
  var TRUCK_COLLECT_TICKS = 10; // ~2s dwell time at the bin
  var truckSimStarted = false;
  var truckSeq = 1;

  function initTruckState() {
    state.tbins = TRUCK_BIN_DEFS.map(function (b) {
      return { id: b.id, name: b.name, x: b.x, y: b.y, fill: 15 + Math.floor(Math.random() * 30), status: 'normal' };
    });
    state.talerts = [];
    state.trucks = TRUCK_DEFS.map(function (t) {
      return {
        id: t.id, depotX: t.depotX, depotY: t.depotY, x: t.depotX, y: t.depotY,
        status: 'idle', assignedBinId: null, leg: null, ticks: 0
      };
    });
    state.tcollected = 0;
  }

  function tbinById(id) { return state.tbins.filter(function (b) { return b.id === id; })[0]; }
  function truckById(id) { return state.trucks.filter(function (t) { return t.id === id; })[0]; }

  function raiseTruckAlert(bin) {
    bin.status = 'full';
    bin.fill = 100;
    state.talerts.push({ id: 'AL-' + (100 + truckSeq++), binId: bin.id, at: new Date() });
  }

  function markBinFull(binId) {
    var bin = tbinById(binId);
    if (!bin || bin.status !== 'normal') return;
    raiseTruckAlert(bin);
    renderTruckAll();
  }

  function assignTruck(alertId, truckId) {
    var alertIdx = -1;
    for (var i = 0; i < state.talerts.length; i++) { if (state.talerts[i].id === alertId) { alertIdx = i; break; } }
    if (alertIdx === -1) return;
    var alert = state.talerts[alertIdx];
    var truck = truckById(truckId);
    var bin = tbinById(alert.binId);
    if (!truck || !bin || truck.status !== 'idle') return;

    state.talerts.splice(alertIdx, 1);
    bin.status = 'assigned';
    truck.status = 'enroute';
    truck.assignedBinId = bin.id;
    truck.leg = 'to-bin';
    truck.ticks = 0;
    toast(truck.id + ' dispatched to ' + bin.name + '.');
    renderTruckAll();
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function truckTick() {
    var moved = false;
    state.trucks.forEach(function (truck) {
      if (truck.status === 'enroute' || truck.status === 'returning') {
        moved = true;
        truck.ticks++;
        var t = Math.min(1, truck.ticks / TRUCK_LEG_TICKS);
        var bin = truck.assignedBinId ? tbinById(truck.assignedBinId) : null;
        if (truck.leg === 'to-bin' && bin) {
          truck.x = lerp(truck.depotX, bin.x, t);
          truck.y = lerp(truck.depotY, bin.y, t);
          if (t >= 1) { truck.status = 'collecting'; truck.ticks = 0; }
        } else if (truck.leg === 'to-depot') {
          var fromX = bin ? bin.x : truck.x, fromY = bin ? bin.y : truck.y;
          truck.x = lerp(fromX, truck.depotX, t);
          truck.y = lerp(fromY, truck.depotY, t);
          if (t >= 1) {
            truck.status = 'idle'; truck.assignedBinId = null; truck.leg = null; truck.ticks = 0;
            truck.x = truck.depotX; truck.y = truck.depotY;
          }
        }
      } else if (truck.status === 'collecting') {
        moved = true;
        truck.ticks++;
        if (truck.ticks >= TRUCK_COLLECT_TICKS) {
          var b = tbinById(truck.assignedBinId);
          if (b) { b.fill = 0; b.status = 'normal'; }
          state.tcollected++;
          truck.leg = 'to-depot';
          truck.ticks = 0;
          toast(truck.id + ' collected ' + (b ? b.name : 'bin') + '. Returning to base.');
        }
      }
    });

    // slow organic fill on unassigned bins, simulating sensor readings
    state.tbins.forEach(function (bin) {
      if (bin.status !== 'normal') return;
      if (Math.random() < 0.12) {
        bin.fill = Math.min(100, bin.fill + 2 + Math.floor(Math.random() * 6));
        if (bin.fill >= 100) raiseTruckAlert(bin);
      }
    });

    updateTruckMapPositions();
    if (moved || Math.random() < 0.12) renderTruckAll();
  }

  function ensureTruckSim() {
    if (truckSimStarted) return;
    truckSimStarted = true;
    initTruckState();
    buildTruckMapSkeleton();
    renderTruckAll();
    setInterval(truckTick, TRUCK_TICK_MS);
  }

  function statusTagClass(status) {
    if (status === 'full') return 'tag tag--open';
    if (status === 'assigned' || status === 'enroute' || status === 'collecting') return 'tag tag--pending';
    return 'tag tag--closed';
  }
  function statusLabel(status) {
    return { normal: 'Normal', full: 'Full — awaiting truck', assigned: 'Truck assigned',
      idle: 'Idle at depot', enroute: 'En route', collecting: 'Collecting', returning: 'Returning to base' }[status] || status;
  }

  function renderTruckKpis() {
    var full = state.tbins.filter(function (b) { return b.status === 'full'; }).length;
    var assignedOrMore = state.tbins.filter(function (b) { return b.status === 'full' || b.status === 'assigned'; }).length;
    var enroute = state.trucks.filter(function (t) { return t.status === 'enroute' || t.status === 'collecting'; }).length;
    $('tKpiFull').textContent = assignedOrMore;
    $('tKpiFullNote').textContent = assignedOrMore ? (full ? full + ' unassigned' : 'All assigned to a truck') : 'All bins normal';
    $('tKpiEnroute').textContent = enroute;
    $('tKpiAlerts').textContent = state.talerts.length;
    $('tKpiAlertsNote').textContent = state.talerts.length ? 'Needs officer action' : 'Nothing waiting';
    $('tKpiCollected').textContent = state.tcollected;
  }

  function renderTruckBinList() {
    var host = $('truckBinList');
    host.innerHTML = '';
    state.tbins.forEach(function (bin) {
      var row = el('div', 'bar-row');
      var top = el('div', 'bar-row__top');
      top.appendChild(el('span', 'bar-row__name', bin.name));
      top.appendChild(el('span', statusTagClass(bin.status), statusLabel(bin.status)));
      row.appendChild(top);
      var track = el('div', 'bar-track');
      var fill = el('div', 'bar-fill');
      fill.style.width = bin.fill + '%';
      fill.style.background = bin.fill >= 100 ? 'var(--danger)' : bin.fill >= 70 ? 'var(--accent)' : 'var(--primary)';
      track.appendChild(fill);
      row.appendChild(track);
      var metaRow = el('div', 'row__actions', null);
      metaRow.style.marginTop = 'var(--space-2)';
      metaRow.appendChild(el('span', 'muted num', bin.fill + '% full'));
      if (bin.status === 'normal') {
        var btn = el('button', 'btn btn--ghost btn--sm', 'Mark full');
        btn.type = 'button';
        btn.addEventListener('click', function () { markBinFull(bin.id); });
        metaRow.appendChild(btn);
      }
      row.appendChild(metaRow);
      host.appendChild(row);
    });
  }

  function renderTruckAlertList() {
    var host = $('truckAlertList');
    host.innerHTML = '';
    if (!state.talerts.length) { host.appendChild(el('p', 'muted', 'No pending alerts.')); return; }
    var idleTrucks = state.trucks.filter(function (t) { return t.status === 'idle'; });
    state.talerts.forEach(function (a) {
      var bin = tbinById(a.binId);
      var r = el('div', 'row row--stack');
      var head = el('div', 'row__head');
      var m = el('div', 'row__main');
      m.appendChild(el('div', 'row__title', a.id + ' · ' + (bin ? bin.name : a.binId)));
      m.appendChild(el('div', 'row__sub', 'Raised ' + a.at.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })));
      head.appendChild(m);
      head.appendChild(el('span', 'tag tag--open', 'Full'));
      r.appendChild(head);

      var actions = el('div', 'row__actions');
      if (idleTrucks.length) {
        var select = document.createElement('select');
        select.className = 'field';
        select.style.width = 'auto';
        idleTrucks.forEach(function (t) {
          var opt = document.createElement('option');
          opt.value = t.id; opt.textContent = t.id + ' (idle at depot)';
          select.appendChild(opt);
        });
        var assignBtn = el('button', 'btn btn--primary btn--sm', 'Assign truck');
        assignBtn.type = 'button';
        assignBtn.addEventListener('click', function () { assignTruck(a.id, select.value); });
        actions.appendChild(select);
        actions.appendChild(assignBtn);
      } else {
        actions.appendChild(el('span', 'muted', 'No idle truck available right now.'));
      }
      r.appendChild(actions);
      host.appendChild(r);
    });
  }

  function renderTruckFleetList() {
    var host = $('truckFleetList');
    host.innerHTML = '';
    state.trucks.forEach(function (t) {
      var bin = t.assignedBinId ? tbinById(t.assignedBinId) : null;
      var lat = (16.5062 + ((t.y / TRUCK_MAP_H) - 0.5) * 0.02).toFixed(5);
      var lng = (80.6480 + ((t.x / TRUCK_MAP_W) - 0.5) * 0.02).toFixed(5);
      var r = el('div', 'row');
      r.appendChild(el('span', 'row__rank', t.id.slice(-2)));
      var m = el('div', 'row__main');
      m.appendChild(el('div', 'row__title', t.id + (bin ? ' → ' + bin.name : '')));
      m.appendChild(el('div', 'row__sub', 'GPS ' + lat + ', ' + lng));
      r.appendChild(m);
      r.appendChild(el('span', statusTagClass(t.status), statusLabel(t.status)));
      host.appendChild(r);
    });
  }

  function renderTruckAll() {
    renderTruckKpis();
    renderTruckBinList();
    renderTruckAlertList();
    renderTruckFleetList();
  }

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function buildTruckMapSkeleton() {
    var host = $('truckMap');
    host.innerHTML = '';
    var svg = svgEl('svg', { viewBox: '0 0 ' + TRUCK_MAP_W + ' ' + TRUCK_MAP_H, class: 'truckmap__svg', role: 'img', 'aria-label': 'Live map of bin and truck locations' });
    svg.appendChild(svgEl('rect', { x: 2, y: 2, width: TRUCK_MAP_W - 4, height: TRUCK_MAP_H - 4, rx: 10, class: 'truckmap__bg' }));

    // depots
    state.trucks.forEach(function (t) {
      svg.appendChild(svgEl('rect', { x: t.depotX - 8, y: t.depotY - 8, width: 16, height: 16, rx: 3, class: 'truckmap__depot' }));
    });

    // bins
    state.tbins.forEach(function (bin) {
      var g = svgEl('g', { id: 'tbin-' + bin.id });
      g.appendChild(svgEl('circle', { cx: bin.x, cy: bin.y, r: 7, class: 'truckmap__bin', id: 'tbin-dot-' + bin.id }));
      var label = svgEl('text', { x: bin.x, y: bin.y - 12, class: 'truckmap__label', 'text-anchor': 'middle' });
      label.textContent = bin.name.split(' ')[0];
      g.appendChild(label);
      svg.appendChild(g);
    });

    // trucks (drawn last, on top)
    state.trucks.forEach(function (t) {
      var g = svgEl('g', { id: 'ttruck-' + t.id });
      g.appendChild(svgEl('circle', { cx: t.x, cy: t.y, r: 6, class: 'truckmap__truck', id: 'ttruck-dot-' + t.id }));
      var label = svgEl('text', { x: t.x, y: t.y - 10, class: 'truckmap__label truckmap__label--truck', id: 'ttruck-label-' + t.id, 'text-anchor': 'middle' });
      label.textContent = t.id;
      g.appendChild(label);
      svg.appendChild(g);
    });

    host.appendChild(svg);
  }

  function updateTruckMapPositions() {
    state.tbins.forEach(function (bin) {
      var dot = document.getElementById('tbin-dot-' + bin.id);
      if (!dot) return;
      dot.setAttribute('class', 'truckmap__bin truckmap__bin--' + bin.status);
    });
    state.trucks.forEach(function (t) {
      var dot = document.getElementById('ttruck-dot-' + t.id);
      var label = document.getElementById('ttruck-label-' + t.id);
      if (!dot) return;
      dot.setAttribute('cx', t.x);
      dot.setAttribute('cy', t.y);
      dot.setAttribute('class', 'truckmap__truck truckmap__truck--' + t.status);
      if (label) { label.setAttribute('x', t.x); label.setAttribute('y', t.y - 10); }
    });
  }

  /* ---------------------------------------------------------------- init */

  applyTheme('light');
  setStage('empty');
  seedComplaints();
  paintAssetCard();
  setRating(0);
  renderSOS();
  renderEntries();
  renderAll();
  setInterval(tickSLAs, 1000);
  setInterval(function () {
    // escalation levels can change without a click; keep the officer view honest
    if (!$('view-ward').hidden) renderWard();
  }, 30000);
  loadModel();
  window.__bincoach = { state: state, keywordCount: KEYWORD_COUNT };
})();
