const express = require("express");
const releaseSchema = require("../models/release");

const router = express.Router();

// Crear un release
router.post("/release", (req, res) => {
    console.log('Received release data:', req.body);
    const release = new releaseSchema(req.body);
  release
    .save()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener todos los releases
router.get("/release", (req, res) => {
  releaseSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener un release específico por su id
router.get("/release/:id", (req, res) => {
  const { id } = req.params;
  releaseSchema
    .findById(id)
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener todos los releases de un repositorio
router.get("/release/repository/:repositoryID", (req, res) => {
    const { repositoryID } = req.params;
    releaseSchema
        .find({ repositoryID })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
// eliminar un release
router.delete("/release/:id", (req, res) => {
  const { id } = req.params;
  releaseSchema
    .remove({ _id: id })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// actualizar datos de un release
router.put("/release/:id", (req, res) => {
  const { id } = req.params;
  const { name, age, email } = req.body;
  releaseSchema
    .updateOne({ _id: id }, { $set: { name, age, email } })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// añadir status a un release
router.post("/releases/:id/statuses", (req, res) => {
    const { id } = req.params;
    const statusData = req.body;

    releaseSchema
        .findById(id)
        .then((release) => {

            //Se ingresa el estado nuevo en el array de los status del release específico.
            release.statuses.push(statusData);


            return release.save();
        })
        .then((updatedRelease) => res.json(updatedRelease))
        .catch((error) => res.json({ message: error }));
});

//router.get("/release/:repositoryID", (req, res) => {
//    const { repositoryID } = req.params;
//    releaseSchema
//        .find({ repositoryID: repositoryID })
//        .then((data) => res.json(data))
//        .catch((error) => res.json({ message: error }));
//});

//Add status to the status list of a specific release

/*
router.post('/release/:id/status', async (req, res) => {
    const newStatus = req.body; // Access the status data directly from req.body

    try {
        // Find the release by ID and push new status into statuses
        const release = await releaseSchema.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { statuses: newStatus } },
            { new: true } // return updated release
        );

        // Extract all the isSafe values
        const isSafeValues = release.statuses.map(status => status.isSafe);

        // Count how many are true
        const countIsSafe = isSafeValues.reduce((sum, isSafe) => sum + (isSafe ? 1 : 0), 0);

        // Verify if the true count is more than half of total status count
        if (countIsSafe > release.statuses.length / 2) {
            release.verified = true;
        } else {
            release.verified = false;
        }

        // Save updated release information
        await release.save();

        // Return the updated release data
        res.json(release);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});
*/



router.post('/release/:id/status', async (req, res) => {
    const newStatus = req.body;

    try {
        const release = await releaseSchema.findOneAndUpdate(
            { _id: req.params.id },
            { $push: { statuses: newStatus } },
            { new: true } // return updated release
        );

        res.json(release);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

router.get('/release/:releaseId/:reviewerId/status', async (req, res) => {
    const { releaseId, reviewerId } = req.params;

    try {
        // Find the release by ID
        const release = await releaseSchema.findById(releaseId);

        if (!release) {
            return res.status(404).json({ message: 'Release not found' });
        }

        // Find the status in the release's statuses array matching the reviewer ID
        const status = release.statuses.find(status => status.reviewerID === reviewerId);

        if (!status) {
            return res.status(404).json({ message: 'Status not found' });
        }

        // Return the status ID
        res.json({ statusId: status._id });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/*
router.put('/release/:id/status/:statusId', async (req, res) => {
    const updatedStatus = req.body;

    try {
        // Find the release and update the specific status
        const release = await releaseSchema.findOne({ _id: req.params.id });
        const status = release.statuses.id(req.params.statusId);
        status.set(updatedStatus);

        await release.save();

        // Extract all the isSafe values
        const isSafeValues = release.statuses.map(status => status.isSafe);

        // Count how many are true
        const countIsSafe = isSafeValues.reduce((sum, isSafe) => sum + (isSafe ? 1 : 0), 0);

        // Verify if the true count is more than half of total status count
        if (countIsSafe > release.statuses.length / 2) {
            release.verified = true;
        } else {
            release.verified = false;
        }

        // Save updated release information
        await release.save();

        // Return the updated release data
        res.json(release);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});


 */

//Obtener el release mas reciente verificado de un repositorio
router.put('/release/:id/status/:statusId', async (req, res) => {
    const updatedStatus = req.body;

    try {
        // Encuentra el release y actualiza el estado específico
        const release = await releaseSchema.findOne({ _id: req.params.id });
        const status = release.statuses.id(req.params.statusId);
        status.set(updatedStatus);

        await release.save();

        //Caso Mayoria Rechaza:


        // Se determinal los valores de isReviewed (Ha sido revisado) y isSafe (Ha sido Aprobado)
        const reviewAndSafeValues = release.statuses.map(status => ({ isReviewed: status.isReviewed, isSafe: status.isSafe }));

        // Se cuentan cuantos cumplen la condicion
        const countConditionMet = reviewAndSafeValues.reduce((sum, reviewAndSafe) => sum + (reviewAndSafe.isReviewed && !reviewAndSafe.isSafe ? 1 : 0), 0);

        // Se verifica si la cantidad de status que cumplen la condición corresponde a la mayoría

        if (countConditionMet > release.statuses.length / 2) {
            // Ya que la mayoria de los usuarios que revisan han marcado "Rechazo"
            //Se elimina el release
            await releaseSchema.deleteOne({ _id: req.params.id });
            return res.json({ message: 'Release deleted' });
        }


        //Caso Mayoria Aprueba:


        // De determinan los valores de isSafe de los estatus
        const isSafeValues = release.statuses.map(status => status.isSafe);

        // Se cuentan cuantos son 'true'
        const countIsSafe = isSafeValues.reduce((sum, isSafe) => sum + (isSafe ? 1 : 0), 0);

        // Se verifica que la mayoria de los estados tienen la condición de "isSafe=True"

        //Si son mayoria, se marca el release como verificado
        if (countIsSafe > release.statuses.length / 2) {
            release.verified = true;
        } else {
            release.verified = false;
        }


        await release.save();


        res.json(release);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

//Obtener el release mas reciente verificado de un repositorio
router.get("/release/latest/:repositoryID", (req, res) => {
    const { repositoryID } = req.params;
    releaseSchema
        .findOne({ verified: true, repositoryID: repositoryID })
        .sort({ created_at: -1 })
        .then((data) => res.json(data))
        .catch((error) => res.json({ message: error }));
});
module.exports = router;
