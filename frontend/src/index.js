import './index.css';
import reportWebVitals from './reportWebVitals';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import NewProject from './pages/NewProject';
import ProjectPage from './pages/ProjectPage';
import { CookiesProvider } from 'react-cookie';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <CookiesProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/projects" element={<Home/>}/>
        <Route path="/projects/:id" element={<ProjectPage/>}/>
        <Route path="/projects/new" element={<NewProject/>}/>
      </Routes>
    </BrowserRouter>
  </CookiesProvider>
);

reportWebVitals();
