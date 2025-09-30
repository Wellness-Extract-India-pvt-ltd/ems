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
