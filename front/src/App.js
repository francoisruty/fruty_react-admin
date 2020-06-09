// in src/App.js
import React from 'react';
import {fetchUtils, Admin, Resource} from 'react-admin';
import { ItemList, ItemEdit, ItemCreate } from './items';
import authProvider from './authProvider';

import simpleRestProvider from 'ra-data-simple-rest';

const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json' });
    }
    const token = localStorage.getItem('token');
    options.headers.set('Authorization', `Bearer ${token}`);
    const email = localStorage.getItem('email');
    options.headers.set('email', `${email}`);
    return fetchUtils.fetchJson(url, options);
}

const dataProvider = simpleRestProvider(window.location.origin + '/api', httpClient);

const App = () => (
  <Admin dataProvider={dataProvider} authProvider={authProvider}>
    <Resource name="items" list={ItemList} edit={ItemEdit} create={ItemCreate} />
  </Admin>
);

export default App;
