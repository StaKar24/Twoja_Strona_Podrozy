import { AuthProvider } from './context/AuthContext';
import MapView from './components/Map/MapView';
import Navbar from './components/Layout/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Navbar />
        <MapView />
      </div>
    </AuthProvider>
  );
}

export default App;