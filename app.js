const $ = id => document.getElementById(id);
const labels = {
  landscape: {dry: 'Dry and sparse', mixed: 'Mixed condition', saturated: 'Already saturated'},
  weather: {dry: 'Prolonged dry weather', variable: 'Variable rainfall', intense: 'Intense rainfall'},
  intervention: {none: 'No new action', planting: 'Fictional revegetation', maintained: 'Creek structures, maintained', neglected: 'Creek structures, poor maintenance'}
};
const metrics = {vegetation: 'Local vegetation response', runoff: 'Surface runoff pressure', groundwater: 'Delayed groundwater response', salinity: 'Illustrative salinity concern'};
let view = 'surface';
let revealed = false;
let guideStep = -1;
const guide = [
  {title: 'Step 1 of 4: the apparent success', text: 'The year-one toy result gives the selected intervention a greener creek corridor and less surface runoff pressure than no new action. This is an invented early effect. It says little about later or wider consequences.', year: 1, landscape: 'mixed', weather: 'variable', intervention: 'maintained', view: 'surface', reveal: false},
  {title: 'Step 2 of 4: the longer horizon', text: 'Move the same scenario to year twenty. The models now separate more visibly because they assume different below-ground connections and delays. Look at their trajectories and the no-action comparison.', year: 20, landscape: 'mixed', weather: 'variable', intervention: 'maintained', view: 'surface', reveal: false},
  {title: 'Step 3 of 4: the wider system', text: 'The wider view includes a downstream receptor, a delayed pathway and an unrepresented sediment process. Our drawn boundary cannot prove that every consequence is inside it.', year: 20, landscape: 'mixed', weather: 'variable', intervention: 'maintained', view: 'combined', reveal: true},
  {title: 'Step 4 of 4: insufficient evidence', text: 'Now use a saturated landscape, intense rainfall, poor maintenance and forty years. Missing processes become material in this deliberately designed stress example. The refusal is an intended result. It does not mean the software has failed.', year: 40, landscape: 'saturated', weather: 'intense', intervention: 'neglected', view: 'combined', reveal: true}
];
function scenario() {
  return {landscape: $('landscape').value, weather: $('weather').value, intervention: $('intervention').value, year: Number($('year').value)};
}
function addCell(row, text, heading = false) {
  const cell = document.createElement(heading ? 'th' : 'td');
  if (heading) cell.scope = 'row';
  cell.textContent = text;
  row.append(cell);
}
function svgElement(name, attrs, text) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
  if (text !== undefined) element.textContent = text;
  return element;
}
function renderChart(s) {
  const group = $('chart-lines'); group.replaceChildren();
  for (let n = 0; n <= 100; n += 25) {
    const y = 250 - n * 2;
    group.append(svgElement('line', {x1: 68, x2: 758, y1: y, y2: y, stroke: '#d7d4bf'}));
    group.append(svgElement('text', {x: 22, y: y + 5, 'font-size': 14}, String(n)));
  }
  group.append(svgElement('text', {x: 68, y: 24, 'font-size': 14}, 'Illustrative salinity concern · toy index'));
  horizons.forEach((year, i) => {
    const x = 80 + i * 220;
    group.append(svgElement('text', {x: x - 20, y: 282, 'font-size': 14}, 'Year ' + year));
  });
  ['A', 'B'].forEach(name => {
    const color = name === 'A' ? '#14575a' : '#734d7d';
    const points = horizons.map((year, i) => [80 + i * 220, 250 - toyResult(s, name, s.intervention, year).salinity * 2]);
    group.append(svgElement('polyline', {points: points.map(p => p.join(',')).join(' '), fill: 'none', stroke: color, 'stroke-width': 4, 'stroke-dasharray': name === 'A' ? 'none' : '9 6'}));
    points.forEach(([cx, cy]) => group.append(svgElement('circle', {cx, cy, r: name === 'A' ? 5 : 3, fill: color})));
  });
  $('trajectory-values').replaceChildren();
  horizons.forEach(year => {
    const row = document.createElement('tr');
    addCell(row, 'Year ' + year, true);
    addCell(row, toyResult(s, 'A', s.intervention, year).salinity);
    addCell(row, toyResult(s, 'B', s.intervention, year).salinity);
    $('trajectory-values').append(row);
  });
}
function render() {
  const s = scenario();
  const a = toyResult(s, 'A'), b = toyResult(s, 'B');
  const noA = toyResult(s, 'A', 'none'), noB = toyResult(s, 'B', 'none');
  $('scenario-caption').textContent = labels.landscape[s.landscape] + ' · ' + labels.weather[s.weather] + ' · Year ' + s.year;
  $('catchment').setAttribute('viewBox', view === 'surface' ? '0 0 960 320' : view === 'below' ? '0 290 960 210' : '0 0 960 500');
  $('surface-layer').toggleAttribute('hidden', view === 'below');
  $('below-layer').toggleAttribute('hidden', view === 'surface');
  $('surface-domain').toggleAttribute('hidden', !revealed || view === 'below');
  $('subsurface-domain').toggleAttribute('hidden', !revealed || view === 'surface');
  $('surface-layer').setAttribute('display', view === 'below' ? 'none' : 'inline');
  $('below-layer').setAttribute('display', view === 'surface' ? 'none' : 'inline');
  $('surface-domain').setAttribute('display', !revealed || view === 'below' ? 'none' : 'inline');
  $('subsurface-domain').setAttribute('display', !revealed || view === 'surface' ? 'none' : 'inline');
  const green = a.vegetation >= 55 ? '#68946a' : a.vegetation >= 35 ? '#91aa78' : '#b7b68b';
  $('creek-green').setAttribute('stroke', green);
  ['surface', 'combined', 'below'].forEach(name => $('view-' + name).setAttribute('aria-pressed', String(view === name)));
  $('map-text').textContent = (view === 'surface' ? 'Surface view shows the corridor and intervention footprint. The below-ground layer is hidden.' : view === 'below' ? 'Below-ground view shows invented layers. The surface is hidden.' : 'Combined view shows the surface and invented below-ground layers.') + (revealed ? ' The wider domain is revealed. Read the explanation below for the full text equivalent.' : ' The wider consequence domain has not yet been revealed.');
  $('wider-explanation').hidden = !revealed;
  $('reveal').textContent = revealed ? 'Return to the smaller view' : 'Reveal what the first view hid';
  $('reveal').setAttribute('aria-expanded', String(revealed));
  const reasons = refusalReasons(s);
  $('decision').classList.toggle('refused', reasons.length > 0);
  $('decision-title').textContent = reasons.length ? 'INSUFFICIENT EVIDENCE' : 'TOY COMPARISON ONLY';
  $('decision-text').textContent = reasons.length ? 'This stress example deliberately refuses a broad interpretation. The arithmetic below may still illustrate assumptions, but it cannot justify a real-world decision.' : 'You can compare these invented outcomes and inspect the assumptions. No scenario on this page has evidence sufficient for a real-world recommendation.';
  $('refusal-reasons').replaceChildren();
  reasons.forEach(reason => {const li = document.createElement('li'); li.textContent = reason; $('refusal-reasons').append(li);});
  const difference = a.vegetation - noA.vegetation;
  $('local-story').textContent = s.intervention === 'none' ? 'The selected scenario is no new action. Both pairs of result columns are identical. The toy catchment still changes under the chosen weather and horizon.' : 'At year ' + s.year + ', Model A gives local vegetation an index of ' + a.vegetation + ', compared with ' + noA.vegetation + ' for no new action. The difference is ' + difference + ' invented index points. It is not a measured benefit.';
  $('delayed-story').textContent = 'Illustrative salinity concern is ' + a.salinity + ' in Model A and ' + b.salinity + ' in Model B. Both reuse the same rules. A stronger assumed connection changes the delayed pathway. The chart shows how this plays out across the four toy horizons.';
  $('results').replaceChildren();
  Object.entries(metrics).forEach(([key, label]) => {
    const row = document.createElement('tr'); addCell(row, label, true);
    [a, b, noA, noB].forEach(result => addCell(row, result[key]));
    $('results').append(row);
  });
  renderChart(s);
  $('trace').textContent = JSON.stringify({status: 'Synthetic demonstration only; no measured environmental evidence',scenario: s,startingValues: landscapeRules[s.landscape],weatherModifiers: weatherRules[s.weather],actionModifiers: interventionRules[s.intervention],modelAssumptions: modelRules,outputs: {A: a, B: b},noNewAction: {A: noA, B: noB},stressRefusalReasons: reasons,omissions: ['sediment', 'ecological change', 'extreme-event behaviour', 'cumulative effects', 'real receptors'],permittedUse: 'Explore the interface and invented assumptions only'}, null, 2);
}
function exitGuide() {
  guideStep = -1;
  $('journey-title').textContent = 'Explore your own scenario';
  $('guide-text').textContent = 'Your selections now control the example. Start the guided journey at any time to follow its four steps.';
  $('guide-start').textContent = 'Start the guided journey';
  $('guide-start').hidden = false; $('guide-back').hidden = true; $('guide-next').hidden = true;
}
function applyGuide(index) {
  guideStep = index;
  const step = guide[index];
  ['landscape', 'weather', 'intervention', 'year'].forEach(key => $(key).value = String(step[key]));
  view = step.view; revealed = step.reveal;
  $('journey-title').textContent = step.title;
  $('guide-text').textContent = step.text;
  $('guide-start').hidden = true;
  $('guide-back').hidden = index === 0;
  $('guide-next').hidden = false;
  $('guide-next').textContent = index === 3 ? 'Finish and explore' : 'Next step';
  render();
}
['landscape', 'weather', 'intervention', 'year'].forEach(id => $(id).addEventListener('change', () => {exitGuide(); render();}));
['surface', 'combined', 'below'].forEach(name => $('view-' + name).addEventListener('click', () => {view = name; render();}));
$('reveal').addEventListener('click', () => {revealed = !revealed; if (revealed) view = 'combined'; render();});
$('guide-start').addEventListener('click', () => applyGuide(0));
$('guide-back').addEventListener('click', () => {if (guideStep > 0) applyGuide(guideStep - 1);});
$('guide-next').addEventListener('click', () => {if (guideStep < 3) applyGuide(guideStep + 1); else {exitGuide(); render();}});
$('reset').addEventListener('click', () => {
  $('landscape').value = 'mixed'; $('weather').value = 'variable'; $('intervention').value = 'maintained'; $('year').value = '1';
  view = 'surface'; revealed = false; exitGuide();
  $('journey-title').textContent = 'Look beyond the first view';
  $('guide-text').textContent = 'Start with a greener creek corridor, move through time, widen the view and reach a deliberate refusal.';
  render();
});
const expertiseNotes = {
  hydrology: 'The runoff index is an invented sum. Real work needs observed flows, water balances, event behaviour and justified spatial boundaries.',
  groundwater: 'Both models use invented connection strengths and delays. Real work needs groundwater levels, connectivity, salinity observations and a defensible response timescale.',
  ecology: 'A greener corridor is a coloured line and toy index. Real work needs ecological baselines, soil processes, species responses and adverse-effect monitoring.',
  sediment: 'Sediment is explicitly omitted. Real work needs erosion, transport, deposition and failure pathways before a broad consequence claim could be supported.',
  geospatial: 'The map has no real coordinates or measured layers. Real work needs dated spatial data, provenance, uncertainty, permitted uses and consistent state times.',
  coupling: 'The two rules share a single code path. Real federation needs typed exchanges, units, scale transformations, conservation tests, failure handling and reproducible receipts.',
  validation: 'No calibration or scientific validation has been performed. Real work needs withheld observations, adversarial benchmarks, documented dependencies and meaningful refusal tests.',
  governance: 'No Indigenous knowledge is represented and no local permission is implied. Any real use needs appropriate local governance from the beginning, including decisions about what must not be collected or exposed.',
  authority: 'The interface has no decision authority. Real work needs clear intended uses, legitimate thresholds, consent, accountability and limits that remain attached to every result.',
  accessibility: 'The diagram has a text equivalent and the page uses labelled native controls. Further work needs disability-led comprehension work, assistive-technology testing and checks on whether people understand the toy status.'
};
function showExpertise() {$('expertise-detail').textContent = expertiseNotes[$('expertise').value];}
$('expertise').addEventListener('change', showExpertise);
$('prepare-note').addEventListener('click', () => {
  const chosen = $('expertise').selectedOptions[0].textContent;
  $('interest-note').value = 'Simulator, Weidu Lab: local interest note\n\nArea: ' + chosen + '\n\n' + expertiseNotes[$('expertise').value] + '\n\nI would like to explore a defined contribution in this area. My possible contribution, relevant experience, limits and available time:\n[Add only what you choose to share.]\n\nThis note concerns an unvalidated fictional prototype. It does not imply a partnership, funding, permission to use data or scientific endorsement.\n\nPrepared locally. Nothing has been submitted.';
  $('note-area').hidden = false; $('copy-status').textContent = 'Draft prepared in this tab. Review it before sharing.';
});
$('copy-note').addEventListener('click', async () => {
  try {await navigator.clipboard.writeText($('interest-note').value); $('copy-status').textContent = 'Note copied. Nothing has been submitted.';}
  catch {$('copy-status').textContent = 'Automatic copying is unavailable. Select the note and copy it, or use Download note.'; $('interest-note').focus(); $('interest-note').select();}
});
$('download-note').addEventListener('click', () => {
  const blob = new Blob([$('interest-note').value], {type: 'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob); const link = document.createElement('a');
  link.href = url; link.download = 'simulator-interest-note.txt'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('copy-status').textContent = 'A local note download was requested. Nothing has been submitted.';
});
$('rules').textContent = JSON.stringify({landscapeRules, weatherRules, interventionRules, modelRules}, null, 2) + '\n\n' + toyResult.toString() + '\n\n' + refusalReasons.toString() + '\n\n' + 'bound(n) = round(max(0, min(100, n)))';
showExpertise(); render();
