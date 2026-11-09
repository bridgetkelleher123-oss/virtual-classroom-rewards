import { useState } from 'react';

const STEPS = [
    'Tap "Award Star" (or the next empty star)',
    'Watch the chart fill up',
    'At the goal, a reward message appears',
    'Close the message with ✕ to return to the chart',
];

// Collapsed by default, so people who don't need help aren't buried in text.
function HowItWorks() {
    const [open, setOpen] = useState(false);

    return (
        <div className="how">
            <button type="button" className="how-tab" aria-expanded={open}
                aria-controls="how-steps" onClick={() => setOpen(!open)}>
                How it works {open ? '▴ Hide steps' : '▾ Show steps'}
            </button>
            {open && (
                <ol id="how-steps" className="how-steps">
                    {STEPS.map(step => <li key={step}>{step}</li>)}
                </ol>
            )}
        </div>
    );
}

export default HowItWorks;
