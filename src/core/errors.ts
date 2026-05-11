export class BdownError extends Error {
  code: string;
  next?: string;

  constructor(code: string, message: string, next?: string) {
    super(message);
    this.name = "BdownError";
    this.code = code;
    this.next = next;
  }
}

export function toErrorPayload(error: unknown) {
  if (error instanceof BdownError) {
    return {
      status: "error",
      code: error.code,
      message: error.message,
      next: error.next ?? null
    };
  }

  return {
    status: "error",
    code: "UNKNOWN_ERROR",
    message: error instanceof Error ? error.message : String(error),
    next: null
  };
}
