import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Use Laravel's XSRF-TOKEN cookie so CSRF stays in sync across login/logout without full reloads
window.axios.defaults.xsrfCookieName = 'XSRF-TOKEN';
window.axios.defaults.xsrfHeaderName = 'X-XSRF-TOKEN';
// For same-origin requests this is enough; withCredentials is not required unless using a different subdomain
