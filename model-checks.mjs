import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('./model.js', import.meta.url), 'utf8');
const context = vm.createContext({});
vm.runInContext(source + '\nglobalThis.rules = { horizons, landscapeRules, weatherRules, interventionRules, modelRules, toyResult, refusalReasons };', context);
const r = context.rules;
let scenarios = 0;
for (const landscape of Object.keys(r.landscapeRules)) {
  for (const weather of Object.keys(r.weatherRules)) {
    for (const intervention of Object.keys(r.interventionRules)) {
      for (const year of r.horizons) {
        const scenario = { landscape, weather, intervention, year };
        for (const model of Object.keys(r.modelRules)) {
          const result = r.toyResult(scenario, model);
          assert.deepEqual(result, r.toyResult(scenario, model), 'Results must be deterministic');
          for (const value of Object.values(result)) {
            assert(Number.isInteger(value) && value >= 0 && value <= 100, 'Toy indices must remain bounded integers');
          }
          if (intervention === 'none') {
            assert.deepEqual(result, r.toyResult(scenario, model, 'none'), 'No-action selection must equal its comparison');
          }
        }
        const reasons = r.refusalReasons(scenario);
        assert.equal(reasons.length > 0, (landscape === 'saturated' && weather === 'intense') || (intervention === 'neglected' && year >= 20), 'Documented insufficient-evidence conditions must be retained');
        scenarios++;
      }
    }
  }
}
assert.equal(scenarios, 144);
console.log('Passed 144 synthetic scenarios for both toy models: determinism, bounds, no-action identity and refusal conditions. These checks do not validate environmental predictions.');
