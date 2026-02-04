import { combineReducers } from "redux";
import {
  usersReducer,
  authReducer
} from "./slices";
export const rootReducer = combineReducers({
  user: usersReducer,
  auth: authReducer
});