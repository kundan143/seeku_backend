CREATE TABLE IF NOT EXISTS pdf_template_master (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50) NOT NULL,
  html_content TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active SMALLINT NOT NULL DEFAULT 1,
  created_by INTEGER REFERENCES users_master(id),
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified_by INTEGER REFERENCES users_master(id),
  modified_date TIMESTAMP,
  deleted_by INTEGER REFERENCES users_master(id),
  deleted_date TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_pdf_template_default_per_type
  ON pdf_template_master (template_type)
  WHERE is_default = true AND is_active = 1;

COMMENT ON TABLE pdf_template_master IS 'Admin-authored HTML + {{merge_tag}} PDF document templates (salary slip, and future document types), rendered via Puppeteer.';
COMMENT ON COLUMN pdf_template_master.template_type IS 'Which document this template applies to, e.g. salary_slip. Determines the allowed merge-tag whitelist.';
COMMENT ON COLUMN pdf_template_master.is_default IS 'The active template used for generation when a document type has more than one template. At most one default per template_type (enforced by ux_pdf_template_default_per_type).';

ALTER TABLE salary_payments ADD COLUMN IF NOT EXISTS pdf_template_id INTEGER REFERENCES pdf_template_master(id);
COMMENT ON COLUMN salary_payments.pdf_template_id IS 'The pdf_template_master row used to generate this payment''s slip_url, so a later regeneration (e.g. cache-miss in emailSlip) reuses the same template version rather than whatever is currently default.';

INSERT INTO pdf_template_master (template_name, template_type, html_content, is_default, is_active)
SELECT 'Default Salary Slip', 'salary_slip', $html$<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #111111; margin: 0; padding: 32px 40px; }
  .header { text-align: center; border-bottom: 1.5px solid #1a3c5e; padding-bottom: 10px; }
  .logo { max-width: 42px; max-height: 42px; float: left; }
  .company-name { font-size: 18px; font-weight: bold; color: #1a3c5e; margin: 0; }
  .company-sub { font-size: 8px; color: #777777; margin: 2px 0 0; }
  .pay-slip-label { font-size: 10px; color: #555555; margin: 4px 0 0; }
  .pay-period { text-align: center; font-size: 11px; font-weight: bold; color: #1a3c5e; margin: 12px 0; border-top: 0.5px solid #cccccc; padding-top: 10px; }
  .info-section { display: flex; justify-content: space-between; border-top: 0.5px solid #cccccc; padding-top: 8px; font-size: 8px; }
  .info-col { width: 48%; }
  .info-row { display: flex; padding: 3px 0; }
  .info-label { font-weight: bold; color: #555555; width: 110px; flex-shrink: 0; }
  .info-value { color: #111111; }
  .attendance { display: flex; gap: 8px; margin-top: 10px; border-top: 0.5px solid #cccccc; padding-top: 10px; }
  .attendance-box { flex: 1; background: #f0f4f8; border: 0.5px solid #d0dce8; border-radius: 4px; padding: 6px 8px; }
  .attendance-label { font-size: 8px; font-weight: bold; color: #555555; }
  .attendance-value { font-size: 13px; font-weight: bold; color: #1a3c5e; }
  .section-title { font-size: 10px; font-weight: bold; color: #1a3c5e; margin: 10px 0 6px; }
  .tables { display: flex; gap: 8px; }
  .table-block { width: 50%; border: 0.5px solid #d0dce8; border-radius: 2px; overflow: hidden; }
  .table-header { color: #ffffff; font-size: 9px; font-weight: bold; padding: 6px; }
  .table-header.earnings { background: #2e6da4; }
  .table-header.deductions { background: #c0392b; }
  .table-row { display: flex; justify-content: space-between; font-size: 8px; padding: 4px 6px; }
  .table-row:nth-child(even) { background: #f9fafb; }
  .summary { display: flex; gap: 8px; margin-top: 10px; }
  .summary-box { flex: 1; border-radius: 4px; padding: 6px 8px; color: #ffffff; }
  .summary-label { font-size: 8px; font-weight: bold; }
  .summary-value { font-size: 13px; font-weight: bold; margin-top: 6px; }
  .summary-box.gross { background: #2e6da4; }
  .summary-box.deductions { background: #c0392b; }
  .summary-box.net { background: #1a7a4c; }
  .footer { border-top: 0.5px solid #cccccc; margin-top: 12px; padding-top: 8px; text-align: center; font-size: 7px; color: #999999; }
  .remarks { font-size: 8px; color: #333333; margin-top: 6px; }
</style>
</head>
<body>
  <div class="header">
    <img class="logo" src="{{company_logo_data_uri}}">
    <p class="company-name">{{company_name}}</p>
    <p class="company-sub">Corp. Office: {{company_address}}</p>
    <p class="company-sub">{{company_city_state_pin}}</p>
    <p class="pay-slip-label">Pay Slip</p>
  </div>

  <div class="pay-period">Pay Period: {{month_name}} {{payment_year}}</div>

  <div class="info-section">
    <div class="info-col">
      <div class="info-row"><span class="info-label">Employee Code:</span><span class="info-value">{{emp_code}}</span></div>
      <div class="info-row"><span class="info-label">Employee Name:</span><span class="info-value">{{emp_name}}</span></div>
      <div class="info-row"><span class="info-label">Department:</span><span class="info-value">{{department_name}}</span></div>
      <div class="info-row"><span class="info-label">Designation:</span><span class="info-value">{{designation_name}}</span></div>
      <div class="info-row"><span class="info-label">Date of Joining:</span><span class="info-value">{{doj_formatted}}</span></div>
      <div class="info-row"><span class="info-label">PAN No.:</span><span class="info-value">{{pan_no}}</span></div>
      <div class="info-row"><span class="info-label">UAN No.:</span><span class="info-value">{{uan_no}}</span></div>
    </div>
    <div class="info-col">
      <div class="info-row"><span class="info-label">Payment Status:</span><span class="info-value">{{payment_status_label}}</span></div>
      <div class="info-row"><span class="info-label">Payment Mode:</span><span class="info-value">{{payment_mode}}</span></div>
      <div class="info-row"><span class="info-label">Payment Date:</span><span class="info-value">{{payment_date_formatted}}</span></div>
      <div class="info-row"><span class="info-label">PF Account No.:</span><span class="info-value">{{pf_account_no}}</span></div>
      <div class="info-row"><span class="info-label">Bank Name:</span><span class="info-value">{{bank_name}}</span></div>
      <div class="info-row"><span class="info-label">Account No.:</span><span class="info-value">{{account_number}}</span></div>
      <div class="info-row"><span class="info-label">Balance Leave:</span><span class="info-value">{{remaining_days}}</span></div>
    </div>
  </div>

  <div class="attendance">
    <div class="attendance-box"><div class="attendance-label">Working Days</div><div class="attendance-value">{{working_days}}</div></div>
    <div class="attendance-box"><div class="attendance-label">Present Days</div><div class="attendance-value">{{present_days}}</div></div>
    <div class="attendance-box"><div class="attendance-label">Paid Days</div><div class="attendance-value">{{paid_days}}</div></div>
  </div>

  <div class="tables">
    <div class="table-block">
      <div class="table-header earnings">EARNINGS</div>
      <div class="table-row"><span>Basic Salary</span><span>{{basic_salary_fmt}}</span></div>
      <div class="table-row"><span>Dearness Allowance</span><span>{{dearness_allowance_fmt}}</span></div>
      <div class="table-row"><span>City Allowance</span><span>{{city_allowance_fmt}}</span></div>
      <div class="table-row"><span>HRA</span><span>{{hra_fmt}}</span></div>
      <div class="table-row"><span>Conveyance</span><span>{{conveyance_fmt}}</span></div>
      <div class="table-row"><span>Medical Allowance</span><span>{{medical_allowance_fmt}}</span></div>
      <div class="table-row"><span>Travel Allowance</span><span>{{travel_allowance_fmt}}</span></div>
      <div class="table-row"><span>Special Allowance</span><span>{{special_allowance_fmt}}</span></div>
      <div class="table-row"><span>Bonus</span><span>{{bonus_fmt}}</span></div>
    </div>
    <div class="table-block">
      <div class="table-header deductions">DEDUCTIONS</div>
      <div class="table-row"><span>PF (Employee)</span><span>{{pf_employee_fmt}}</span></div>
      <div class="table-row"><span>Professional Tax</span><span>{{professional_tax_fmt}}</span></div>
      <div class="table-row"><span>Income Tax (TDS)</span><span>{{income_tax_fmt}}</span></div>
      <div class="table-row"><span>ESI (Employee)</span><span>{{employee_state_insurance_fmt}}</span></div>
      <div class="table-row"><span>Loan / Advance</span><span>{{loan_deduction_fmt}}</span></div>
      <div class="table-row"><span>Other Deductions</span><span>{{other_deduction_fmt}}</span></div>
    </div>
  </div>

  <div class="summary">
    <div class="summary-box gross"><div class="summary-label">Gross Salary</div><div class="summary-value">{{gross_salary_fmt}}</div></div>
    <div class="summary-box deductions"><div class="summary-label">Total Deductions</div><div class="summary-value">{{total_deductions_fmt}}</div></div>
    <div class="summary-box net"><div class="summary-label">Net Salary</div><div class="summary-value">{{net_salary_fmt}}</div></div>
  </div>

  <div class="footer">
    <div>{{regd_office_line}}</div>
    <div>{{regd_contact_line}}</div>
    <div>This is a system-generated salary slip. No signature required.</div>
  </div>
  <div class="remarks">{{remarks_line}}</div>
</body>
</html>$html$, true, 1
WHERE NOT EXISTS (SELECT 1 FROM pdf_template_master WHERE template_type = 'salary_slip');
