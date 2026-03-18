from alembic import op
import sqlalchemy as sa

def upgrade():
    op.create_table(
        'parts',
        sa.Column('id', sa.String(), primary_key=True, index=True),
        sa.Column('dimensions', sa.JSON(), nullable=False),
        sa.Column('tolerances', sa.JSON(), nullable=False),
    )

def downgrade():
    op.drop_table('parts')
