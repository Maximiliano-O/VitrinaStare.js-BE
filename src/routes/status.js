const express = require("express");
const statusSchema = require("../models/status");

const router = express.Router();

// Crear un estado
// (Estado es el estado de revision, cada release nuevo va a poseer un estado por cada usuario que le corresponda revisar el release)
router.post("/status", (req, res) => {
  const status = statusSchema(req.body);
  status
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener todos los estados
router.get("/status", (req, res) => {
    statusSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener un estado específico
router.get("/status/:id", (req, res) => {
  const { id } = req.params;
  statusSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Eliminar un estado específico
router.delete("/status/:id", (req, res) => {
  const { id } = req.params;
  statusSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});


module.exports = router;