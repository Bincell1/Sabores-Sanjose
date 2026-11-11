const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;
let accessToken = '';

const authHeaders = () => {
  const headers: Record<string, string> = { apikey: key ?? '', 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
};
const request = async (table: string, method: string, query = '', body?: unknown) => {
  const response = await fetch(`${url}/rest/v1/${table}${query}`, { method, headers: { ...authHeaders(), Prefer: method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal' }, body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { data, error: response.ok ? null : { message: (data?.message ?? text) || `Supabase error ${response.status}` } };
};
const authRequest = async (path: string, method: string, body?: unknown) => {
  const response = await fetch(`${url}/auth/v1/${path}`, { method, headers: authHeaders(), body: body === undefined ? undefined : JSON.stringify(body) });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { data, error: response.ok ? null : { message: (data?.message ?? text) || `Supabase error ${response.status}` } };
};

export const isSupabaseConfigured = Boolean(url && key);
export const signInAdmin = async (email: string, password: string) => {
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ email, password }) });
  const data = await response.json();
  if (!response.ok) return { user: null, error: data };
  if (!data.access_token) return { user: null, error: { message: 'Supabase respondió sin access_token.' } };
  accessToken = data.access_token;
  const userResult = data.user ? { data: data.user, error: null } : await authRequest('user', 'GET');
  return { user: userResult.data, error: userResult.error };
};
export const signOutAdmin = () => { accessToken = ''; };
export const setRecoveryToken = (token: string) => { accessToken = token; };
export const exchangeRecoveryToken = async (tokenHash: string) => {
  const result = await authRequest(`verify?type=recovery&token=${encodeURIComponent(tokenHash)}`, 'GET');
  if (result.data?.access_token) accessToken = result.data.access_token;
  return result;
};
export const updateAdminPassword = (password: string) => authRequest('user', 'PUT', { password });
export const requestPasswordReset = (email: string, redirectTo: string) => authRequest('recover', 'POST', { email, redirect_to: redirectTo });
export const isCurrentAdmin = async (userId: string) => { const result = await request('admin_users', 'GET', `?select=user_id&user_id=eq.${encodeURIComponent(userId)}`); return !result.error && Array.isArray(result.data) && result.data.length > 0; };
export const loadRemoteData = async () => Promise.all([request('products', 'GET', '?select=*&order=name'), request('categories', 'GET', '?select=*&order=created_at')]);
export const saveRemoteProduct = (product: unknown) => request('products', 'POST', '?on_conflict=id', product);
export const deleteRemoteProduct = (id: string) => request('products', 'DELETE', `?id=eq.${encodeURIComponent(id)}`);
export const saveRemoteCategory = (category: unknown) => request('categories', 'POST', '?on_conflict=name', category);
export const deleteRemoteCategory = (name: string) => request('categories', 'DELETE', `?name=eq.${encodeURIComponent(name)}`);
