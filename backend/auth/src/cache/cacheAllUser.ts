import { getJson, setJson } from "./query.js";
import cache from "./index.js";
import { getAllUsersKey } from "./key.js";

// The database stays authoritative; Redis only speeds up repeated list reads.
export async function getCachedAllUsers<T>() {
	try {
		return await getJson<T[]>(getAllUsersKey());
	} catch (error) {
		console.error("Could not read all users from cache", error);
		return null;
	}
}

export async function cacheAllUsers<T>(users: T[]) {
	try {
		await setJson(getAllUsersKey(), users);
	} catch (error) {
		console.error("Could not cache all users", error);
	}
}

// Any user mutation makes the stored list stale, so remove it before the next read.
export async function clearAllUsersCache() {
	try {
		await cache.del(getAllUsersKey());
	} catch (error) {
		console.error("Could not clear all users cache", error);
	}
}

