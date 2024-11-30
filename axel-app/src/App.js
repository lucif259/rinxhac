import React from 'react';
import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import MyTable from './MyTable';
import logo from './assets/logo.png'; 

const App = () => {
  return (
    <div>
      <img src={logo} alt="Логотип" style={{ width: '30px', height: 'auto' }} /> {}
      <MyTable /> {}
    </div>
  );
};
export default App;