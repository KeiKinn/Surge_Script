// google-redirect-recover.js

const url = $request.url;
let searchQuery = null;

try {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  const deepLink = urlParams.get('link');
  
  if (deepLink) {
    const decodedLink = decodeURIComponent(deepLink);
    const match = decodedLink.match(/q=([^&]+)/);
    if (match && match[1]) {
      searchQuery = decodeURIComponent(match[1]);
    }
  }
} catch (e) {}

if (searchQuery) {
  const redirectUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  $done({
    status: 302,
    headers: {
      Location: redirectUrl
    },
    body: ""
  });
} else {
  $done({
    status: 200,
    headers: { 'Content-Type': 'text/html' },
    body: '<html><body>Redirect blocked</body></html>'
  });
}
