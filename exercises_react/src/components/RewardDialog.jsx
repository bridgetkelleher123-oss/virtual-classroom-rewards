import { useEffect, useRef } from 'react';

// Shown once, right after the tap that reaches the goal. ✕ or the Escape key closes it.
function RewardDialog({ student, onClose }) {
    const closeButton = useRef(null);

    useEffect(() => {
        closeButton.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    return (
        <div className="overlay">
            <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="reward-title">
                <button ref={closeButton} type="button" className="pill dialog-close"
                    aria-label="Close" onClick={onClose}>✕</button>
                <h2 id="reward-title">{student.name} earned their reward!</h2>
                <p className="dialog-reward">{student.reward}</p>
                <p>Goal reached! {student.stars} of {student.starsNeeded} stars.</p>
            </div>
        </div>
    );
}

export default RewardDialog;
