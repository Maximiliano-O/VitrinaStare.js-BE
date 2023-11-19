const express = require("express");
const commentSchema = require("../models/comment");

const router = express.Router();

// Crear un comentario
router.post("/comments", (req, res) => {
    console.log('Received comment data:', req.body);
    const comment = commentSchema(req.body);
  comment
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener todos los comentarios
router.get("/comments", (req, res) => {
  commentSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener los comentarios
router.get("/comments/:id", (req, res) => {
  const { id } = req.params;
  commentSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener los comentarios de un repositorio específico
router.get('/comments/repository/:repositoryID', async (req, res) => {
    const repositoryID = req.params.repositoryID;
    try {
        const data = await commentSchema.find({ repositoryID: repositoryID });
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Obtener los comentarios de un usuario específico
router.get('/comments/author/:authorID', async (req, res) => {
    const authorID = req.params.authorID;
    try {
        const comments = await commentSchema.find({ authorID: authorID });
        res.json(comments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Eliminar un Comentario
router.delete("/comments/:id", (req, res) => {
    const { id } = req.params;
    commentSchema
        .remove({ _id: id })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});

// Actualizar un comentario
router.put("/comments/:id", async (req, res) => {
    const { id } = req.params;
    const { authorID, repositoryID, repoName, username, body } = req.body;
    try {
        const updatedComment = await commentSchema.findOneAndUpdate(
            { _id: id },
            { $set: { authorID, repositoryID, repoName, username, body } },
            { new: true }
        );
        res.json(updatedComment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
module.exports = router;
