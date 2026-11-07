/*
 * Komoot 解锁增强脚本 (适配新版 iOS & iPadOS)
 */
const url = $request.url;
let body = $response.body;

if (!body) {
  $done({});
}

try {
  // 1. 拦截用户配置：开启 Premium 特征开关
  if (url.includes('/config')) {
    let obj = JSON.parse(body);
    obj.premium = true;
    if (Array.isArray(obj.feature_flags)) {
      if (!obj.feature_flags.includes('premium')) {
        obj.feature_flags.push('premium');
      }
    }
    body = JSON.stringify(obj);
  }
  
  // 2. 拦截坐标区域商品查询：返回空列表，阻止唤起单区域购买弹窗
  else if (url.includes('/finance/products/regions/')) {
    body = JSON.stringify([]);
  }

  // 3. 拦截路线覆盖鉴权（compactpath）
  else if (url.includes('/finance/packages/')) {
    if (url.includes('compactpath')) {
      let obj = JSON.parse(body);
      // 避免返回 {"status": ""}，替换为授权状态
      if (obj.status === "NEEDSPURCHASE" || !obj.status) {
        obj.status = "UNLOCKED";
      }
      body = JSON.stringify(obj);
    }
  }

  // 4. 活动及图文中的高级会员标识
  else if (url.includes('activities') || url.includes('pioneer') || url.includes('embedded=premium')) {
    body = body.replace(/"is_premium"\s*:\s*false/g, '"is_premium":true');
    body = body.replace(/"premium"\s*:\s*false/g, '"premium":true');
  }
} catch (e) {
  console.log("Komoot rewrite error: " + e);
}

$done({ body });
