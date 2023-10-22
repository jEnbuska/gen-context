import {
  resolveWithProviders,
  withProviders,
  createGeneratorContext,
} from "./src";

const { createCountProvider, getCountContext } = createGeneratorContext<
  "count",
  number
>("count");

const { createAlphabetProvider, getAlphabetContext } = createGeneratorContext<
  "alphabet",
  string,
  [number]
>("alphabet");

type Cache = Record<string, string>;
const { getCacheContext, createCacheProvider } = createGeneratorContext<
  "cache",
  Cache
>("cache");

const { getProfileContext, createProfileProvider } = createGeneratorContext<
  "profile",
  { name: string }
>("profile");

let count = 0;
const countContextProvider = createCountProvider(async () => {
  count++;
  return count;
});
const alphabetProvider = createAlphabetProvider(
  (n: number) => "abcdefghijklmnopqrstuvwxyz"[n],
);
const cache: Record<string, string> = {};
const cacheProvider = createCacheProvider(async () => {
  return cache;
});
const profileProvider = createProfileProvider(async function* getProfile() {
  const cache = yield* getCacheContext();
  if (!cache.name) {
    cache.name = `John Doe ${Math.random()}`;
  }
  return { name: cache.name as string };
});

async function* a(message: string) {
  console.log("MESSAGE", message);
  let count = yield* getCountContext();
  console.log(count);
  count = yield* getCountContext();
  const letter = yield* getAlphabetContext(0);
  const profile = yield* getProfileContext();
  const profile2 = yield* getProfileContext();
  return { count, letter, profile, profile2 };
}

const aWithProviders = withProviders(
  a,
  profileProvider,
  alphabetProvider,
  countContextProvider,
  cacheProvider,
);

resolveWithProviders(aWithProviders("message")).then((result) =>
  console.log("result", result),
);
