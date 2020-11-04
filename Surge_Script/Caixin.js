const url = $request.url;
let body = $response.body;
let ccsMask = 'isPay > 0';

body = body.replace(ccsMask, 'false');
$done({body});
