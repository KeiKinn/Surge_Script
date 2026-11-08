/*
 * Komoot 解锁增强脚本 (适配新版 iOS & iPadOS)
 */
const url = $request.url;
let body = $response.body;

// 官方对于无内容/空响应的处理（如已解锁坐标本身返回空 Body）
if (!body && !url.includes('/finance/products/regions/')) {
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

  // 2. 2026 版新增：注入基础地图功能权限清单 (product_features/free)
  else if (url.includes('/product_features/free')) {
    let obj = JSON.parse(body);
    if (!Array.isArray(obj.unlocked)) {
      obj.unlocked = [];
    }

    const targetFeatures = [
      "offline_maps_navigation",
      "download_route",
      "send_to_garmin"
    ];

    const existingKeys = new Set(obj.unlocked.map(item => item.key));

    targetFeatures.forEach(featureKey => {
      if (!existingKeys.has(featureKey)) {
        obj.unlocked.push({
          key: featureKey,
          action: null,
          start_date: "1970-01-01T00:00:00.000Z",
          end_date: null // 永久有效
        });
      }
    });

    body = JSON.stringify(obj);
  }

  // 3. 拦截坐标区域商品查询：按官方已解锁规范返回 0 字节空字符串（避免 [] 触发全球包兜底）
  else if (url.includes('/finance/products/regions/')) {
    body = "";
  }

  // 4. 拦截路线覆盖鉴权（compactpath）
  else if (url.includes('/finance/packages/') && url.includes('compactpath')) {
    let obj = JSON.parse(body);
    if (obj.status === "NEEDSPURCHASE" || !obj.status) {
      obj.status = "UNLOCKED";
    }
    body = JSON.stringify(obj);
  }

  // 5. 活动及图文中的高级会员标识
  else if (url.includes('activities') || url.includes('pioneer') || url.includes('embedded=premium')) {
    body = body.replace(/"is_premium"\s*:\s*false/g, '"is_premium":true');
    body = body.replace(/"premium"\s*:\s*false/g, '"premium":true');
  }
} catch (e) {
  console.log("Komoot rewrite error: " + e);
}

$done({ body });
