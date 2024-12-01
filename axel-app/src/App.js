import './App.css';
import 'handsontable/dist/handsontable.full.min.css';
import MyTable from './MyTable';
import logo from './assets/logo.png'; 
import ErrorBoundary from './ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <div className="app-container">
        <div className="logo-container">
          <img src={logo} alt="Логотип" className="logo" />
        </div>
        <h1>Axel</h1>
        <MyTable /> {/* компонент таблицы */}
      </div>
    </ErrorBoundary>
  );
};

export default App;
