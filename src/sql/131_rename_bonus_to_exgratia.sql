-- Business terminology change: "Bonus" is renamed to "Exgratia" across Salary Master, the
-- Increment flow, and monthly Salary Payment. candidates.bonus (offer letter) is a separate
-- column and is intentionally left untouched.
ALTER TABLE users_salary_details RENAME COLUMN bonus TO exgratia;
COMMENT ON COLUMN users_salary_details.exgratia IS 'Exgratia amount';

ALTER TABLE salary_payments RENAME COLUMN bonus TO exgratia;

-- Salary Slip PDF template: rename the {{bonus_fmt}} merge tag and the printed label.
UPDATE pdf_template_master
SET html_content = REPLACE(REPLACE(html_content, '{{bonus_fmt}}', '{{exgratia_fmt}}'), '>Bonus<', '>Exgratia<')
WHERE template_name = 'Salary_slip_V2' AND html_content ILIKE '%bonus%';

-- Increment Letter PDF template: rename the old/new merge tags and the printed label.
UPDATE pdf_template_master
SET html_content = REPLACE(
                      REPLACE(
                        REPLACE(html_content, '{{old_bonus_fmt}}', '{{old_exgratia_fmt}}'),
                        '{{new_bonus_fmt}}', '{{new_exgratia_fmt}}'
                      ),
                      '>Bonus<', '>Exgratia<'
                    )
WHERE template_name = 'Default Increment Letter' AND html_content ILIKE '%bonus%';
