/**
 * Bridget Kelleher Gabriel
 *
 * Student model for the Virtual Classroom Rewards System.
*/
import mongoose from 'mongoose';
import 'dotenv/config';

const REWARDS_DB_NAME = 'rewards_db';

let connection = undefined;

/**
 * This function connects to the MongoDB server and to the database
 *  'rewards_db' in that server.
 */
async function connect(){
    try{
        connection = await mongoose.connect(process.env.MONGODB_CONNECT_STRING,
                {dbName: REWARDS_DB_NAME});
        console.log("Successfully connected to MongoDB using Mongoose!");
    } catch(err){
        console.log(err);
        throw Error(`Could not connect to MongoDB ${err.message}`)
    }
}

/** The skills a teacher can pick for a student's chart. */
const SKILLS = ['sit', 'look', 'listen', 'calm hands', 'quiet mouth', 'ready to learn'];

// Define the schema: what a student looks like in the database
const studentSchema = mongoose.Schema({
    name: { type: String, required: [true, 'Please enter a name.'], trim: true, maxlength: 40 },
    starsNeeded: {
        type: Number,
        required: true,
        default: 5,
        min: [1, 'Stars needed must be at least 1.'],
        max: [20, 'Stars needed can be at most 20.'],
        validate: { validator: Number.isInteger, message: 'Stars needed must be a whole number.' }
    },
    stars: { type: Number, default: 0, min: 0 },
    reward: { type: String, default: '5 min drawing time', trim: true, maxlength: 80 },
    skills: {
        type: [String],
        default: () => [...SKILLS],
        validate: { validator: (list) => list.every((s) => SKILLS.includes(s)), message: 'Unknown skill.' }
    }
}, { timestamps: true });

// Compile the model from the schema
const Student = mongoose.model('Student', studentSchema);

// Only these fields can be changed from the pages. (Stars change only through awardStar.)
const EDITABLE = ['name', 'starsNeeded', 'reward', 'skills'];
const pickEditable = (body) =>
    Object.fromEntries(EDITABLE.filter((key) => body?.[key] !== undefined).map((key) => [key, body[key]]));

/** Adds a student. */
const createStudent = async (body) => {
    return Student.create(pickEditable(body));
}

/** All students, A to Z. */
const getStudents = async () => {
    return Student.find().sort({ name: 1 }).collation({ locale: 'en' });
}

/** One student, or null when the id is not found. */
const getStudent = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;
    return Student.findById(id);
}

/**
 * Changes name, stars needed, reward or skills. Returns null when not found.
 * Throws a validation error if the new goal is lower than the stars already earned.
 */
const updateStudent = async (id, body) => {
    const student = await getStudent(id);
    if (!student) return null;

    student.set(pickEditable(body));
    if (student.stars > student.starsNeeded) {
        const err = new mongoose.Error.ValidationError();
        err.addError('starsNeeded', new mongoose.Error.ValidatorError({
            message: `${student.name} already has ${student.stars} stars, so stars needed can't be lower than that.`
        }));
        throw err;
    }
    return student.save();
}

/**
 * Awards one star.
 * Checking "stars < starsNeeded" and adding 1 happen in ONE database operation,
 * so two quick taps can never push a student past the goal, and only one request
 * can be the one that reaches it ("justEarned").
 * Returns null if the student isn't found, or {conflict: true, student}
 * if the goal was already reached.
 */
const awardStar = async (id) => {
    if (!mongoose.isValidObjectId(id)) return null;

    const updated = await Student.findOneAndUpdate(
        { _id: id, $expr: { $lt: ['$stars', '$starsNeeded'] } },
        { $inc: { stars: 1 } },
        { new: true }
    );

    if (!updated) {
        const existing = await Student.findById(id);
        return existing ? { conflict: true, student: existing } : null;
    }
    return { student: updated, justEarned: updated.stars === updated.starsNeeded };
}

export { connect, createStudent, getStudents, getStudent, updateStudent, awardStar };
