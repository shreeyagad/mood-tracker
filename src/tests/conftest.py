import pytest
import sys
sys.path.insert(0, '../src/')
from app import create_app, db

@pytest.fixture
def app():
    app = create_app()
    with app.app_context():   
        db.create_all()
        yield app
        db.session.close()
        db.drop_all()
