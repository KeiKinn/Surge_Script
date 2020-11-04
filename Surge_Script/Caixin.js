const url = $request.url;
let body = $response.body;
let paywallFlag = 'isPay > 0';
let cssBottomMask = 'cons bottom-layer';

body = body.replace(paywallFlag, 'false');
body = body.replace(cssBottomMask, 'cons bottom_layer');
$done({body});
