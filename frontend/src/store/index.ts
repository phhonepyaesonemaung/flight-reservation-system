import store, { persistor } from "./store";
export { persistor, store };
export type RootState = ReturnType<typeof store.getState>