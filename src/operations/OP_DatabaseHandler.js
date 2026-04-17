const { responseCodes } = require("../services/baseReponse");
// const { sendNotification } = require("../services/notificationService");
const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const { sequelize, db_prod } = require("../config/database-connection");
const fs = require("fs");
const path = require("path");
const queryInterface = sequelize.getQueryInterface();

exports.getAllTables = async function () {
  try {
    var files = fs.readdirSync("./src/models", (e, files) => {
      if (e) {
        return err;
      } else {
        return files;
      }
    });
    var models = [];
    files.forEach((item) => {
      var file = path.parse(item).name;
      models.push(String(file));
    });
    var str_models = "'" + models.join("', '") + "'";
    var local_query =
      `SELECT tab.table_name, COUNT(col.*) AS total_columns,
		(
			CASE
			WHEN tab.table_name IN (` +
      str_models +
      `) THEN 'TRUE' 
			ELSE 'FALSE'
			END
		) AS model_exist 
		FROM information_schema.tables AS tab 
		LEFT JOIN information_schema.columns AS col ON col.table_name = tab.table_name 
		WHERE tab.table_schema = 'public'
		GROUP BY tab.table_name;`;
    var data = await sequelize.query(local_query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.createModel = async function (body) {
  try {
    var table_name = body.table_name;

    var query =
      `SELECT col.ordinal_position as col_id, col.column_name, 
			col.data_type, col.is_nullable, col.column_default, 
			CASE WHEN kcu.constraint_name IS NOT NULL THEN 'true' ELSE NULL END AS relation, 
			rel.table_name as foreign_table, rel.column_name as primary_key 
			FROM information_schema.columns col 
			LEFT JOIN (
				SELECT kcu.constraint_name, kcu.table_schema, 
				kcu.table_name, kcu.column_name, kcu.ordinal_position, 
				kcu.position_in_unique_constraint 
				FROM information_schema.key_column_usage kcu 
				JOIN information_schema.table_constraints tco ON kcu.constraint_schema = tco.constraint_schema 
				AND kcu.constraint_name = tco.constraint_name 
				AND tco.constraint_type = 'FOREIGN KEY'
			) AS kcu ON col.table_schema = kcu.table_schema AND col.table_name = kcu.table_name AND col.column_name = kcu.column_name 
			LEFT JOIN information_schema.referential_constraints rco ON rco.constraint_name = kcu.constraint_name AND rco.constraint_schema = kcu.table_schema 
			LEFT JOIN information_schema.key_column_usage rel ON rel.constraint_name = rco.unique_constraint_name AND rco.unique_constraint_schema = rel.constraint_schema AND rel.ordinal_position = kcu.position_in_unique_constraint 
			WHERE col.table_name = '` +
      table_name +
      `' 
			ORDER BY col_id;`;

    var result = await sequelize.query(query, {
      type: QueryTypes.SELECT,
    });

    var objArr = [];

    result.forEach((element) => {
      if (element.col_id == 1) {
        objArr.push({
          [element.column_name]: {
            autoIncrement: true,
            type: "DataTypes.BIGINT",
            allowNull: false,
            primaryKey: true,
          },
        });
      } else {
        var data_type = null;
        if (element.data_type == "ARRAY") {
          data_type = "ARRAY(DataTypes.TEXT)";
        }
        if (element.data_type == "double precision") {
          data_type = "DOUBLE";
        }
        if (element.data_type == "integer") {
          data_type = "INTEGER";
        }
        if (element.data_type == "date") {
          data_type = "DATEONLY";
        }
        if (element.data_type == "character varying") {
          data_type = "STRING(255)";
        }
        if (element.data_type == "timestamp without time zone") {
          data_type = "DATE";
        }
        if (element.data_type == "text") {
          data_type = "TEXT";
        }
        if (element.data_type == "boolean") {
          data_type = "BOOLEAN";
        }
        var data_type_final = "DataTypes." + data_type;
        if (element.relation == null) {
          if (
            element.column_default != null &&
            element.column_default != "CURRENT_TIMESTAMP" &&
            element.col_id != 1
          ) {
            objArr.push({
              [element.column_name]: {
                type: data_type_final,
                allowNull: element.is_nullable == "NO" ? false : true,
                defaultValue: element.column_default,
              },
            });
          } else {
            objArr.push({
              [element.column_name]: {
                type: data_type_final,
                allowNull: element.is_nullable == "NO" ? false : true,
              },
            });
          }
        } else {
          objArr.push({
            [element.column_name]: {
              type: data_type_final,
              allowNull: element.is_nullable == "NO" ? false : true,
              references: {
                model: element.foreign_table,
                key: element.primary_key,
              },
            },
          });
        }
      }
    });

    var obj = objArr.reduce(function (result, current) {
      return Object.assign(result, current);
    }, {});

    var model_file_name = table_name;
    var model_file_path = "./src/models/" + model_file_name + ".js";
    var stream = fs.createWriteStream(model_file_path);
    stream.once("open", (fd) => {
      stream.write("module.exports = function (sequelize, DataTypes) {");
      stream.write("\n");
      stream.write("let table_name = '" + table_name + "';");
      stream.write("\n");
      stream.write("let columns = {");
      stream.write("\n");
      for (const [k, v] of Object.entries(obj)) {
        var json = JSON.stringify(v);
        var value = json.replace(/"([^"]+)":/g, "$1:");
        stream.write(k + ":");
        let obj1 = value.replaceAll('"', "");

        if (obj1.indexOf("model:") > 0) {
          var model = obj1.substring(
            obj1.indexOf("model:") + 6,
            obj1.lastIndexOf(",key:")
          );
          var new_model = "'" + model + "'";
          obj1 = obj1.replaceAll(model, new_model);
        }
        if (obj1.indexOf("key:") > 0) {
          var key = obj1.substring(
            obj1.indexOf("key:") + 4,
            obj1.lastIndexOf("}}")
          );
          var new_key = "'" + key + "'";
          obj1 = obj1.replaceAll(key, new_key);
        }

        let obj2 = obj1.replaceAll(",", ",\n");
        stream.write(obj2);
        stream.write(",");
        stream.write("\n");
      }
      stream.write("};");
      stream.write("\n");
      stream.write("let optional = {");
      stream.write("sequelize,");
      stream.write("\n");
      stream.write("tableName: '" + table_name + "',");
      stream.write("\n");
      stream.write("schema: 'public',");
      stream.write("\n");
      stream.write("timestamps: false");
      stream.write("\n");
      stream.write("};");
      stream.write("\n");
      stream.write("return sequelize.define(table_name, columns, optional);");
      stream.write("\n");
      stream.write("};");
      stream.end();
    });
    responseCodes.SUCCESS.data = obj;
    responseCodes.SUCCESS.message = "Model Created Successfully";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};

exports.getOneTableDetails = async function (body) {
  try {
    let local_query = `SELECT *, (SELECT COUNT(*) FROM "${body.table_name}") AS total_rows
						   FROM INFORMATION_SCHEMA.COLUMNS
						   WHERE TABLE_NAME = N'${body.table_name}'
						   ORDER BY ordinal_position ASC ;`;
    let data = await sequelize.query(local_query, {
      type: QueryTypes.SELECT,
    });
    responseCodes.SUCCESS.data = data;
    responseCodes.SUCCESS.message = "";
    return responseCodes.SUCCESS;
  } catch (e) {
    
    responseCodes.BAD_REQUEST.data = e;
    responseCodes.BAD_REQUEST.message = "Failed to Load Data";
    return responseCodes.BAD_REQUEST;
  }
};
