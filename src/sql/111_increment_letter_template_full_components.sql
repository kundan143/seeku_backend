-- Re-applies the full Increment Letter template content as a NEW migration rather than editing
-- 110 in place: once a migration file has been executed, the runner (umzug, keyed by filename in
-- migrationService.js) marks it done permanently and will never re-run it even if the file's
-- content changes afterward. 110 was applied while still mid-edit (fewer components, no Medical
-- Allowance row among others), so those later edits to 110.sql never reached the database. This
-- migration carries the exact current template (all 22 salary-increment-history snapshot fields,
-- navy+red branding, 150px logo) and is guaranteed to run since its filename is new.
UPDATE pdf_template_master
SET html_content = $html$<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { font-family: Helvetica, Arial, sans-serif; color: #111111; margin: 0; padding: 40px 48px; font-size: 11px; line-height: 1.6; }
  .header { text-align: center; margin-bottom: 0; }
  .logo { max-width: 150px; max-height: 150px; float: left; }
  .company-name { font-size: 20px; font-weight: bold; color: #1a3c5e; margin: 0; }
  .company-sub { font-size: 9px; color: #777777; margin: 2px 0 0; }
  .header-bar { margin: 10px 0 20px; }
  .header-bar .navy-line { height: 3px; background: #1a3c5e; }
  .header-bar .red-line { height: 2px; background: #e2001a; margin-top: 1px; }
  .letter-title { text-align: center; margin: 0 0 20px; }
  .letter-title span { display: inline-block; font-size: 14px; font-weight: bold; color: #1a3c5e; padding-bottom: 4px; border-bottom: 3px solid #e2001a; }
  .letter-date { text-align: right; margin-bottom: 16px; }
  .salutation { margin-bottom: 14px; }
  .increment-badge { display: inline-block; background: #e2001a; color: #ffffff; font-weight: bold; padding: 2px 10px; border-radius: 10px; font-size: 10px; }
  .increment-box { border: 1px solid #d0dce8; border-radius: 4px; margin: 16px 0; overflow: hidden; }
  .increment-box-header { background: #1a3c5e; color: #ffffff; font-weight: bold; padding: 8px 12px; font-size: 11px; border-left: 5px solid #e2001a; }
  table.increment-table { width: 100%; border-collapse: collapse; }
  table.increment-table th, table.increment-table td { padding: 6px 12px; font-size: 10px; border-bottom: 0.5px solid #e5e5e5; }
  table.increment-table th { text-align: left; background: #f0f4f8; color: #1a3c5e; }
  table.increment-table td.amount { text-align: right; }
  table.increment-table tr.subtotal td { font-weight: bold; background: #f7f9fb; }
  table.increment-table tr.net-row td { font-weight: bold; background: #eaf7ef; color: #15803d; }
  .closing { margin-top: 24px; }
  .signature { margin-top: 40px; }
  .footer-bar { margin-top: 30px; }
  .footer-bar .red-line { height: 2px; background: #e2001a; }
  .footer-bar .navy-line { height: 1px; background: #1a3c5e; margin-top: 2px; }
  .footer { padding-top: 10px; text-align: center; font-size: 8px; color: #999999; }
</style>
</head>
<body>
  <div class="header">
    <img class="logo" src="{{company_logo_data_uri}}">
    <p class="company-name">{{company_name}}</p>
    <p class="company-sub">{{company_address}}</p>
    <p class="company-sub">{{company_city_state_pin}}</p>
  </div>
  <div class="header-bar"><div class="navy-line"></div><div class="red-line"></div></div>

  <div class="letter-date">Date: {{letter_date_formatted}}</div>

  <div class="letter-title"><span>Increment Letter</span></div>

  <div class="salutation">
    Dear <strong>{{emp_name}}</strong> ({{emp_code}}),<br>
    {{designation_name}}, {{department_name}}
  </div>

  <p>We are pleased to inform you that, based on your performance and contribution to the organization, the
  management has approved a revision in your compensation, effective <strong>{{effective_from_formatted}}</strong>.
  Your revised compensation reflects a <span class="increment-badge">{{increment_type_label}}</span> increment over your existing pay.</p>

  <div class="increment-box">
    <div class="increment-box-header">Compensation Summary</div>
    <table class="increment-table">
      <thead>
        <tr><th>Component</th><th class="amount">Current (Old)</th><th class="amount">Revised (New)</th></tr>
      </thead>
      <tbody>
        <tr><td>Cost to Company (CTC)</td><td class="amount">{{old_ctc_fmt}}</td><td class="amount">{{new_ctc_fmt}}</td></tr>
        <tr><td>Basic Salary</td><td class="amount">{{old_basic_fmt}}</td><td class="amount">{{new_basic_fmt}}</td></tr>
        <tr><td>Dearness Allowance</td><td class="amount">{{old_da_fmt}}</td><td class="amount">{{new_da_fmt}}</td></tr>
        <tr><td>City Allowance</td><td class="amount">{{old_city_allowance_fmt}}</td><td class="amount">{{new_city_allowance_fmt}}</td></tr>
        <tr><td>HRA</td><td class="amount">{{old_hra_fmt}}</td><td class="amount">{{new_hra_fmt}}</td></tr>
        <tr><td>Conveyance</td><td class="amount">{{old_conveyance_fmt}}</td><td class="amount">{{new_conveyance_fmt}}</td></tr>
        <tr><td>Medical Allowance</td><td class="amount">{{old_medical_allowance_fmt}}</td><td class="amount">{{new_medical_allowance_fmt}}</td></tr>
        <tr><td>Travel Allowance</td><td class="amount">{{old_travel_allowance_fmt}}</td><td class="amount">{{new_travel_allowance_fmt}}</td></tr>
        <tr><td>Special Allowance</td><td class="amount">{{old_special_allowance_fmt}}</td><td class="amount">{{new_special_allowance_fmt}}</td></tr>
        <tr><td>Bonus</td><td class="amount">{{old_bonus_fmt}}</td><td class="amount">{{new_bonus_fmt}}</td></tr>
        <tr class="subtotal"><td>Gross Salary</td><td class="amount">{{old_gross_fmt}}</td><td class="amount">{{new_gross_fmt}}</td></tr>
        <tr><td>PF (Employee)</td><td class="amount">{{old_pf_employee_fmt}}</td><td class="amount">{{new_pf_employee_fmt}}</td></tr>
        <tr><td>Professional Tax</td><td class="amount">{{old_professional_tax_fmt}}</td><td class="amount">{{new_professional_tax_fmt}}</td></tr>
        <tr><td>Income Tax (TDS)</td><td class="amount">{{old_income_tax_fmt}}</td><td class="amount">{{new_income_tax_fmt}}</td></tr>
        <tr><td>ESI (Employee)</td><td class="amount">{{old_esi_employee_fmt}}</td><td class="amount">{{new_esi_employee_fmt}}</td></tr>
        <tr><td>Loan Deduction</td><td class="amount">{{old_loan_deduction_fmt}}</td><td class="amount">{{new_loan_deduction_fmt}}</td></tr>
        <tr><td>Other Deduction</td><td class="amount">{{old_other_deduction_fmt}}</td><td class="amount">{{new_other_deduction_fmt}}</td></tr>
        <tr class="subtotal"><td>Total Deductions</td><td class="amount">{{old_total_deductions_fmt}}</td><td class="amount">{{new_total_deductions_fmt}}</td></tr>
        <tr><td>PF (Employer)</td><td class="amount">{{old_pf_employer_fmt}}</td><td class="amount">{{new_pf_employer_fmt}}</td></tr>
        <tr><td>ESI (Employer)</td><td class="amount">{{old_esi_employer_fmt}}</td><td class="amount">{{new_esi_employer_fmt}}</td></tr>
        <tr><td>Gratuity</td><td class="amount">{{old_gratuity_fmt}}</td><td class="amount">{{new_gratuity_fmt}}</td></tr>
        <tr class="net-row"><td>Net Salary</td><td class="amount">{{old_net_salary_fmt}}</td><td class="amount">{{new_net_salary_fmt}}</td></tr>
      </tbody>
    </table>
  </div>

  <p>This revision will be reflected starting your <strong>{{disbursement_month_year}}</strong> salary disbursement.
  {{arrear_line}}</p>

  <div class="closing">
    <p>We look forward to your continued dedication and contribution towards the growth of the organization.
    Please feel free to reach out to the HR Department for any queries regarding this revision.</p>
  </div>

  <div class="signature">
    <p>Best Regards,</p>
    <p><strong>HR Department</strong><br>{{company_name}}</p>
  </div>

  <div class="footer-bar"><div class="red-line"></div><div class="navy-line"></div></div>
  <div class="footer">
    <div>{{regd_office_line}}</div>
    <div>{{regd_contact_line}}</div>
    <div>This is a system-generated letter and does not require a physical signature.</div>
  </div>
</body>
</html>$html$
WHERE template_type = 'increment_letter' AND template_name = 'Default Increment Letter';
