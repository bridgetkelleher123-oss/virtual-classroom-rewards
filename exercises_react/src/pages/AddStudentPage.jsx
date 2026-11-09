import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SKILLS = ['sit', 'look', 'listen', 'calm hands', 'quiet mouth', 'ready to learn'];

export const AddStudentPage = () => {

    const [name, setName] = useState('');
    const [starsNeeded, setStarsNeeded] = useState('5');
    const [reward, setReward] = useState('5 min drawing time');
    const [skills, setSkills] = useState([...SKILLS]);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    const toggleSkill = (skill) => {
        setSkills(skills.includes(skill)
            ? skills.filter(s => s !== skill)
            : [...skills, skill]);
    };

    const addStudent = async (e) => {
        e.preventDefault();
        setError('');

        const stars = Number(starsNeeded);
        if (!name.trim()) return setError("Please enter the student's name.");
        if (!Number.isInteger(stars) || stars < 1 || stars > 20)
            return setError('Stars needed must be a whole number from 1 to 20.');

        try {
            const response = await fetch('/students', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name: name.trim(), starsNeeded: stars, reward, skills })
            });
            if (response.status === 201) {
                navigate('/');                       // back to the roster
            } else {
                const body = await response.json().catch(() => ({}));
                setError(body.error || 'Failed to add the student. Please try again.');
            }
        } catch {
            setError("Can't reach the server. Check that it is running.");
        }
    };

    return (
        <main>
            <h1>Add a Student</h1>
            <form className="student-form" onSubmit={addStudent} noValidate>
                <label htmlFor="name">Student name</label>
                <input id="name" type="text" value={name} maxLength={40}
                    onChange={e => setName(e.target.value)} />

                <label htmlFor="stars">Stars needed</label>
                <input id="stars" type="number" min="1" max="20" value={starsNeeded}
                    onChange={e => setStarsNeeded(e.target.value)} />

                <label htmlFor="reward">Reward</label>
                <input id="reward" type="text" value={reward} maxLength={80}
                    onChange={e => setReward(e.target.value)} />

                <fieldset>
                    <legend>Skills that earn a star</legend>
                    {SKILLS.map(skill => (
                        <label key={skill} className="check">
                            <input type="checkbox" checked={skills.includes(skill)}
                                onChange={() => toggleSkill(skill)} /> {skill}
                        </label>
                    ))}
                </fieldset>

                {error && <p className="error" role="alert">{error}</p>}
                <button type="submit">Add Student</button>
            </form>
        </main>
    );
}

export default AddStudentPage;