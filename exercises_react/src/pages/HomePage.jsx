import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function HomePage({ setStudentToEdit }) {
    const [students, setStudents] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const loadStudents = async () => {
        try {
            const response = await fetch('/students');
            if (!response.ok) throw new Error();
            setStudents(await response.json());
        } catch {
            setError("Can't load the class roster. Check that the server is running.");
        }
    };

    useEffect(() => {
        loadStudents();
    }, []);

    const onEdit = (student) => {
        setStudentToEdit(student);
        navigate('/edit-student');
    };

    return (
        <main>
            <h1>My Class</h1>
            {error && <p className="error" role="alert">{error}</p>}
            {students.length === 0 && !error && <p>No students yet. Add your first student.</p>}
            <ul className="names">
                {students.map((s) => (
                    <li key={s._id}>
                        <Link to={`/chart/${s._id}`}>{s.name}</Link>
                        <button type="button" onClick={() => onEdit(s)}>Edit</button>
                    </li>
                ))}
            </ul>
            <Link to="/add-student" className="btn">+ Add student</Link>
        </main>
    );
}

export default HomePage;