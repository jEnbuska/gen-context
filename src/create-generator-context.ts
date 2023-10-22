import {
  GeneratorContext,
  CreateGeneratorContextProvider,
  AnyGenerator,
  GeneratorContextRequest,
} from "./types.ts";
import { capitalize } from "./capitalize.ts";
import { isGeneratorContextRequest } from "./is-generator-context-request.ts";
import { isAnyGeneratorFunction } from "./is-any-generator-function.ts";

export function createGeneratorContext<
  const Name extends string,
  Provider extends (...args: any[]) => any,
>(
  name: Name,
): GeneratorContext<Name, Parameters<Provider>, ReturnType<Provider>> {
  const context = Symbol(name);
  type Return = ReturnType<Provider>;
  type Args = Parameters<Provider>;
  const createProvider: CreateGeneratorContextProvider<Args, Return> = (
    provider,
  ) => {
    function isOwnContextRequest(
      value: unknown,
    ): value is GeneratorContextRequest<Args> {
      return isGeneratorContextRequest(value) && value.context === context;
    }
    return async function* generatorContextProvider(
      generator: AnyGenerator,
    ): AsyncGenerator {
      let next = await generator.next();
      while (!next.done) {
        if (!isOwnContextRequest(next.value)) {
          const value = yield next.value;
          next = await generator.next(value);
        } else if (isAnyGeneratorFunction(provider)) {
          const value = yield* provider(...next.value.args);
          next = await generator.next(value);
        } else {
          const value = provider(...next.value.args);
          next = await generator.next(value);
        }
      }
      return next.value;
    };
  };

  async function* getContext(
    ...args: Args
  ): AsyncGenerator<GeneratorContextRequest<Args>, Return> {
    const value = yield { args, name, context };
    return value as Return;
  }

  return {
    [`get${capitalize(name)}Context`]: getContext,
    [`create${capitalize(name)}Provider`]: createProvider,
  } as any;
}
