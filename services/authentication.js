const JWT = require('jsonwebtoken');
const secret = "A@ka$h";

function generateToken(user) {
    const payload = {
        id: user.id,
        email: user.Email,
        role: user.roles,
        name: user.Name,
    };
    const token = JWT.sign(payload, secret);
    return token;
}

function verifyToken(token) {
    try {
        const decoded = JWT.verify(token, secret);
        return decoded;
    } catch (error) {
        return null;
    }
}

module.exports = { generateToken, verifyToken };
