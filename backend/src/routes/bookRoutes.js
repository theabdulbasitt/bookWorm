import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();


// create a book
router.post("/", protectRoute, async (req, res) => {
    try {

        const { title, caption, rating, image } = req.body;
        if (!image || !title || !caption || !rating) return res.status(400).json({ message: "Please provide all fields" });
        // upload image
        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;
        // save to the db
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json(newBook)

    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({ message: error.message })
    }
});

// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(books);
    } catch (error) {
        console.log("Error getting user books", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// delete
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(400).json({ message: "Book not found" });
        // check if the user is creator of the book
        if (book.user.toString() !== req.user._id.toString())
            return res.status(401).json({ message: "Unauthorised" });

        // delete the image fromt the cloudinary
        // https://res.cloudinary.com/de1rm4uto/image/upload/v1741568358/qyup61vejflxxw8igvi0.png
        if (book.image && book.image.includes("cloudinary")) {
            try {
                const publicId = book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleteing image from cloudinary", deleteError);
            }
        }
        await book.deleteOne();
        res.json({ message: "Book deleted successfully" });
    } catch (error) {
        console.log("Error deleting the book", error);
        res.status(500).json({ message: "Internal server error" });
    }
})

// update
// get all books
// pagination => infinite loading
router.get("/", protectRoute, async (req, res) => {
    // fetch("http://localhost:3000/api/books/?page=1&limit=5");  // req from frontend for pagination
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })  // descending order
            .skip(skip).limit(limit)
            .populate("user", "username profileImage");


        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks: totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.log("Error in get all book route", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// get single book



export default router; 
