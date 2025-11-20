// ui/src/utils/authUtils.ts

const TOKEN_KEY = 'peerlink_user_token';
const USERNAME_KEY = 'peerlink_username';

/**
 * Saves the authentication token and username to local storage upon successful login.
 */
export const saveAuthToken = (token: string, username: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
};

/**
 * Retrieves the authentication token for use in API headers.
 */
export const getAuthToken = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
};

/**
 * Retrieves the username to display in the profile section.
 */
export const getUsername = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem(USERNAME_KEY) : null;
};

/**
 * Clears the user's session data from local storage.
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }
};

/**
 * Get or generate guest ID for anonymous uploads
 */
export const getGuestId = (): string | null => {
  return typeof window !== 'undefined' ? localStorage.getItem('guestId') : null;
};

export const setGuestId = (): string => {
  const id = 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  if (typeof window !== 'undefined') {
    localStorage.setItem('guestId', id);
  }
  return id;
};