export function toUtcDate(isoString) {
  if (!isoString) {
    return null;
  }

  return new Date(isoString);
}

export function toLocalDate(isoStringOrDate, timezone) {
  if (!isoStringOrDate) {
    return null;
  }

  if (!timezone) {
    timezone = "America/Toronto";
  }

  var utcDate;

  if (isoStringOrDate instanceof Date) {
    utcDate = isoStringOrDate;
  } else {
    utcDate = new Date(isoStringOrDate);
  }

  var formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  var partsArray = formatter.formatToParts(utcDate);
  var parts = {};

  for (var i = 0; i < partsArray.length; i++) {
    var p = partsArray[i];
    parts[p.type] = p.value;
  }

  var localStr =
    parts.year +
    "-" +
    parts.month +
    "-" +
    parts.day +
    "T" +
    parts.hour +
    ":" +
    parts.minute +
    ":" +
    parts.second;

  return new Date(localStr);
}

export function formatLocal(date, timezone, withSeconds) {
  if (!date) {
    return "";
  }

  if (!timezone) {
    timezone = "America/Toronto";
  }

  if (typeof withSeconds === "undefined") {
    withSeconds = false;
  }

  var options = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  };

  if (withSeconds) {
    options.second = "2-digit";
  }

  var formatter = new Intl.DateTimeFormat("en-CA", options);
  var formatted = formatter.format(date);
  return formatted.replace(",", "");
}

export function isPrimeTime(date, timezone) {
  if (!date) {
    return false;
  }

  if (!timezone) {
    timezone = "America/Toronto";
  }

  var local = toLocalDate(date, timezone);

  if (!local) {
    return false;
  }

  var hour = local.getHours();
  var minute = local.getMinutes();

  if (hour === 19 && minute === 0) {
    return true;
  }

  return false;
}

export function isToday(date, timezone) {
  if (!date) {
    return false;
  }

  if (!timezone) {
    timezone = "America/Toronto";
  }

  var now = new Date();
  var localNow = toLocalDate(now, timezone);
  var localDate = toLocalDate(date, timezone);

  if (!localNow || !localDate) {
    return false;
  }

  var sameYear = localNow.getFullYear() === localDate.getFullYear();
  var sameMonth = localNow.getMonth() === localDate.getMonth();
  var sameDay = localNow.getDate() === localDate.getDate();

  return sameYear && sameMonth && sameDay;
}

export function isTomorrow(date, timezone) {
  if (!date) {
    return false;
  }

  if (!timezone) {
    timezone = "America/Toronto";
  }

  var now = new Date();
  var localNow = toLocalDate(now, timezone);
  var localDate = toLocalDate(date, timezone);

  if (!localNow || !localDate) {
    return false;
  }

  var diffMs = localDate.getTime() - localNow.getTime();
  var diffDays = diffMs / (1000 * 60 * 60 * 24);

  return Math.floor(diffDays) === 1;
}
