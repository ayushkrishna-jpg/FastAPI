"""create phone number user colomn in auth

Revision ID: 5d900d467953
Revises: 7fb22dc62e44
Create Date: 2026-02-16 17:12:06.848411

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d900d467953'
down_revision: Union[str, Sequence[str], None] = '7fb22dc62e44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
