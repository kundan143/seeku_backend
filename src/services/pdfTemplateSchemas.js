// Registry of merge tags available per template_type. `tags` is enforced as a
// whitelist when an admin saves a template of that type (typos get caught at
// save time instead of surfacing as a blank {{tag}} in a payslip); `sampleData`
// is used to render the dummy-data "Preview PDF" in the template master UI.
// Types with no entry here (e.g. a future 'sales_invoice') skip whitelist
// validation entirely, since the system doesn't yet know what data it can feed them.

const SALARY_SLIP_SAMPLE_DATA = {
  company_name: "Advance Cable Technologies Limited",
  company_logo_data_uri: "",
  company_address: "Plot 12, Industrial Area",
  company_city_state_pin: "Pune, Maharashtra - 411001",
  month_name: "January",
  payment_year: "2026",
  emp_code: "EMP0001",
  emp_name: "John Doe",
  department_name: "Engineering",
  designation_name: "Software Engineer",
  doj_formatted: "01/01/2020",
  pan_no: "ABCDE1234F",
  uan_no: "100123456789",
  payment_status_label: "Paid",
  payment_mode: "Bank Transfer",
  payment_date_formatted: "05/02/2026",
  pf_account_no: "PF00123456",
  bank_name: "State Bank of India",
  account_number: "XXXXXXXX1234",
  remaining_days: "12",
  working_days: "31",
  present_days: "29",
  paid_days: "29",
  basic_salary_fmt: "Rs. 30,000.00",
  dearness_allowance_fmt: "Rs. 1,000.00",
  city_allowance_fmt: "Rs. 500.00",
  hra_fmt: "Rs. 12,000.00",
  conveyance_fmt: "Rs. 1,600.00",
  medical_allowance_fmt: "Rs. 1,250.00",
  travel_allowance_fmt: "Rs. 800.00",
  special_allowance_fmt: "Rs. 2,000.00",
  bonus_fmt: "Rs. 0.00",
  pf_employee_fmt: "Rs. 1,800.00",
  professional_tax_fmt: "Rs. 200.00",
  income_tax_fmt: "Rs. 1,500.00",
  employee_state_insurance_fmt: "Rs. 0.00",
  loan_deduction_fmt: "Rs. 0.00",
  other_deduction_fmt: "Rs. 0.00",
  gross_salary_fmt: "Rs. 49,150.00",
  total_deductions_fmt: "Rs. 3,500.00",
  net_salary_fmt: "Rs. 45,650.00",
  regd_office_line: "Regd. Office: 4th Floor, Business Tower, Pune, Maharashtra - 411001",
  regd_contact_line: "Phone: +91-9999999999   |   Email: info@example.com",
  remarks_line: "Remarks: Sample remark text",
};

const TEMPLATE_SCHEMAS = {
  salary_slip: {
    label: "Salary Slip",
    tags: Object.keys(SALARY_SLIP_SAMPLE_DATA),
    sampleData: SALARY_SLIP_SAMPLE_DATA,
  },
};

module.exports = { TEMPLATE_SCHEMAS };
