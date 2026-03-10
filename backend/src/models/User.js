import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    profileImage: {
        type: String,
        default: ""
    }
}, { timestamps: true });


// hash password before saving to the db
userSchema.pre("save", async function () {   // pre save hook 

    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(8);   // the salt is used in genrating a hash passsword to avoid rainbow table aatack
    this.password = await bcrypt.hash(this.password, salt);

});


userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;