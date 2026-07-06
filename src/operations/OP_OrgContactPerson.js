const {
  orgContactPerson,
  orgContactNumbers,
  orgContactEmail,
  orgAddresses,
  designationMaster,
} = require("../models");
const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");

exports.getAllData = async function () {
  try {
    const data = await orgContactPerson.findAll({ order: [["id", "DESC"]] });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneData = async function (id) {
  try {
    const data = await orgContactPerson.findAll({ where: { id } });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

// Contacts tab: one person + all of their phone numbers + all of their emails, nested.
exports.getOrgContactPersons = async function (org_id) {
  try {
    const data = await orgContactPerson.findAll({
      where: { org_id },
      include: [
        { model: designationMaster, as: "designation_master", required: false },
        { model: orgAddresses, as: "org_address", required: false },
        { model: orgContactNumbers, as: "org_contact_numbers", required: false },
        { model: orgContactEmail, as: "org_contact_emails", required: false },
      ],
      order: [["id", "DESC"]],
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Contacts";
    return responseCodes.BAD_REQUEST;
  }
};

// Shared by addRow (new person + numbers[] + emails[]) and addPersonContactEmail
// (more numbers[]/emails[] for an existing person, via body.cont_id).
async function createContactBundle(body) {
  const t = await sequelize.transaction();
  try {
    let contId = body.cont_id || null;
    let personId = null;

    if (body.contact_person_data) {
      const person = await orgContactPerson.create(body.contact_person_data, { transaction: t });
      personId = person.id;
      contId = person.id;
    }

    if (Array.isArray(body.contact_numbers_data) && body.contact_numbers_data.length > 0) {
      const numbers = body.contact_numbers_data.map((n) => ({ ...n, cont_id: contId }));
      await orgContactNumbers.bulkCreate(numbers, { transaction: t });
    }

    if (Array.isArray(body.contact_email_data) && body.contact_email_data.length > 0) {
      const emails = body.contact_email_data.map((e) => ({ ...e, cont_id: contId }));
      await orgContactEmail.bulkCreate(emails, { transaction: t });
    }

    await t.commit();
    responseCodes.SUCCESS.data = personId || contId;
    responseCodes.SUCCESS.message = "Contact Saved Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    console.log(e);
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Save Contact";
    return responseCodes.BAD_REQUEST;
  }
}

exports.addData = async function (body) {
  return createContactBundle(body);
};

exports.addPersonContactEmail = async function (body) {
  return createContactBundle(body);
};

exports.updateData = async function (body) {
  try {
    await orgContactPerson.update(body.data, { where: { id: body.id } });
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Contact Updated Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Update Contact";
    return responseCodes.BAD_REQUEST;
  }
};

// org_contact_person/numbers/email carry no soft-delete column, so this removes
// the person and cascades to their numbers/emails inside one transaction.
exports.deleteData = async function (body) {
  const t = await sequelize.transaction();
  try {
    await orgContactNumbers.destroy({ where: { cont_id: body.id }, transaction: t });
    await orgContactEmail.destroy({ where: { cont_id: body.id }, transaction: t });
    await orgContactPerson.destroy({ where: { id: body.id }, transaction: t });
    await t.commit();
    responseCodes.SUCCESS.data = null;
    responseCodes.SUCCESS.message = "Contact Deleted Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    await t.rollback();
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Delete Contact";
    return responseCodes.BAD_REQUEST;
  }
};
