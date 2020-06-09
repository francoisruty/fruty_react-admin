
export default {
    login: ({ username, password }) => {
        const email = username;
        const request = new Request(window.location.origin + '/api/authenticate', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });
        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(({ email, token }) => {
                localStorage.setItem('token', token);
                localStorage.setItem('email', email);
            });
    },
    logout: () => {
        localStorage.removeItem('token');
        return Promise.resolve();
    },
    checkError: error => {
        // ...
    },
    checkAuth: () => {
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    },
    getPermissions: () => {
        const role = 'user';
        return Promise.resolve(role);
    }
};
