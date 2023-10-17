import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import NewProject from './pages/NewProject';
import ProjectPage from './pages/ProjectPage';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/login" element={<Login/>}/>
      <Route path="/projects" element={<Home/>}/>
      <Route path="/projects/:id" element={<ProjectPage/>}/>
      <Route path="/projects/new" element={<NewProject/>}/>
    </Routes>
  </BrowserRouter>
);

reportWebVitals();
