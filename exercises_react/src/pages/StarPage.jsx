import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaGift, FaChair, FaEye, FaAssistiveListeningSystems, FaHandPaper, FaVolumeMute, FaBookOpen } from 'react-icons/fa';
import HowItWorks from '../components/HowItWorks';
import RewardDialog from '../components/RewardDialog';
import ConfirmStarDialog from '../components/ConfirmStarDialog';

const PAUSE_MS = 700;   // pause after each tap, so a double-tap can't award two stars

// Reads the JSON body, or throws an Error whose message is safe to show the teacher.
async function readJson(response) {
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
        const err = new Error(body.error || 'Something went wrong. Please try again.');
        err.body = body;
        throw err;
    }
    return body;
}

// One icon for each skill a teacher can pick (names must match the skills on the Add Student page)
const SKILL_ICONS = {
    'sit': FaChair,
    'look': FaEye,
    'listen': FaAssistiveListeningSystems,
    'calm hands': FaHandPaper,
    'quiet mouth': FaVolumeMute,
    'ready to learn': FaBookOpen,
};

function StarPage() {
    const { id } = useParams();
    const [students, setStudents] = useState([]);
    const [student, setStudent] = useState(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const [showReward, setShowReward] = useState(false);
    const [confirming, setConfirming] = useState(false);   // is the "Give star?" box open

    useEffect(() => {
        let cancelled = false;
        setStudent(null);
        setError('');
        setShowReward(false);
        setConfirming(false);

        const load = async () => {
            try {
                const [list, one] = await Promise.all([
                    fetch('/students').then(readJson),
                    fetch(`/students/${id}`).then(readJson),
                ]);
                if (!cancelled) { setStudents(list); setStudent(one); }
            } catch (err) {
                if (!cancelled) setError(err.message || "Can't reach the server. Check that it is running.");
            }
        };
        load();
        return () => { cancelled = true; };
    }, [id]);

    const closeReward = useCallback(() => setShowReward(false), []);

    const askToAward = () => {
        if (busy || !student) return;
        setConfirming(true);
    };
    const cancelAward = useCallback(() => setConfirming(false), []);

    const awardStar = async () => {
        setConfirming(false);
        if (busy || !student) return;
        setBusy(true);
        setError('');
        try {
            const result = await fetch(`/students/${student._id}/stars`, { method: 'POST' }).then(readJson);
            setStudent(result.student);
            if (result.justEarned) setShowReward(true);   // the server says THIS tap reached the goal
        } catch (err) {
            if (err.body?.student) setStudent(err.body.student);
            setError(err.message || "Can't reach the server. Check that it is running.");
        }
        setTimeout(() => setBusy(false), PAUSE_MS);
    };

    if (!student) {
        return (
            <main>
                {error
                    ? <p className="error" role="alert">{error}</p>
                    : <p>Loading…</p>}
                <p><Link to="/">‹ Back to class roster</Link></p>
            </main>
        );
    }

    const done = student.stars >= student.starsNeeded;

    return (
        <main>
            <div className="star-top">
                <HowItWorks />
                <p className="awarding">
                    <strong>Awarding to: {student.name}</strong> (not {student.name}? tap another name)
                </p>
                <Link className="pill" to="/">‹ Back to class roster</Link>
            </div>

            <div className="star-body">
                <ul className="names">
                    {students.map(s => (
                        <li key={s._id}>
                            <Link to={`/chart/${s._id}`} className={s._id === student._id ? 'current' : ''}
                                aria-current={s._id === student._id ? 'page' : undefined}>{s.name}</Link>
                        </li>
                    ))}
                </ul>

                <section>
                    <h1>{student.name}'s Star Chart</h1>

                    <div className="stars" role="img" aria-label={`${student.stars} of ${student.starsNeeded} stars`}>
                        {Array.from({ length: student.starsNeeded }, (_, i) => {
                            if (i < student.stars) return <FaStar key={i} className="star on" aria-hidden="true" />;
                            if (i === student.stars) {
                                return (
                                    <button key={i} type="button" className="star-btn" disabled={busy}
                                        title="Tap to give the next star" aria-label="Tap to give the next star"
                                        onClick={askToAward}>
                                        <FaRegStar className="star" aria-hidden="true" />
                                    </button>
                                );
                            }
                            return <FaRegStar key={i} className="star" aria-hidden="true" />;
                        })}
                    </div>

                    <div className="award-row">
                        <div>
                            <button type="button" className="btn big" onClick={askToAward} disabled={busy || done}>
                                {done ? 'Goal reached' : 'Award Star'}
                            </button>
                            <p className="note">You'll be asked to confirm.<br />Stars can't be taken away.</p>
                        </div>
                        <div>
                            <p className="count">{student.stars} of {student.starsNeeded} stars</p>
                            <div className="card">
                                <p className="card-title"><FaStar className="card-icon" aria-hidden="true" /> <strong>Stars are for:</strong></p>
                                {student.skills.length > 0 ? (
                                    <ul className="skill-list">
                                        {student.skills.map(skill => {
                                            const Icon = SKILL_ICONS[skill] || FaStar;
                                            return (
                                                <li key={skill}>
                                                    <span className="skill-icon" aria-hidden="true"><Icon /></span>
                                                    <span>{skill}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p>what the teacher chooses</p>
                                )}
                                <p className="card-title"><FaGift className="card-icon" aria-hidden="true" /> <strong>At {student.starsNeeded} stars:</strong> {student.reward}</p>
                            </div>
                        </div>
                    </div>

                    {error && <p className="error" role="alert">{error}</p>}
                </section>
            </div>

            {confirming && <ConfirmStarDialog student={student} onConfirm={awardStar} onCancel={cancelAward} />}
            {showReward && <RewardDialog student={student} onClose={closeReward} />}
        </main>
    );
}

export default StarPage;
