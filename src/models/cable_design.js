module.exports = function (sequelize, DataTypes) {
    let table_name = 'cable_design';
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        cable_type: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        conductor_size: {
            type: DataTypes.NUMERIC(10, 3),
            allowNull: false
        },
        no_of_cores: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        conductor_material: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        insulation_material: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        outer_sheath_material: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        inner_sheath_material: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        construction_values: {
            type: DataTypes.JSONB,
            allowNull: false
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users_master', key: 'id' }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        deleted_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        pdf_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        pdf_template_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    };
    let optional = {
        sequelize,
        tableName: 'cable_design',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
