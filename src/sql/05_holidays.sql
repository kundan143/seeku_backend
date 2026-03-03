CREATE TABLE holidays_master (
    id SERIAL PRIMARY KEY,                                -- Unique ID for each holiday
    holiday_name VARCHAR(150) NOT NULL,                   -- Name of the holiday
    icon VARCHAR(150) NULL,                   -- Name of the holiday
    holiday_date DATE NOT NULL,                           -- Date of the holiday
    description TEXT,                                     -- Optional description
    is_optional BOOLEAN DEFAULT FALSE,                    -- TRUE = optional holiday, FALSE = mandatory
    status INTEGER DEFAULT 1,                             -- 1 = Active, 0 = Inactive, 3 = Deleted
    created_by INTEGER NOT NULL REFERENCES users_master(id),  -- User who created the record
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,           -- Creation timestamp
    modified_by INTEGER REFERENCES users_master(id),           -- User who last updated the record
    modified_date TIMESTAMP,                                  -- Last update timestamp
    deleted_by INTEGER REFERENCES users_master(id),           -- User who deleted the record
    deleted_date TIMESTAMP                                     -- Deletion timestamp
);

-- Comments for clarity
COMMENT ON TABLE holidays_master IS 'Stores all company holidays with audit tracking.';
COMMENT ON COLUMN holidays_master.holiday_name IS 'Name of the holiday (e.g., Independence Day, Diwali)';
COMMENT ON COLUMN holidays_master.holiday_date IS 'Date on which the holiday occurs';
COMMENT ON COLUMN holidays_master.is_optional IS 'Indicates if the holiday is optional or fixed';
COMMENT ON COLUMN holidays_master.status IS '1=Active, 0=Inactive, 3=Deleted';
COMMENT ON COLUMN holidays_master.created_by IS 'User ID who created the record';
COMMENT ON COLUMN holidays_master.created_date IS 'Date and time when record was created';
COMMENT ON COLUMN holidays_master.modified_by IS 'User ID who last updated the record';
COMMENT ON COLUMN holidays_master.modified_date IS 'Date and time when record was last updated';
COMMENT ON COLUMN holidays_master.deleted_by IS 'User ID who deleted the record';
COMMENT ON COLUMN holidays_master.deleted_date IS 'Date and time when record was deleted';


INSERT INTO holidays_master 
(holiday_name, holiday_date, description, is_optional, status, created_by, icon)
SELECT holiday_name, holiday_date, description, is_optional, status, created_by, icon
FROM (
    VALUES
        ('New Year', '2025-01-01'::date, 'Celebration of the new year', FALSE::boolean, 1::int, 1::int, 'pi pi-sparkles'),
        ('Makar Sankranti / Pongal', '2025-01-14'::date, 'Harvest festival celebrated in various states', TRUE::boolean, 1::int, 1::int, 'pi pi-sun'),
        ('Republic Day', '2025-01-26'::date, 'National holiday of India', FALSE::boolean, 1::int, 1::int, 'pi pi-flag'),
        ('Vasant Panchami', '2025-02-02'::date, 'Festival dedicated to Goddess Saraswati', TRUE::boolean, 1::int, 1::int, 'pi pi-book'),
        ('Maha Shivaratri', '2025-02-26'::date, 'Festival dedicated to Lord Shiva', TRUE::boolean, 1::int, 1::int, 'pi pi-bolt'),
        ('Holi', '2025-03-14'::date, 'Festival of colors', TRUE::boolean, 1::int, 1::int, 'pi pi-palette'),
        ('Good Friday', '2025-04-18'::date, 'Commemorating crucifixion of Jesus Christ', TRUE::boolean, 1::int, 1::int, 'pi pi-cross'),
        ('Ram Navami', '2025-04-06'::date, 'Birth of Lord Rama', TRUE::boolean, 1::int, 1::int, 'pi pi-star'),
        ('Eid al-Fitr', '2025-03-31'::date, 'End of Ramadan', TRUE::boolean, 1::int, 1::int, 'pi pi-moon'),
        ('Buddha Purnima', '2025-05-12'::date, 'Birth of Gautama Buddha', TRUE::boolean, 1::int, 1::int, 'pi pi-heart'),
        ('Bakrid / Eid al-Adha', '2025-06-07'::date, 'Festival of sacrifice', TRUE::boolean, 1::int, 1::int, 'pi pi-cow'),
        ('Muharram', '2025-07-07'::date, 'Islamic New Year', TRUE::boolean, 1::int, 1::int, 'pi pi-calendar'),
        ('Independence Day', '2025-08-15'::date, 'National holiday of India', FALSE::boolean, 1::int, 1::int, 'pi pi-flag-fill'),
        ('Raksha Bandhan', '2025-08-09'::date, 'Festival celebrating sibling bond', TRUE::boolean, 1::int, 1::int, 'pi pi-heart-fill'),
        ('Janmashtami', '2025-08-16'::date, 'Birth of Lord Krishna', TRUE::boolean, 1::int, 1::int, 'pi pi-crown'),
        ('Ganesh Chaturthi', '2025-08-27'::date, 'Celebrating Lord Ganesha', TRUE::boolean, 1::int, 1::int, 'pi pi-circle'),
        ('Gandhi Jayanti', '2025-10-02'::date, 'Birthday of Mahatma Gandhi', FALSE::boolean, 1::int, 1::int, 'pi pi-user'),
        ('Dussehra', '2025-10-12'::date, 'Victory of good over evil', FALSE::boolean, 1::int, 1::int, 'pi pi-bolt'),
        ('Karva Chauth', '2025-10-29'::date, 'Festival for married women', TRUE::boolean, 1::int, 1::int, 'pi pi-heart'),
        ('Diwali', '2025-10-21'::date, 'Festival of lights', FALSE::boolean, 1::int, 1::int, 'pi pi-lightbulb'),
        ('Bhai Dooj', '2025-10-23'::date, 'Celebrating brother-sister bond', TRUE::boolean, 1::int, 1::int, 'pi pi-users'),
        ('Guru Nanak Jayanti', '2025-11-05'::date, 'Birth of Guru Nanak Dev Ji', TRUE::boolean, 1::int, 1::int, 'pi pi-pray'),
        ('Christmas', '2025-12-25'::date, 'Birth of Jesus Christ', TRUE::boolean, 1::int, 1::int, 'pi pi-gift')
) AS new_data(holiday_name, holiday_date, description, is_optional, status, created_by, icon)
WHERE NOT EXISTS (
    SELECT 1 FROM holidays_master h
    WHERE h.holiday_name = new_data.holiday_name
       OR h.holiday_date = new_data.holiday_date
);
