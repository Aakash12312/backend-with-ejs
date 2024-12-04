const { Router } = require('express');
const Blog = require('../models/blog');
const User = require('../models/user');
const { enhanceContent } = require('../util/Groq');
const { summarizeContent } = require('../util/Groq');
const router = Router();

router.get('/addBlog', async (req, res) => {
    try {
        const users = await User.find({}, 'Name');
        res.render('addBlog', {
            user: req.user,
            users: users,
            error: null
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.render('addBlog', {
            user: req.user,
            users: [],
            error: "Failed to load user list."
        });
    }
});

router.get('/AI', async (req, res) => {
    try {
        const users = await User.find({}, 'Name');
        res.render('AI', {
            user: req.user,
            users: users,
            error: null
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.render('addBlog', {
            user: req.user,
            users: [],
            error: "Failed to load user list."
        });
    }
});

router.get("/yourBlogs", async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.user._id }).populate('author');
        return res.render("yourBlogs", {
            user: req.user,
            blogs: blogs,
            error: null
        });
    } catch (error) {
        console.error("Error fetching blogs:", error);
        return res.render("yourBlogs", {
            user: req.user,
            blogs: [],
            error: "Failed to load your blogs."
        });
    }
});


router.post('/:id/summarize', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate('author');

        if (!blog) {
            return res.render('blog', {
                user: req.user,
                blog: null,
                isSummarized: false,
                error: 'Blog not found.'
            });
        }

        const summarizedContent = await summarizeContent(blog.content);

        return res.render('blog', {
            user: req.user,
            blog: { ...blog.toObject(), content: summarizedContent },
            isSummarized: true, // Indicate that the blog is summarized
            error: null
        });
    } catch (error) {
        console.error('Error summarizing blog:', error);
        return res.render('blog', {
            user: req.user,
            blog: null,
            isSummarized: false,
            error: 'Failed to summarize the blog.'
        });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).populate("author");
        if (!blog) {
            return res.render("blog", {
                user: req.user,
                blog: null,
                isSummarized: false,
                error: "Blog not found.",
            });
        }

        return res.render("blog", {
            user: req.user,
            blog: blog,
            isSummarized: !!blog.isSummarized, // Assuming `isSummarized` is a field in your Blog model
            error: null,
        });
    } catch (error) {
        console.error("Error fetching blog:", error);
        return res.render("blog", {
            user: req.user,
            blog: null,
            isSummarized: false,
            error: "Failed to load the blog.",
        });
    }
});



router.post('/AI', async (req, res) => {
    const title = req.body.title;
    const temperature = parseFloat(req.body.temperature); // Get temperature from user input
    const language = req.body.language; // Get selected language
    const author = req.user._id;

    try {
        // Modify the prompt to include the language selection
        const enhancedPrompt = `Write a blog in ${language} based on the title: ${title}`;

        let content = await enhanceContent(enhancedPrompt, temperature); // Pass temperature dynamically
        content = content.replace(/\*/g, " ");
        
        const blog = await Blog.create({
            title: title,
            content: content,
            author: req.user._id,
        });

        return res.redirect('/');
    } catch (error) {
        console.error("Error while creating blog:", error);
        const users = await User.find({});
        return res.render('AI', {
            user: req.user,
            error: 'An error occurred while creating the blog.',
            users: users,
        });
    }
});


router.post('/', async (req, res) => {
    const { title, content} = req.body;
    const author = req.user._id;

    if (!title || !content || !author) {
        return res.render('addBlog', {
            user: req.user,
            error: 'Title, content, and author are required.',
        });
    }

    try {
        const blog = await Blog.create({
            title: title,
            content: content,
            author: author,
        });
        return res.redirect('/');
    } catch (error) {
        console.error("Error while creating blog:", error);
        return res.render('addBlog', {
            user: req.user,
            error: 'An error occurred while creating the blog.',
        });
    }
});

module.exports = router;
