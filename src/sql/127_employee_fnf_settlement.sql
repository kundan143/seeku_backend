-- Full & Final Settlement - computed once (as a draft, editable) and finalized when an employee
-- exits. Stores the actual figures used (not just a formula reference) so a settlement record
-- stays accurate even if salary/leave-balance data changes later. Finalizing a settlement also
-- flips users_master.status to false (see OP_EmployeeFnfSettlement.finalize) - the same signal
-- the HR dashboard's attrition-rate/headcount-trend widgets already read off modified_date.
CREATE TABLE IF NOT EXISTS employee_fnf_settlement (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users_master(id),
  salary_detail_id BIGINT REFERENCES users_salary_details(id),
  last_working_day DATE NOT NULL,
  years_of_service NUMERIC(5,2) NOT NULL DEFAULT 0,

  -- Pending salary (last processed month onward, pro-rated to last_working_day)
  pending_salary_days NUMERIC(5,2) NOT NULL DEFAULT 0,
  pending_salary_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Leave encashment - which leave types were included and at what count/rate is left to the
  -- breakdown JSON (leave_type_master ids/day-counts vary too much to model as fixed columns)
  leave_encashment_breakdown JSONB,
  leave_encashment_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Statutory gratuity - Payment of Gratuity Act: (15/26) x (Basic+DA) x years of service,
  -- only when years_of_service >= 5
  gratuity_eligible BOOLEAN NOT NULL DEFAULT false,
  gratuity_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Deductions
  loan_recovery_breakdown JSONB,
  loan_recovery_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notice_period_required_days INTEGER NOT NULL DEFAULT 0,
  notice_period_served_days INTEGER NOT NULL DEFAULT 0,
  notice_shortfall_amount NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- Manual catch-all adjustments (bonus payouts, damages, equipment not returned, etc.)
  other_additions NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  remarks TEXT,

  gross_earnings NUMERIC(12,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_payable NUMERIC(12,2) NOT NULL DEFAULT 0,

  -- 0 = Draft (still editable/recalculable), 1 = Finalized (locks the figures, exits the employee),
  -- 2 = Paid
  status SMALLINT NOT NULL DEFAULT 0,

  created_by BIGINT REFERENCES users_master(id),
  created_date TIMESTAMP,
  modified_by BIGINT REFERENCES users_master(id),
  modified_date TIMESTAMP,
  finalized_by BIGINT REFERENCES users_master(id),
  finalized_date TIMESTAMP
);
