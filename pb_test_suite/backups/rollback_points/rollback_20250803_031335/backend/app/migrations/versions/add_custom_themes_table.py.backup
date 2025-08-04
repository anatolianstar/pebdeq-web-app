"""Add custom_themes table

Revision ID: add_custom_themes_table
Revises: fc1b8d793938
Create Date: 2024-01-01 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = 'add_custom_themes_table'
down_revision = 'fc1b8d793938'
branch_labels = None
depends_on = None


def upgrade():
    # Create custom_themes table
    op.create_table(
        'custom_themes',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('theme_id', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('author', sa.String(length=255), nullable=True),
        sa.Column('version', sa.String(length=50), nullable=True),
        sa.Column('type', sa.String(length=20), nullable=True),
        sa.Column('theme_data', sa.Text(), nullable=False),
        sa.Column('css_content', sa.Text(), nullable=True),
        sa.Column('preview_colors', sa.Text(), nullable=True),
        sa.Column('creator_id', sa.Integer(), nullable=False),
        sa.Column('is_default', sa.Boolean(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('download_count', sa.Integer(), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('theme_id'),
        sa.ForeignKeyConstraint(['creator_id'], ['users.id'], )
    )
    
    # Create indexes for better performance
    op.create_index(op.f('ix_custom_themes_theme_id'), 'custom_themes', ['theme_id'], unique=True)
    op.create_index(op.f('ix_custom_themes_creator_id'), 'custom_themes', ['creator_id'], unique=False)
    op.create_index(op.f('ix_custom_themes_is_active'), 'custom_themes', ['is_active'], unique=False)
    op.create_index(op.f('ix_custom_themes_is_public'), 'custom_themes', ['is_public'], unique=False)
    op.create_index(op.f('ix_custom_themes_type'), 'custom_themes', ['type'], unique=False)
    op.create_index(op.f('ix_custom_themes_created_at'), 'custom_themes', ['created_at'], unique=False)
    op.create_index(op.f('ix_custom_themes_download_count'), 'custom_themes', ['download_count'], unique=False)
    op.create_index(op.f('ix_custom_themes_rating'), 'custom_themes', ['rating'], unique=False)


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_custom_themes_rating'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_download_count'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_created_at'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_type'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_is_public'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_is_active'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_creator_id'), table_name='custom_themes')
    op.drop_index(op.f('ix_custom_themes_theme_id'), table_name='custom_themes')
    
    # Drop table
    op.drop_table('custom_themes') 