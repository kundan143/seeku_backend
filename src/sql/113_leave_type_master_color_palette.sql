-- The seeded color_code values were an uncurated mix of near-identical candy pastels
-- (multiple pinks, multiple yellows, two different grays) that look muddled together
-- wherever several leave types render side by side (Leave Balance card dots/bars,
-- reports, legends). Replace them with a single coherent categorical palette - same
-- saturation/lightness family, each hue chosen to stay visually distinct from the rest.
UPDATE leave_type_master SET color_code = '#2563EB' WHERE leave_code = 'CL';
UPDATE leave_type_master SET color_code = '#DC2626' WHERE leave_code = 'SL';
UPDATE leave_type_master SET color_code = '#0D9488' WHERE leave_code = 'PL';
UPDATE leave_type_master SET color_code = '#DB2777' WHERE leave_code = 'ML';
UPDATE leave_type_master SET color_code = '#7C3AED' WHERE leave_code = 'PTL';
UPDATE leave_type_master SET color_code = '#D97706' WHERE leave_code = 'EL';
UPDATE leave_type_master SET color_code = '#6B7280' WHERE leave_code = 'LOP';
UPDATE leave_type_master SET color_code = '#65A30D' WHERE leave_code = 'HPL';
UPDATE leave_type_master SET color_code = '#16A34A' WHERE leave_code = 'CPL';
UPDATE leave_type_master SET color_code = '#4F46E5' WHERE leave_code = 'STL';
UPDATE leave_type_master SET color_code = '#0284C7' WHERE leave_code = 'VL';
UPDATE leave_type_master SET color_code = '#57534E' WHERE leave_code = 'BL';
UPDATE leave_type_master SET color_code = '#C026D3' WHERE leave_code = 'RL';
UPDATE leave_type_master SET color_code = '#78350F' WHERE leave_code = 'MIL';
UPDATE leave_type_master SET color_code = '#9333EA' WHERE leave_code = 'SBL';
