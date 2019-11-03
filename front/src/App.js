// in src/App.js
import React from 'react';
import { Admin, Resource, ListGuesser } from 'react-admin';
import simpleRestProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestProvider(window.location.origin + '/api');
const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="items" list={ListGuesser} />
  </Admin>
);

export default App;
