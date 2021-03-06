const assert = require("assert");
const httpTests = require("../../utils/httpTests");
const { administrator } = require("../../../src/common/roles");
const { sampleParameter, sampleUpdateParameter } = require("../../data/samples");
const { WidgetParameter } = require("../../../src/common/model");
const { referrers } = require("../../../src/common/model/constants/referrers");

httpTests(__filename, ({ startServer }) => {
  it("Vérifie qu'on peut consulter la liste des parametres de widget en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser, components } = await startServer();

    // Add parameter
    await components.widgetParameters.createParameter({
      etablissement_siret: sampleParameter.etablissement_siret,
      etablissement_raison_sociale: sampleParameter.etablissement_raison_sociale,
      formation_intitule: sampleParameter.formation_intitule,
      formation_cfd: sampleParameter.formation_cfd,
      email_rdv: sampleParameter.email_rdv,
      referrers: sampleParameter.referrers,
    });

    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const response = await httpClient.get("/api/widget-parameters/parameters", { headers: bearerToken });

    // Check API response
    assert.deepStrictEqual(response.status, 200);
    assert.ok(response.data.parameters);
    assert.deepStrictEqual(response.data.parameters.length, 1);
    assert.ok(response.data.pagination);
  });

  it("Vérifie qu'on peut décompter les parametres de widget en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser, components } = await startServer();

    // Add parameter
    await components.widgetParameters.createParameter({
      etablissement_siret: sampleParameter.etablissement_siret,
      etablissement_raison_sociale: sampleParameter.etablissement_raison_sociale,
      formation_intitule: sampleParameter.formation_intitule,
      formation_cfd: sampleParameter.formation_cfd,
      email_rdv: sampleParameter.email_rdv,
      referrers: sampleParameter.referrers,
    });

    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const response = await httpClient.get("/api/widget-parameters/parameters/count", { headers: bearerToken });

    // Check API response
    assert.deepStrictEqual(response.status, 200);
    assert.deepStrictEqual(response.data, { total: 1 });
  });

  it("Vérifie qu'on peut ajouter un parametre de widget en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const response = await httpClient.post("/api/widget-parameters/", sampleParameter, { headers: bearerToken });

    // Check API Response
    assert.deepStrictEqual(response.status, 200);
    assert.ok(response.data._id);
    assert.deepStrictEqual(response.data.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(response.data.etablissement_raison_sociale, sampleParameter.etablissement_raison_sociale);
    assert.deepStrictEqual(response.data.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(response.data.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(response.data.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(response.data.referrers.includes(referrers.LBA.code), true);

    // Check query db
    const found = await WidgetParameter.findById(response.data._id);
    assert.deepStrictEqual(found.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(found.etablissement_raison_sociale, sampleParameter.etablissement_raison_sociale);
    assert.deepStrictEqual(found.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(found.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(found.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(found.referrers.includes(referrers.LBA.code), true);
  });

  it("Vérifie qu'on peut récupérer un parametre de widget avec une requete en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser, components } = await startServer();

    // Add parameter
    await components.widgetParameters.createParameter({
      etablissement_siret: sampleParameter.etablissement_siret,
      etablissement_raison_sociale: sampleParameter.etablissement_raison_sociale,
      formation_intitule: sampleParameter.formation_intitule,
      formation_cfd: sampleParameter.formation_cfd,
      email_rdv: sampleParameter.email_rdv,
      referrers: sampleParameter.referrers,
    });

    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const response = await httpClient.get(
      "/api/widget-parameters/",
      { headers: bearerToken },
      { data: { etablissement_siret: sampleParameter.etablissement_siret } }
    );

    // Check API Response
    assert.deepStrictEqual(response.status, 200);
    assert.ok(response.data._id);
    assert.deepStrictEqual(response.data.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(response.data.etablissement_raison_sociale, sampleParameter.etablissement_raison_sociale);
    assert.deepStrictEqual(response.data.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(response.data.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(response.data.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(response.data.referrers.includes(referrers.LBA.code), true);
  });

  it("Vérifie qu'on peut récupérer un parametre de widget par son id en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const addedResponse = await httpClient.post("/api/widget-parameters/", sampleParameter, { headers: bearerToken });

    // Check API Response
    assert.deepStrictEqual(addedResponse.status, 200);
    assert.ok(addedResponse.data._id);
    assert.deepStrictEqual(addedResponse.data.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(
      addedResponse.data.etablissement_raison_sociale,
      sampleParameter.etablissement_raison_sociale
    );
    assert.deepStrictEqual(addedResponse.data.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(addedResponse.data.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(addedResponse.data.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(addedResponse.data.referrers.includes(referrers.LBA.code), true);

    // Check query db
    const getByIdResponse = await httpClient.get(`/api/widget-parameters/${addedResponse.data._id}`, {
      headers: bearerToken,
    });
    assert.deepStrictEqual(getByIdResponse.status, 200);
    assert.deepStrictEqual(getByIdResponse.data.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(
      getByIdResponse.data.etablissement_raison_sociale,
      sampleParameter.etablissement_raison_sociale
    );
    assert.deepStrictEqual(getByIdResponse.data.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(getByIdResponse.data.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(getByIdResponse.data.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(getByIdResponse.data.referrers.includes(referrers.LBA.code), true);
  });

  it("Vérifie qu'on peut mettre à jour un parametre de widget par son id en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const addedResponse = await httpClient.post("/api/widget-parameters/", sampleParameter, { headers: bearerToken });

    // Check API Response
    assert.deepStrictEqual(addedResponse.status, 200);
    assert.ok(addedResponse.data._id);
    assert.deepStrictEqual(addedResponse.data.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(
      addedResponse.data.etablissement_raison_sociale,
      sampleParameter.etablissement_raison_sociale
    );
    assert.deepStrictEqual(addedResponse.data.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(addedResponse.data.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(addedResponse.data.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(addedResponse.data.referrers.includes(referrers.LBA.code), true);

    // Check query db
    const updateResponse = await httpClient.put(
      `/api/widget-parameters/${addedResponse.data._id}`,
      sampleUpdateParameter,
      {
        headers: bearerToken,
      }
    );
    assert.deepStrictEqual(updateResponse.status, 200);
    assert.deepStrictEqual(updateResponse.data.etablissement_siret, sampleUpdateParameter.etablissement_siret);
    assert.deepStrictEqual(
      updateResponse.data.etablissement_raison_sociale,
      sampleUpdateParameter.etablissement_raison_sociale
    );
    assert.deepStrictEqual(updateResponse.data.formation_intitule, sampleUpdateParameter.formation_intitule);
    assert.deepStrictEqual(updateResponse.data.formation_cfd, sampleUpdateParameter.formation_cfd);
    assert.deepStrictEqual(updateResponse.data.email_rdv, sampleUpdateParameter.email_rdv);
    assert.deepStrictEqual(updateResponse.data.referrers.includes(referrers.PARCOURSUP.code), true);
  });

  it("Vérifie qu'on peut supprimer un parametre de widget par son id en tant qu'admin via la Route", async () => {
    const { httpClient, createAndLogUser } = await startServer();
    const bearerToken = await createAndLogUser("userAdmin", "password", { role: administrator });
    const addedResponse = await httpClient.post("/api/widget-parameters/", sampleParameter, { headers: bearerToken });

    // Check API Response
    assert.deepStrictEqual(addedResponse.status, 200);
    assert.ok(addedResponse.data._id);
    assert.deepStrictEqual(addedResponse.data.etablissement_siret, sampleParameter.etablissement_siret);
    assert.deepStrictEqual(
      addedResponse.data.etablissement_raison_sociale,
      sampleParameter.etablissement_raison_sociale
    );
    assert.deepStrictEqual(addedResponse.data.formation_intitule, sampleParameter.formation_intitule);
    assert.deepStrictEqual(addedResponse.data.formation_cfd, sampleParameter.formation_cfd);
    assert.deepStrictEqual(addedResponse.data.email_rdv, sampleParameter.email_rdv);
    assert.deepStrictEqual(addedResponse.data.referrers.includes(referrers.LBA.code), true);

    // Check query db
    const deleteResponse = await httpClient.delete(`/api/widget-parameters/${addedResponse.data._id}`, {
      headers: bearerToken,
    });
    assert.deepStrictEqual(deleteResponse.status, 200);

    // Check deletion
    const found = await WidgetParameter.findById(addedResponse.data._id);
    assert.strictEqual(found, null);
  });
});
