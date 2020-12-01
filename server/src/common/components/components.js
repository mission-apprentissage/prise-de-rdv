const { connectToMongo } = require("../mongodb");
const createUsers = require("./users");
const createMailer = require("../../common/mailer");
const config = require("config");

//commun express et jobs
module.exports = async (options = {}) => {
  const users = options.users || (await createUsers());

  return {
    users,
    db: options.db || (await connectToMongo()).db,
    mailer: options.mailer || createMailer({ smtp: { ...config.smtp, secure: false } }),
  };
};
