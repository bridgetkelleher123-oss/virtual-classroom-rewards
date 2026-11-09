import { useState } from 'react'
import './App.css';
import Navigation from './components/Navigation';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import HomePage from './pages/HomePage';
import EditStudentPage from './pages/EditStudentPage';   
import AddStudentPage from './pages/AddStudentPage';     
import LoginPage from './pages/LoginPage';
import StarPage from './pages/StarPage';                

function App() {

  const [studentToEdit, setStudentToEdit] = useState();

  return (
    <div className="app">
      <Router>
        <header>
          <h1>Virtual Classroom Rewards</h1>
          <p>Track stars and rewards for your students.</p>
        </header>
        <Navigation />
        <Routes>
          <Route path="/" element={<HomePage setStudentToEdit={setStudentToEdit}/>}></Route>
          <Route path="/login" element={<LoginPage />}></Route>
          <Route path="/add-student" element={<AddStudentPage/>}></Route>
          <Route path="/edit-student" element={<EditStudentPage exerciseToEdit={studentToEdit}/>}></Route>
          <Route path="/chart/:id" element={<StarPage />}></Route>
        </Routes>
        <footer>
          <p>&copy; Bridget Kelleher Gabriel</p>
        </footer>
      </Router>
    </div>
  );
}

export default App;