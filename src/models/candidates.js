module.exports = function (sequelize, DataTypes) {
    let table_name = 'candidates';
    let columns = {
        id: {
            autoIncrement: true,
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true
        },
        first_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        mobile: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'department_master',
                key: 'id'
            }
        },
        designation_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'designation_master',
                key: 'id'
            }
        },
        reporting_manager_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        doj: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        offer_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        basic_salary: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
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
            allowNull: true,
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
            allowNull: true,
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
        ctc: {
            type: DataTypes.DECIMAL(12, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        offer_status: {
            type: DataTypes.STRING(20),
            allowNull: true,
            defaultValue: 'draft'
        },
        offer_letter_url: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        converted_user_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: 'users_master',
                key: 'id'
            }
        },
        terms: {
            type: DataTypes.TEXT,
            allowNull: true
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
        tableName: 'candidates',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
