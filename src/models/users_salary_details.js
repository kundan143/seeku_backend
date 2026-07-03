module.exports = function (sequelize, DataTypes) {
    let table_name = 'users_salary_details';
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        other_user_name: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        ctc: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        basic_salary: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        dearness_allowance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        city_allowance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        hra: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        conveyance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        medical_allowance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        lta: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        special_allowance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        bonus: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        pf_employee: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        professional_tax: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        income_tax: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        employee_state_insurance: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        loan_deduction: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        other_deduction: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        pf_employer: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        esi_employer: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        gratuity: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        effective_from: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        pay_frequency: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        salary_type: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 1
        },
        pair_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_salary_details',
                key: 'id'
            }
        },
        tax_regime: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 2
        },
        gross_salary: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        total_deductions: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        net_salary: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        deleted_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
    };
    let optional = {
        sequelize,
        tableName: 'users_salary_details',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};