import sys
sys.path.append('.')
from app.models_sqlalchemy import RentalRequest, db
from app import create_app

app = create_app()
with app.app_context():
    # Check request #48 status
    request = RentalRequest.query.get(48)
    if request:
        print(f'Request #48 status: {request.status}')
        print(f'Request #48 asset_name: {getattr(request, "asset_name", "N/A")}')
    else:
        print('Request #48 not found')
        
    # Also check recent requests
    recent = RentalRequest.query.order_by(RentalRequest.id.desc()).limit(5).all()
    print(f'Recent requests:')
    for r in recent:
        asset_name = getattr(r, 'asset_name', 'N/A')
        print(f'  #{r.id}: status={r.status}, asset_name={asset_name}')
