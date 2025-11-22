// src/utils/time.js

/**
 * 将 ISO 字符串转为 UTC Date
 * 示例输入："2025-11-21T00:00:00Z"
 * 返回：Date (UTC)
 */
export function toUtcDate(isoString) {
  if (!isoString) return null;
  return new Date(isoString);
}

/**
 * 将 UTC 时间转为指定时区的 Date
 * 默认：America/Toronto
 *
 * ⚠ 关键点：
 * JS 的 Date 本身不存时区，只能用格式化 + 重新造 Date 来实现时区转换
 */
export function toLocalDate(
  isoStringOrDate,
  timezone = "America/Toronto"
) {
  if (!isoStringOrDate) return null;

  const utcDate =
    isoStringOrDate instanceof Date
      ? isoStringOrDate
      : new Date(isoStringOrDate);

  // 用 Intl API 转换成指定时区的 YYYY-MM-DD HH:mm:ss
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const parts = formatter.formatToParts(utcDate).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});

  const localStr = `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}`;
  return new Date(localStr);
}

/**
 * 将 Date 格式化成本地字符串（前端展示用）
 * 返回："2025-11-21 19:30"
 */
export function formatLocal(
  date,
  timezone = "America/Toronto",
  withSeconds = false
) {
  if (!date) return "";

  const options = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  if (withSeconds) options.second = "2-digit";

  const formatter = new Intl.DateTimeFormat("en-CA", options);
  return formatter.format(date).replace(",", "");
}

/**
 * 判断是否本地黄金时段（19:00 开球）
 * 未来推荐算法会用到
 */
export function isPrimeTime(date, timezone = "America/Toronto") {
  if (!date) return false;

  const local = toLocalDate(date, timezone);

  const hour = local.getHours();
  const minute = local.getMinutes();

  return hour === 19 && minute === 0;
}

/**
 * 判断是否本地当天比赛
 */
export function isToday(date, timezone = "America/Toronto") {
  if (!date) return false;

  const now = new Date();
  const localNow = toLocalDate(now, timezone);
  const localDate = toLocalDate(date, timezone);

  return (
    localNow.getFullYear() === localDate.getFullYear() &&
    localNow.getMonth() === localDate.getMonth() &&
    localNow.getDate() === localDate.getDate()
  );
}

/**
 * 判断是否明天比赛
 */
export function isTomorrow(date, timezone = "America/Toronto") {
  if (!date) return false;

  const now = new Date();
  const localNow = toLocalDate(now, timezone);
  const localDate = toLocalDate(date, timezone);

  const diff =
    (localDate - localNow) / (1000 * 60 * 60 * 24);

  return Math.floor(diff) === 1;
}
