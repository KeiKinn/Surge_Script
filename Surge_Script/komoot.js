let url = $request.url
let body = $response.body

if (url.includes('config') || url.includes('embedded=premium')) {
  body = body.replace('premium":fals', 'premium":tru');
} else if (url.includes('pioneer') || url.includes('activities')) {
  body = body.replace('is_premium": fals', 'is_premium": tru');
} else if (url.includes("v006")){
  body = body.replace("NEEDSPURCHASE", "")
}

$done({body})
