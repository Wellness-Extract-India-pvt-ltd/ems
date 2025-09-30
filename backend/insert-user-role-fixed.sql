INSERT INTO user_role_maps (
    employee_id, 
    role, 
    permissions, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    1, 
    'admin', 
    '["read", "write", "delete", "admin"]', 
    true, 
    NOW(), 
    NOW()
);
