"""Role-Based Access Control (RBAC) utilities."""
from enum import Enum
from functools import wraps
from typing import Callable, List
from fastapi import HTTPException, status


class Role(str, Enum):
    ADMIN = "admin"
    INSPECTOR = "inspector"
    VIEWER = "viewer"


# Role permissions
ROLE_PERMISSIONS = {
    Role.ADMIN: [
        "create_user", "delete_user", "update_user",
        "create_inspection", "read_inspection", "update_inspection", "delete_inspection",
        "override_inspection", "view_dashboard", "view_analytics", "manage_alerts"
    ],
    Role.INSPECTOR: [
        "create_inspection", "read_inspection", "update_inspection",
        "override_inspection", "view_dashboard"
    ],
    Role.VIEWER: [
        "read_inspection", "view_dashboard"
    ]
}


def has_permission(user_role: str, permission: str) -> bool:
    """Check if a role has a specific permission."""
    try:
        role = Role(user_role)
        return permission in ROLE_PERMISSIONS[role]
    except ValueError:
        return False


def require_permission(permission: str):
    """Decorator to require a specific permission."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current user from kwargs (injected by FastAPI dependency)
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if not has_permission(current_user.role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Permission '{permission}' required"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_role(roles: List[Role]):
    """Decorator to require specific roles."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get('current_user')
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            try:
                user_role = Role(current_user.role)
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Invalid role"
                )
            
            if user_role not in roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Role {user_role.value} not authorized"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator
