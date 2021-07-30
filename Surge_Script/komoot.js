let url = $request.url
let body = $response.body

if (url.includes('config') || url.includes('embedded=premium')) {
  body = body.replace('premium":fals', 'premium":tru');
} else if (url.includes('poinner')) {
  body = body.replace('is_premium": fals', 'is_premium": tru');
}

if (url.include("v006")){
  body = body.replace("NEEDSPURCHASE", "")
}

$done({body})
