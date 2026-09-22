export enum DynamicKey {
//   USER_TODOS = "USER_TODOS",
  USER_INFO = "USER_INFO",
  ALL_USERS = "ALL_USERS",
}

function getDynamicKey(key: DynamicKey, userId: string) {
  return `${key}:${userId}`;
}

// export function getUserTodosKey(userId: string) {
//   return getDynamicKey(DynamicKey.USER_TODOS, userId);
// }

export function getUserInfoKey(userId: string) {
  return getDynamicKey(DynamicKey.USER_INFO, userId);
}

export function getAllUsersKey() {
  return DynamicKey.ALL_USERS;
}