let body = $response.body;
let replaceContent = 'v0.js';

body = body.replace(replaceContent, '');

$done({body});