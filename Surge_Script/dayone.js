  const bodyJson = JSON.parse($response.body);
    bodyJson.subscription.premium = true;
    bodyJson.subscription.plus_on_ios = false;
  	bodyJson.minimumSubscription.premium = true;
	bodyJson.minimumSubscription.plus_on_ios = false;
	bodyJson.bio = 'Kei Kinn';
  	bodyJson.featureBundle = {"bundleName":"premium","features":[{"name":"imagesPerEntry","limit":30,"canUpgrade":false},{"name":"printingDiscount","canUpgrade":false},{"name":"syncMac","canUpgrade":false},{"name":"prioritySupport","canUpgrade":false},{"name":"sync","canUpgrade":false},{"name":"journalLimit","limit":100,"canUpgrade":false},{"name":"audioPerEntry","limit":10,"canUpgrade":false}]};
  	let body = JSON.stringify(bodyJson)
  $done({body});