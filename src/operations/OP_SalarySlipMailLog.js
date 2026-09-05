const { responseCodes } = require("../services/baseReponse");
const { sequelize } = require("../config/database-connection");
const { QueryTypes } = require("sequelize");

// Common "Mail Log" feed - a union of every document-email audit table (Salary Slip, Increment
// Letter, Credentials Mail, Custom Mail, and any future document type), rather than a separate
// log screen per document. `id` is prefixed per source table (S.../I.../C.../X...) since each
// table's own BIGSERIAL ids overlap and PrimeNG's p-table dataKey needs a value that's unique
// across the combined row set; `document_url`, `mail_body` and `attachment_urls` are generic
// fields the frontend renders regardless of which table a row actually came from - null for any
// source table that doesn't track that particular thing (only Custom Mail stores a body or
// more than one attachment today).
exports.getAllData = async function () {
  try {
    const query = `
      select 'S' || sml.id::text as id, 'Salary Slip' as mail_type,
             concat(eu.first_name, ' ', eu.last_name) as employee_name,
             sml.recipient_email, sml.subject, sml.status,
             concat(su.first_name, ' ', su.last_name) as sent_by_name,
             sml.sent_date, sml.slip_url as document_url,
             sml.payment_month, sml.payment_year,
             null::text as mail_body, null::text as attachment_urls
      from salary_slip_mail_log sml
      join users_master eu on eu.id = sml.user_id
      left join users_master su on su.id = sml.sent_by

      union all

      select 'I' || iml.id::text as id, 'Increment Letter' as mail_type,
             concat(eu.first_name, ' ', eu.last_name) as employee_name,
             iml.recipient_email, iml.subject, iml.status,
             concat(su.first_name, ' ', su.last_name) as sent_by_name,
             iml.sent_date, iml.letter_url as document_url,
             null::smallint as payment_month, null::smallint as payment_year,
             null::text as mail_body, null::text as attachment_urls
      from increment_letter_mail_log iml
      join users_master eu on eu.id = iml.user_id
      left join users_master su on su.id = iml.sent_by

      union all

      select 'C' || cml.id::text as id, 'Credentials Mail' as mail_type,
             concat(eu.first_name, ' ', eu.last_name) as employee_name,
             cml.recipient_email, cml.subject, cml.status,
             concat(su.first_name, ' ', su.last_name) as sent_by_name,
             cml.sent_date, null::varchar as document_url,
             null::smallint as payment_month, null::smallint as payment_year,
             null::text as mail_body, null::text as attachment_urls
      from credentials_mail_log cml
      join users_master eu on eu.id = cml.user_id
      left join users_master su on su.id = cml.sent_by

      union all

      select 'X' || xml.id::text as id, 'Custom Mail' as mail_type,
             null::varchar as employee_name,
             xml.recipient_email, xml.subject, xml.status,
             concat(su.first_name, ' ', su.last_name) as sent_by_name,
             xml.sent_date, null::varchar as document_url,
             null::smallint as payment_month, null::smallint as payment_year,
             xml.body as mail_body, xml.attachment_urls
      from custom_mail_log xml
      left join users_master su on su.id = xml.sent_by

      order by sent_date desc;`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
