export function error(reason, status = "ERROR") {
  return {
    status,
    reason,
  };
}

export function getBaseURL(req, path = "") {
  return `${req.protocol}://${req.get("host")}${req.baseUrl}${req.path}${path}`;
}

export async function transform(val, fns) {
  for await (const fn of fns) {
    val = (await fn(val)) || val;
  }
  return val;
}
