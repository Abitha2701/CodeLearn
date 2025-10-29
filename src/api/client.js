const RAW_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function getApiBaseUrl() {
	const base = RAW_API_BASE_URL && RAW_API_BASE_URL.trim() ? RAW_API_BASE_URL : 'http://localhost:5001';
	return base.replace(/\/$/, '');
}

export const API_BASE_URL = getApiBaseUrl();

export function apiFetch(path, options = {}) {
	if (!path) {
		throw new Error('apiFetch requires a path');
	}
	const isAbsolute = /^https?:\/\//i.test(path);
	const url = isAbsolute ? path : `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
	return fetch(url, options);
}
