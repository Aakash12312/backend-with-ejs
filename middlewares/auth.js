const JWT = require('jsonwebtoken');
const User = require('../models/user');

const checkCookies = (cookieName) => {
    return async (req, res, next) => {
        const token = req.cookies[cookieName];

        if (!token) {
            req.user = null;
            return next();
        }

        try {
            const decoded = JWT.verify(token, 'A@ka$h');
            const user = await User.findById(decoded.id);
            req.user = user;
            next();
        } catch (error) {
            req.user = null;
            next();
        }
    };
};

module.exports = checkCookies;
