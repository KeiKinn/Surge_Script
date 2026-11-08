/**
 * Komoot 2026 (v2026.43.1+) 鉴权与离线资产重写脚本
 */

function main() {
  const url = $request.url;
  let body = $response.body;

  // 1. 区域商品探查接口：按官方已解锁规范直接返回 0 字节空响应，并立即 return 终止后续执行
  if (url.includes('/finance/products/regions/')) {
    return $done({ body: "" });
  }

  // 若响应体本身为空（如 HTTP 204 等），直接放行
  if (!body) {
    return $done({});
  }

  try {
    // 2. 精确匹配多边形资产包接口：注入永久买断版全球包 (避免与 204 订阅状态冲突)
    if (url.includes('/finance/packages/') && url.includes('geometrystyle=wkt')) {
      let obj = JSON.parse(body);
      
      // 构造买断型（非临时订阅附赠）全球包，确保持久化写入本地 SQLite 后不被 204 订阅状态剔除
      const permanentWorldPack = {
        "id": -1,
        "product": "komoot Komplett-Paket",
        "active": true,
        "allRegions": true,
        "cancelable": false,
        "startdate": "2024-06-01 00:00:00 +0000",
        "temporaryEntitlement": false,
        "freeUnlocked": false
      };

      if (Array.isArray(obj)) {
        // 移除可能存在的临时全球包，替换为永久买断属性
        const idx = obj.findIndex(pkg => pkg.allRegions === true);
        if (idx !== -1) {
          obj[idx] = permanentWorldPack;
        } else {
          obj.push(permanentWorldPack);
        }
      } else if (obj && Array.isArray(obj.packages)) {
        const idx = obj.packages.findIndex(pkg => pkg.allRegions === true);
        if (idx !== -1) {
          obj.packages[idx] = permanentWorldPack;
        } else {
          obj.packages.push(permanentWorldPack);
        }
      }
      body = JSON.stringify(obj);
    }

    // 3. 精确匹配单条路线覆盖鉴权 (compactpath)
    else if (url.includes('/finance/packages/') && url.includes('compactpath')) {
      let obj = JSON.parse(body);
      if (obj.status === "NEEDSPURCHASE" || !obj.status) {
        obj.status = "UNLOCKED";
      }
      body = JSON.stringify(obj);
    }

    // 4. 2026 版新增功能门禁：注入全部 13 项标准特权至 product_features/free
    else if (url.includes('/product_features/free')) {
      let obj = JSON.parse(body);
      if (!Array.isArray(obj.unlocked)) {
        obj.unlocked = [];
      }

      const allFeatures = [
        // maps 核心离线与硬件资产
        "offline_maps_navigation",
        "download_route",
        "send_to_garmin",
        "navigate_with_garmin",
        // premium 增值功能资产
        "3d_maps",
        "weather",
        "sport_specific_maps",
        "live_tracking",
        "multiday_planner",
        "multi_day_adventures",
        "personal_collections",
        "tour_image_gallery_filters",
        "external_device_maps"
      ];

      const existingKeys = new Set(obj.unlocked.map(item => item.key));
      allFeatures.forEach(key => {
        if (!existingKeys.has(key)) {
          obj.unlocked.push({
            "key": key,
            "action": key === "navigate_with_garmin" ? "connect_garmin" : null,
            "start_date": "1970-01-01T00:00:00.000Z",
            "end_date": null
          });
        }
      });

      body = JSON.stringify(obj);
    }

    // 5. 全局配置接口 (/config)：开启会员标识并对齐特权数组
    else if (url.includes('/config')) {
      let obj = JSON.parse(body);
      obj.premium = true;
      if (Array.isArray(obj.feature_flags) && !obj.feature_flags.includes('premium')) {
        obj.feature_flags.push('premium');
      }
      body = JSON.stringify(obj);
    }

    // 6. 独立后置处理（脱离 else if 互斥链）：处理动态流、先驱者及内嵌会员布尔字段
    if (
      url.includes('activities') ||
      url.includes('pioneer') ||
      url.includes('embedded=premium') ||
      url.includes('/users/')
    ) {
      body = body.replace(/"is_premium"\s*:\s*false/g, '"is_premium":true');
      body = body.replace(/"premium"\s*:\s*false/g, '"premium":true');
    }

  } catch (e) {
    console.log("Komoot rewrite error: " + e);
  }

  return $done({ body });
}

main();
