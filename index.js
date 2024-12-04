const express = require('express');
const path = require('path');
const app = express();
const userRouter = require('./routes/user');
const blogRouter = require('./routes/blog');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const checkCookies = require('./middlewares/auth');
const Blog = require('./models/blog');


mongoose.connect('mongodb://localhost:27017/ejs')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(checkCookies("token"));

app.get("/", async (req, res) => {
    try {
        const blogs = await Blog.find({});
        res.render("home", {
            user: req.user,
            error: null,
            blogs: blogs
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.render("home", {
            user: req.user,
            blogs: [],
            error: "Failed to load blogs."
        });
    }
});

app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
