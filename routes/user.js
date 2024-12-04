const { Router } = require('express');
const User = require('../models/user');
const checkCookies = require('../middlewares/auth');
const router = Router();
const bcrypt = require('bcrypt');

router.use(checkCookies('token'));



router.get('/profile', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    try {
        const user = req.user;
        return res.render('profile', { user, error: null });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.render('profile', { user: null, error: 'Failed to load profile' });
    }
});

router.post('/profile/edit', async (req, res) => {
    if (!req.user) {
        return res.redirect('/login');
    }

    const { Name, Password } = req.body;

    try {
        const updates = { Name };

        // Hash new password if provided
        if (Password) {
            const salt = await bcrypt.genSalt(10);
            updates.Password = await bcrypt.hash(Password, salt);
        }

        await User.findByIdAndUpdate(req.user.id, updates);

        // Use absolute path for redirect
        return res.redirect('/user/profile');
    } catch (error) {
        console.error('Error updating profile:', error);
        return res.render('profile', { user: req.user, error: 'Failed to update profile' });
    }
});



router.get("/login", (req, res) => {
    return res.render("login", {
        error: null,
    });
});

router.get("/signup", (req, res) => {
    return res.render("signup", {
        error: null,
    });
});

router.post("/login", async (req, res) => {
    const { Email, Password } = req.body;

    try {
        const token = await User.passmatch(Email, Password);
        return res.cookie('token', token).redirect('/');
    } catch (error) {
        console.error(error);
        return res.render('login', {
            error: "Incorrect Email or Password"
        });
    }
});

router.post("/signup", (req, res) => {
    const { Name, Email, Password } = req.body;

    if (!Name || !Email || !Password) {
        return res.status(400).send("All fields are required");
    }
    User.create({ Name, Email, Password })
        .then(() => {
            res.redirect("/");
        })
        .catch((error) => {
            console.error("Error during signup:", error);
            res.status(400).send("Error during signup: " + error.message);
        });
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

module.exports = router;
