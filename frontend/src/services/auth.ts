export const TOKEN_KEY = "@intranet:token";
export const AUTH_MESSAGE_KEY = "@intranet:auth_message";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);

  // opcional: limpar mensagem também
  localStorage.removeItem(AUTH_MESSAGE_KEY);

  window.location.href = "/login";
}
