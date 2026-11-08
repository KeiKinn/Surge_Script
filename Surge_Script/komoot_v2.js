const url = $request.url;
let body = $response.body;

// 1. 区域商品查询：命中官方规范，返回 0 字节空字符串阻止全球包兜底拉取
if (url.includes('/finance/products/regions/')) {
  $done({ body: "" });
}

if (!body) {
  $done({});
}

try {
  // 2. 注入全局免检资产包：对标请求 [54] 的官方底层模型
  if (url.includes('/finance/packages/')) {
    if (url.includes('compactpath')) {
      // 路线覆盖鉴权放行
      let obj = JSON.parse(body);
      obj.status = "UNLOCKED";
      body = JSON.stringify(obj);
    } else {
      // 用户拥有的资产包列表：注入全球免检包，穿透 SQLite 多边形校验
      let list = JSON.parse(body);
      if (Array.isArray(list)) {
        const hasAllRegions = list.some(item => item.allRegions === true);
        if (!hasAllRegions) {
          list.push({
            "id": -1,
            "product": "komoot Komplett-Paket",
            "subscription": { "id": 1 },
            "active": true,
            "allRegions": true,            // 核心：直接绕过多边形计算
            "cancelable": false,
            "startdate": "2024-01-01 00:00:00 +0000",
            "temporaryEntitlement": false,  // 模拟永久买断包
            "freeUnlocked": false
          });
          body = JSON.stringify(list);
        }
      }
    }
  }

  // 3. 2026 版能力总闸门：对标请求 [12] 注入 13 个特权中的离线核心项
  else if (url.includes('/product_features/free')) {
    let obj = JSON.parse(body);
    if (!Array.isArray(obj.unlocked)) obj.unlocked = [];

    const coreFeatures = [
      "offline_maps_navigation",
      "download_route",
      "send_to_garmin",
      "navigate_with_garmin"
    ];

    const existKeys = new Set(obj.unlocked.map(item => item.key));
    coreFeatures.forEach(key => {
      if (!existKeys.has(key)) {
        obj.unlocked.push({
          key: key,
          action: null,
          start_date: "1970-01-01T00:00:00.000Z",
          end_date: null // 永久有效
        });
      }
    });
    body = JSON.stringify(obj);
  }

  // 4. 账户配置：开启 Premium 特性标识
  else if (url.includes('/config')) {
    let obj = JSON.parse(body);
    obj.premium = true;
    if (Array.isArray(obj.feature_flags) && !obj.feature_flags.includes('premium')) {
      obj.feature_flags.push('premium');
    }
    body = JSON.stringify(obj);
  }

  // 5. 阻止订阅接口返回 204，防止应用拉取 StoreKit 购买列表
  else if (url.includes('/subscriptions/purchased/premium')) {
    body = JSON.stringify({
      "status": "active",
      "product_id": "premium_yearly"
    });
  }

} catch (e) {
  console.log("Komoot rewrite error: " + e);
}

$done({ body });
