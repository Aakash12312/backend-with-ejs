const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
    roles: {
        type: String,
        default: 'user', 
    },
});

userSchema.pre('save', async function(next) {
    if (this.isModified('Password')) {
        const salt = await bcrypt.genSalt(10);
        this.Password = await bcrypt.hash(this.Password, salt);
    }
    next();
});

userSchema.statics.passmatch = async function(Email, Password) {
    const user = await this.findOne({ Email });
    if (!user) {
        throw new Error('Incorrect Email');
    }
    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
        throw new Error('Incorrect Password');
    }
    const token = jwt.sign({ id: user._id, Name: user.Name, Email: user.Email, role: user.roles }, 'A@ka$h');
    return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
