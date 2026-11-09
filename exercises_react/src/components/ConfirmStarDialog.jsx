import { useEffect, useRef } from 'react';

// Asks the teacher to confirm before a star is given.
// Cancel (or the Escape key) closes it without giving a star.
function ConfirmStarDialog({ student, onConfirm, onCancel }) {
    const cancelButton = useRef(null);

    useEffect(() => {
        cancelButton.current?.focus();   // starts on Cancel so a stray Enter key can't give a star
        const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);

    return (
        <div className="overlay">
            <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
                <h2 id="confirm-title">Give {student.name} a star?</h2>
                <p>This will be star {student.stars + 1} of {student.starsNeeded}.</p>
                <div className="dialog-actions">
                    <button ref={cancelButton} type="button" className="btn" onClick={onCancel}>Cancel</button>
                    <button type="button" className="btn big" onClick={onConfirm}>Yes, give star</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmStarDialog;
