const url = $request.url;
let body = $response.body;
let paywallFlag = 'isPay > 0';

body = body.replace(paywallFlag, 'false');
$done({body});
