import React from 'react';
import { List, SimpleForm, TextInput, Datagrid, Edit, TextField} from 'react-admin';

export const ItemList = props => (
    <List {...props}>
        <Datagrid rowClick="edit">
            <TextField source="title" />
            <TextField source="description" />
        </Datagrid>
    </List>
);

export const ItemEdit = props => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="title" />
            <TextInput source="description" />
        </SimpleForm>
    </Edit>
);
