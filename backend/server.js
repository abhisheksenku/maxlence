const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');

const {connectDB} = require('./config/database');
const {connectRedis} = require('./config/redis');
const User = require('./models/User');
require('dotenv').config();
//importing routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
app.use(morgan('dev'));
app.use(cors({
    
    origin:[process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'] ,
    credentials: true,
}));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: true }));
// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));
//mounting routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/', (req, res) => {
    res.send('Welcome to the User Management API');
});
//global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

(async() => {
    try {
        await connectDB();
        await connectRedis();
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to synchronize the database:', error);
    }
})();