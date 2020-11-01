const url = $request.url;
let body = $response.body;
let ccsMask = '.cons>*,.idetor{display:none}.cons>p:first-of-type,.cons>p:nth-of-type(2),.cons>p:nth-of-type(3){display:block}';

body = body.replace(ccsMask, '');
$done({body});