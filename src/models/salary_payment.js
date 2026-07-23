module.exports = function (sequelize, DataTypes) {
    let table_name = 'salary_payments';
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
            references: { model: 'users_master', key: 'id' }
        },
        salary_detail_id: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_salary_details', key: 'id' }
        },
        payment_month: {
            type: DataTypes.SMALLINT,
            allowNull: false
        },
        payment_year: {
            type: DataTypes.SMALLINT,
            allowNull: false
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
        travel_allowance: {
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
        working_days: {
            type: DataTypes.SMALLINT,
            allowNull: true,
            defaultValue: 0
        },
        present_days: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        paid_days: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        unapproved_leave_days: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: true,
            defaultValue: 0.00
        },
        payment_mode: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        payment_date: {
            type: DataTypes.DATEONLY,
            allowNull: true
        },
        transaction_ref: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        remarks: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        payment_status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 0
        },
        status: {
            type: DataTypes.SMALLINT,
            allowNull: false,
            defaultValue: 1
        },
        created_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        created_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        modified_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        modified_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: { model: 'users_master', key: 'id' }
        },
        deleted_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        slip_url: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
    };
    let optional = {
        sequelize,
        tableName: 'salary_payments',
        schema: 'public',
        timestamps: false
    };
    return sequelize.define(table_name, columns, optional);
};
