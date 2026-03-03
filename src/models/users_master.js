module.exports = function (sequelize, DataTypes) {
let table_name = "users_master";
let columns = {
    id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
    },
    first_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    mobile: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    username: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    designation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "designation_master",
            key: "id"
        },
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "role_master",
            key: "id"
        },
    },
    status: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true
    },
    last_password_modified: {
        type: DataTypes.DATE,
        allowNull: true
    },
    incorrect_password_attempts: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    account_block: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    profile_pic: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    theme: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "light",
    },
    menu_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
        defaultValue: "sidebar",
    },
    sidebar_lock: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
    },
    user_fcm_token: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users_master",
            key: "id"
        },
    },
    created_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    modified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users_master",
            key: "id"
        },
    },
    modified_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    middle_name: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    work_email: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    dob: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    marital_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "marital_status_master",
            key: "id"
        },
    },
    nationality_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "country_master",
            key: "id"
        },
    },
    current_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    permanent_address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    doj: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "department_master",
            key: "id"
        },
    },
    reporting_manager_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "users_master",
            key: "id"
        },
    },
    gender_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "gender_master",
            key: "id"
        },
    },
    blood_group_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "blood_group_master",
            key: "id"
        },
    },
    emp_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: "emp_type_master",
            key: "id"
        },
    },
};
let optional = {
    sequelize,
    tableName: "users_master",
    schema: "public",
    timestamps: false,
};
return sequelize.define(table_name, columns, optional);
};
