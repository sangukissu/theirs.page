const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  const html = await fetch('https://visitors.now/');
  const regex = /href="([^"]+\.css)"/g;
  let match;
  const cssUrls = [];
  while ((match = regex.exec(html)) !== null) {
    cssUrls.push(match[1]);
  }

  for (const cssUrl of cssUrls) {
    const fullUrl = cssUrl.startsWith('http') ? cssUrl : 'https://visitors.now' + cssUrl;
    const css = await fetch(fullUrl);
    ['purple-4', 'sky-2', 'blue-4', 'bg-a1', 'fg-4', 'fg-2', 'fg-3'].forEach(name => {
      const idx = css.indexOf(name);
      if (idx !== -1) {
        console.log(css.slice(Math.max(0, idx - 20), idx + 60));
      }
    });
  }
}

run().catch(console.error);
