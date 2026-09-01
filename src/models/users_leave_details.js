module.exports = function (sequelize, DataTypes) {
  let table_name = "users_leave_details";
  let columns = {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    leave_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "leave_type_master",
        key: "id",
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // DB column is NUMERIC(5,2) (03_leave_type_master.sql, "supports half-day, quarter-day
    // etc.") - was declared INTEGER here, which drifted from that and would coerce/truncate a
    // half-day's 0.5 fraction.
    total_days: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
    },
    is_half_day: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    attachment_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    applied_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    approved_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejected_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    rejected_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejected_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancelled_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    created_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updated_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    updated_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deleted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users_master",
        key: "id",
      },
    },
    deleted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  };
  let optional = {
    sequelize,
    tableName: "users_leave_details",
    schema: "public",
    timestamps: false,
  };
  return sequelize.define(table_name, columns, optional);
};
