from pathlib import Path
import base64, hashlib, json, re, zipfile

root = Path(__file__).resolve().parent
(root/'static/lab/simulator').mkdir(parents=True,exist_ok=True)
(root/'checks').mkdir(exist_ok=True)
css = (root/'app.css').read_text()
js = (root/'model.js').read_text() + '\n' + (root/'app.js').read_text()
pin = lambda s: 'sha256-' + base64.b64encode(hashlib.sha256(s.encode()).digest()).decode()
csp = "default-src 'none'; script-src '%s'; style-src '%s'; img-src data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'" % (pin(js), pin(css))
html = (root/'page.html').read_text().replace('__CSP__',csp).replace('__CSS__',css).replace('__JS__',js)
assert not re.search('[\u2013\u2014]',html), 'Long dash punctuation in public source'
assert not re.search(r'/mnt/data/|YOUR-GITHUB|__CSS__|__JS__|__CSP__', html)
destination = root/'static/lab/simulator/index.html'
destination.write_text(html)
(root/'SIMULATOR_Weidu_Lab_Prototype_v0.1.1.html').write_text(html)
manifest = {'edition':'0.1.1 recovery','date':'2026-10-29','csp':csp,'html_sha256':hashlib.sha256(html.encode()).hexdigest(),'css_sha256':pin(css),'js_sha256':pin(js),'original_v01_recovered':False,'basis':'Simulator project chat specification, newly implemented deterministic toy rules'}
(root/'checks/build-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2))
