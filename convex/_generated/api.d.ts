/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as characters from "../characters.js";
import type * as helpers from "../helpers.js";
import type * as http from "../http.js";
import type * as locations from "../locations.js";
import type * as props from "../props.js";
import type * as scenes from "../scenes.js";
import type * as scripts from "../scripts.js";
import type * as tasks from "../tasks.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  characters: typeof characters;
  helpers: typeof helpers;
  http: typeof http;
  locations: typeof locations;
  props: typeof props;
  scenes: typeof scenes;
  scripts: typeof scripts;
  tasks: typeof tasks;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
