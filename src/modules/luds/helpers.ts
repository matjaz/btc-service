import {
  AppRequest,
  LNURLError,
  TransformFunction,
  AnyTransformContext,
} from "../../types";

const { BASE_URL } = process.env;

export function error(reason: string): LNURLError {
  return {
    status: "ERROR",
    reason,
  };
}

export function getBaseURL(req: AppRequest) {
  return BASE_URL || `${req.protocol}://${req.get("host")}${req.baseUrl}`;
}

export function getURL(req: AppRequest, path: string = "") {
  return `${getBaseURL(req)}${req.path}${path}`;
}

export async function transform(
  val: AnyTransformContext,
  fns: TransformFunction<AnyTransformContext>[],
) {
  for await (const fn of fns) {
    val = (await fn(val)) || val;
  }
  return val;
}
