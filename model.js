// All coefficients below are invented for an interface demonstration.
const horizons = [1, 5, 20, 40];
const landscapeRules = {
  dry: {vegetation: 25, runoff: 32, groundwater: 12, salinity: 10},
  mixed: {vegetation: 44, runoff: 45, groundwater: 25, salinity: 18},
  saturated: {vegetation: 50, runoff: 68, groundwater: 60, salinity: 38}
};
const weatherRules = {
  dry: {vegetation: -12, runoff: -14, groundwater: -8, salinity: 8},
  variable: {vegetation: 3, runoff: 5, groundwater: 7, salinity: 3},
  intense: {vegetation: 4, runoff: 22, groundwater: 18, salinity: 12}
};
const interventionRules = {
  none: {vegetation: 0, runoff: 0, recharge: 0, failure: 0},
  planting: {vegetation: 14, runoff: -8, recharge: 3, failure: 0},
  maintained: {vegetation: 24, runoff: -20, recharge: 21, failure: 0},
  neglected: {vegetation: 19, runoff: -12, recharge: 18, failure: 1}
};
const modelRules = {
  A: {connection: 0.35, lagYears: 20},
  B: {connection: 0.8, lagYears: 8}
};
const bound = n => Math.round(Math.max(0, Math.min(100, n)));
function toyResult(scenario, modelName, intervention = scenario.intervention, year = scenario.year) {
  const start = landscapeRules[scenario.landscape];
  const weather = weatherRules[scenario.weather];
  const action = interventionRules[intervention];
  const model = modelRules[modelName];
  const delay = year / (year + model.lagYears);
  const connection = model.connection;
  const slow = (start.groundwater + weather.groundwater + action.recharge) * connection * delay;
  const failure = action.failure * (year / 40) * (scenario.weather === 'intense' ? 26 : 13);
  return {
    vegetation: bound(start.vegetation + weather.vegetation + action.vegetation * (0.65 + 0.35 * year / (year + 5)) - slow * 0.5 - failure),
    runoff: bound(start.runoff + weather.runoff + action.runoff + failure),
    groundwater: bound(start.groundwater + weather.groundwater + action.recharge * connection * delay),
    salinity: bound(start.salinity + weather.salinity + slow * 0.85 + action.recharge * connection * delay - (intervention === 'planting' ? 3 : 0) + failure * 0.6)
  };
}
function refusalReasons(scenario) {
  const reasons = [];
  if (scenario.landscape === 'saturated' && scenario.weather === 'intense') reasons.push('The stress example combines a saturated starting state with intense rainfall. Flood behaviour and sediment movement are omitted.');
  if (scenario.intervention === 'neglected' && scenario.year >= 20) reasons.push('Long-term structural failure is deliberately simplified. The toy rule cannot describe where released water or sediment would go.');
  return reasons;
}
