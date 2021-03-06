const express = require("express");
const tryCatch = require("../../middlewares/tryCatchMiddleware");
const { Appointment, User } = require("../../../common/model");
const logger = require("../../../common/logger");
const { getFormationsBySiretCfd } = require("../../utils/catalogue");

/**
 * Sample entity route module for GET
 */
module.exports = () => {
  const router = express.Router();

  /**
   * Get all formations getRequests /requests GET
   * */
  router.get(
    "/appointments",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 50) : 50;

      const allData = await Appointment.paginate(query, { page, limit });
      return res.send({
        appointments: allData.docs,
        pagination: {
          page: allData.page,
          resultats_par_page: limit,
          nombre_de_page: allData.pages,
          total: allData.total,
        },
      });
    })
  );

  /**
   * Get all formations getRequests /requests GET
   * */
  router.get(
    "/appointments/details",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const page = qs && qs.page ? qs.page : 1;
      const limit = qs && qs.limit ? parseInt(qs.limit, 50) : 50;

      const allData = await Appointment.paginate(query, { page, limit, sort: { created_at: -1 } });

      const appointmentsPromises = allData.docs.map(async (document) => {
        const [user, catalogue] = await Promise.all([
          User.findById(document.candidat_id),
          getFormationsBySiretCfd({ siret: document.etablissement_id, cfd: document.formation_id }),
        ]);

        let formation = [];
        if (catalogue.formations.length) {
          const [item] = catalogue.formations;

          formation = {
            etablissement: {
              entreprise_raison_sociale: item.etablissement_formateur_entreprise_raison_sociale,
            },
            formation: {
              intitule: item.intitule_long,
              adresse: item.etablissement_formateur_adresse,
              code_postal: item.etablissement_formateur_code_postal,
              ville: item.etablissement_formateur_nom_departement,
            },
          };
        }

        return {
          ...document._doc,
          formation,
          candidat: {
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
          },
        };
      });

      const appointments = await Promise.all(appointmentsPromises);

      return res.send({
        appointments,
        pagination: {
          page: allData.page,
          resultats_par_page: limit,
          nombre_de_page: allData.pages,
          total: allData.total,
        },
      });
    })
  );

  /**
   * Get countRequests requests/count GET
   */
  router.get(
    "/appointments/count",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const total = await Appointment.countDocuments(query);

      res.send({ total });
    })
  );

  /**
   * Get request getRequest /request GET
   */
  router.get(
    "/",
    tryCatch(async (req, res) => {
      let qs = req.query;
      const query = qs && qs.query ? JSON.parse(qs.query) : {};
      const retrievedData = await Appointment.findOne(query);
      if (retrievedData) {
        res.send(retrievedData);
      } else {
        res.send({ message: `Item doesn't exist` });
      }
    })
  );

  /**
   * Get request by id getRequestById /request/{id} GET
   */
  router.get(
    "/:id",
    tryCatch(async (req, res) => {
      const itemId = req.params.id;
      const retrievedData = await Appointment.findById(itemId);
      if (retrievedData) {
        res.send(retrievedData);
      } else {
        res.send({ message: `Item ${itemId} doesn't exist` });
      }
    })
  );

  /**
   * Add/Post an item validated by schema createRequest /request POST
   */
  router.post(
    "/",
    tryCatch(async ({ body }, res) => {
      const item = body;
      logger.info("Adding new request: ", item);
      const request = new Appointment(body);
      await request.save();
      res.send(request);
    })
  );

  /**
   * Update an item validated by schema updateRequest request/{id} PUT
   */
  router.put(
    "/:id",
    tryCatch(async ({ body, params }, res) => {
      const itemId = params.id;
      logger.info("Updating item: ", body);
      const result = await Appointment.findOneAndUpdate({ _id: itemId }, body, { new: true });
      res.send(result);
    })
  );

  /**
   * Delete an item by id deleteRequest request/{id} DELETE
   */
  router.delete(
    "/:id",
    tryCatch(async ({ params }, res) => {
      const itemId = params.id;
      await Appointment.findByIdAndDelete(itemId);
      res.send({ message: `Item ${itemId} deleted !` });
    })
  );

  return router;
};
