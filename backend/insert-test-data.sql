-- Insert test department
INSERT INTO departments (name, description, manager_id, location, budget, status, created_at, updated_at) 
VALUES ('IT Department', 'Information Technology Department', NULL, 'Head Office', 100000, 'Active', NOW(), NOW());

-- Insert test employee
INSERT INTO employees (
    employee_id, 
    first_name, 
    last_name, 
    email, 
    contact_email, 
    phone, 
    department_id, 
    position, 
    employment_type, 
    status, 
    join_date, 
    manager_id, 
    salary, 
    address, 
    emergency_contact_name, 
    emergency_contact_phone, 
    emergency_contact_relationship, 
    created_at, 
    updated_at
) VALUES (
    'WE_IN017', 
    'Sawan', 
    'Kumar', 
    'sawan@wellnessextract.com', 
    'sawan@wellnessextract.com', 
    '+91-9876543210', 
    1, 
    'Software Developer', 
    'Full-time', 
    'Active', 
    '2023-01-15', 
    NULL, 
    75000, 
    '{"street":"123 Tech Street","city":"Mumbai","state":"Maharashtra","country":"India","postal_code":"400001"}', 
    'Emergency Contact', 
    '+91-9876543211', 
    'Spouse', 
    NOW(), 
    NOW()
);

-- Insert user role mapping
INSERT INTO user_role_maps (
    employee_id, 
    role, 
    permissions, 
    assigned_by, 
    assigned_date, 
    status, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    1, 
    'admin', 
    '["read", "write", "delete", "admin"]', 
    1, 
    NOW(), 
    'active', 
    true, 
    NOW(), 
    NOW()
);
