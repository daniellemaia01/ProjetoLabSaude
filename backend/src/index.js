const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

const connectDatabase = require('./database/db.js');
const examTypeRouter = require('./routes/examType.route.js');
const userRoute = require('./routes/user.route.js');
const authRoute = require('./routes/auth.route.js');
const exam = require('./routes/exam.route.js');


dotenv.config();
connectDatabase();

const app = express();
app.use(express.json());
app.use(cors());

app.use('/users', userRoute);
app.use('/login', authRoute);
app.use('/examType', examTypeRouter);
app.use('/exam', exam);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
