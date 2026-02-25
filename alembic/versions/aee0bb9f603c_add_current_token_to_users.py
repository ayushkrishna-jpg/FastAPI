"""add_current_token_to_users

Revision ID: aee0bb9f603c
Revises: 5d900d467953
Create Date: 2026-02-24 15:05:59.781100

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aee0bb9f603c'
down_revision: Union[str, Sequence[str], None] = '5d900d467953'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('current_token', sa.String(), nullable=True))



def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'current_token')

