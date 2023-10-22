import { isGeneratorContextRequest } from "./is-generator-context-request.ts";

export async function resolveWithProviders<Return>(
  generator:
    | AsyncGenerator<unknown, Return, void | undefined>
    | Generator<unknown, Return, void | undefined>,
): Promise<Return> {
  let next = await generator.next();
  if (!next.done) {
    const { value } = next;
    if (isGeneratorContextRequest(value)) {
      throw new Error(
        `Generator context request "${value.name}" was not resolved.`,
      );
    }
    throw new Error(
      `Unexpected value ${
        typeof value === "symbol" ? value.toString() : value
      } yielded to resolveWithProviders`,
    );
  }
  return next.value as Return;
}
