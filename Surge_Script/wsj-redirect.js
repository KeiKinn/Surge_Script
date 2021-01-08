let url = $request.url;
url = url.replace('articles', 'amp/articles');
$done({url});