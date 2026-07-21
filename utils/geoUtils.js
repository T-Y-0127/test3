// utils/geoUtils.js — 地理情報ユーティリティ
import { OKINAWA_POLY } from '../data/okinawaPoly.js';

/** Ray casting 法で陸地か判定 */
export function isOnLand(lng, lat) {
  let inside = false;
  for (let i = 0, j = OKINAWA_POLY.length - 1; i < OKINAWA_POLY.length; j = i++) {
    const xi = OKINAWA_POLY[i][0], yi = OKINAWA_POLY[i][1];
    const xj = OKINAWA_POLY[j][0], yj = OKINAWA_POLY[j][1];
    if (((yi > lat) !== (yj > lat)) &&
        (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}
