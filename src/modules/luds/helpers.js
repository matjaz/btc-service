const { BASE_URL } = process.env;

export function error(reason, status = "ERROR") {
  return {
    status,
    reason,
  };
}

export function getBaseURL(req) {
  return BASE_URL || `${req.protocol}://${req.get("host")}${req.baseUrl}`;
}

export function getURL(req, path = "") {
  return `${getBaseURL(req)}${req.path}${path}`;
}

export async function transform(val, fns) {
  for await (const fn of fns) {
    val = (await fn(val)) || val;
  }
  return val;
}
