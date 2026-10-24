"""Add audit fields for human inspection overrides.

Revision ID: 20261024_override_audit
"""
from alembic import op
import sqlalchemy as sa

revision = "20261024_override_audit"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("inspections", sa.Column("original_status", sa.String(length=10), nullable=True))
    op.add_column("inspections", sa.Column("override_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("inspections", "override_at")
    op.drop_column("inspections", "original_status")
