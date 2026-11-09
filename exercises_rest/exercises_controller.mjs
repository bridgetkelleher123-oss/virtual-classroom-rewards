
/**
 * Bridget Kelleher Gabriel
 *
 * REST API for the Virtual Classroom Rewards System.
 */
import 'dotenv/config';
import express from 'express';
import asyncHandler from 'express-async-handler';
import * as students from './exercises_model.mjs';

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

const notFound = (res) => res.status(404).json({ error: 'Student not found.' });

// Add a student (Class Roster page: "Add a Student")
app.post('/students', asyncHandler(async (req, res) => {
    const student = await students.createStudent(req.body);
    res.status(201).json(student);
}));

// List all students (Class Roster page and the names list on the star page)
app.get('/students', asyncHandler(async (req, res) => {
    res.status(200).json(await students.getStudents());
}));

// One student (star page)
app.get('/students/:id', asyncHandler(async (req, res) => {
    const student = await students.getStudent(req.params.id);
    student ? res.status(200).json(student) : notFound(res);
}));

// Edit a student (Edit Student page)
app.put('/students/:id', asyncHandler(async (req, res) => {
    const student = await students.updateStudent(req.params.id, req.body);
    student ? res.status(200).json(student) : notFound(res);
}));

// Award a star. "justEarned" is true only on the one tap that reaches the goal,
// so the reward message shows exactly once.
app.post('/students/:id/stars', asyncHandler(async (req, res) => {
    const result = await students.awardStar(req.params.id);
    if (!result) return notFound(res);
    if (result.conflict) {
        return res.status(409).json({
            error: `${result.student.name} has already reached the goal.`,
            student: result.student
        });
    }
    res.status(200).json({ student: result.student, justEarned: result.justEarned });
}));

// Turns validation problems into a readable 400 message instead of a crash.
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((e) => e.message).join(' ');
        return res.status(400).json({ error: message });
    }
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, async () => {
    await students.connect()
    console.log(`Server listening on port ${PORT}...`);
});
