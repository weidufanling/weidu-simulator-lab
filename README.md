# Weidu Simulator Lab

[Try A Small Catchment, Several Futures](https://weidufanling.au/lab/simulator/) or [read the Lab introduction](https://weidufanling.au/lab/).

Public concept prototype 0.1.1. Every place, coefficient and outcome is invented. This interface demonstration cannot predict environmental outcomes or support land-management decisions. Both toy models share a rule family; their agreement is not independent evidence.

Change the landscape, weather, intervention and time horizon. Compare the selected action with no new action, reveal downstream and below-ground pathways, inspect the rules and follow a four-step journey to an insufficient-evidence result. An optional interest note is prepared locally and is never submitted by the page.

## Run and reproduce

Use Python 3 to build the self-contained page. Node.js 18 or later runs the model checks:

```sh
python3 build.py
node model-checks.mjs
```

Open `static/lab/simulator/index.html` directly in a browser. No model, package download, server, account or API key is needed. The build creates its directories, checks public punctuation and pins the exact inline scripts and stylesheet in the Content Security Policy.

The root contains readable HTML, CSS, model rules and interface code. `VERIFICATION.md` records the bounded checks on the published edition. The model checks cover all 144 scenario combinations, deterministic bounded outputs, the no-action comparison and the documented refusal conditions.

## Origin and limits

This recovery edition was rebuilt with AI assistance on 29 October 2026 after the earlier 0.1 download could not be recovered. Its rules are newly implemented. It is not a byte-identical restoration, a calibrated scientific model or a ratification of the project's separate governance review.

The app uses no analytics, browser storage or runtime network connection. Ordinary hosting requests still occur. No private conversations, real catchment data, restricted knowledge or participant records are included.

Original Weidu source is published for inspection. This release adds no blanket reuse licence to the code, written material or branding. See `REUSE.md` and `CONTRIBUTING.md`.

weidu · the collective ghost writer
