// in src/App.js
import React from 'react';
import { Admin, Resource} from 'react-admin';
import { ItemList, ItemEdit, ItemCreate } from './items';

import simpleRestProvider from 'ra-data-simple-rest';

const dataProvider = simpleRestProvider(window.location.origin + '/api');
const App = () => (
  <Admin dataProvider={dataProvider}>
    <Resource name="items" list={ItemList} edit={ItemEdit} create={ItemCreate} />
  </Admin>
);

export default App;
