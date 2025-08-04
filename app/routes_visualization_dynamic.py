"""
Dynamic Visualization API Routes for Rental Assets Dashboard
This module provides real-time data visualization endpoints that connect to the actual database
"""

from flask import Blueprint, request, jsonify
from sqlalchemy import func, extract, case, and_
from app.models_sqlalchemy import RentalAsset, RentalRequest, db
from app.models_rental_transaction import RentalTransaction
from datetime import datetime, timedelta
import calendar

visualization_dynamic = Blueprint('visualization_dynamic', __name__)

@visualization_dynamic.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Get real-time dashboard statistics"""
    try:
        # Basic counts
        total_assets = RentalAsset.query.count()
        available_assets = RentalAsset.query.filter_by(status='available').count()
        rented_assets = RentalAsset.query.filter_by(status='rented').count()
        maintenance_assets = RentalAsset.query.filter_by(status='maintenance').count()
        
        # Pending requests
        pending_requests = RentalRequest.query.filter_by(status='pending').count()
        
        # Revenue calculations
        active_transactions = db.session.query(RentalTransaction).filter_by(status='active').all()
        monthly_revenue = sum(tx.monthly_price for tx in active_transactions)
        
        # Average prices by type
        avg_tanah_price = db.session.query(func.avg(RentalAsset.harga_sewa)).filter_by(asset_type='tanah').scalar() or 0
        avg_bangunan_price = db.session.query(func.avg(RentalAsset.harga_sewa)).filter_by(asset_type='bangunan').scalar() or 0
        
        # Occupancy rate
        occupancy_rate = (rented_assets / total_assets * 100) if total_assets > 0 else 0
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        new_assets_this_month = RentalAsset.query.filter(RentalAsset.created_at >= thirty_days_ago).count()
        new_requests_this_month = RentalRequest.query.filter(RentalRequest.created_at >= thirty_days_ago).count()
        
        return jsonify({
            'success': True,
            'stats': {
                # Asset statistics
                'total_assets': total_assets,
                'available_assets': available_assets,
                'rented_assets': rented_assets,
                'maintenance_assets': maintenance_assets,
                'occupancy_rate': round(occupancy_rate, 2),
                
                # Financial data
                'monthly_revenue': float(monthly_revenue),
                'avg_tanah_price': float(avg_tanah_price),
                'avg_bangunan_price': float(avg_bangunan_price),
                
                # Activity metrics
                'pending_requests': pending_requests,
                'new_assets_this_month': new_assets_this_month,
                'new_requests_this_month': new_requests_this_month,
                
                # Performance indicators
                'revenue_growth': 12.5,  # Placeholder - could be calculated from historical data
                'request_approval_rate': 85.0,  # Placeholder
                'avg_rental_duration': 6.2,  # Placeholder - months
            }
        })
        
    except Exception as e:
        print(f"Error in get_dashboard_stats: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/asset-type-distribution', methods=['GET'])
def get_asset_type_distribution():
    """Get asset distribution by type for pie chart"""
    try:
        # Count by asset type
        distribution = db.session.query(
            RentalAsset.asset_type,
            func.count(RentalAsset.id).label('count')
        ).group_by(RentalAsset.asset_type).all()
        
        # Count by status within each type
        status_distribution = db.session.query(
            RentalAsset.asset_type,
            RentalAsset.status,
            func.count(RentalAsset.id).label('count')
        ).group_by(RentalAsset.asset_type, RentalAsset.status).all()
        
        # Format for charts
        pie_data = []
        status_data = {}
        
        for asset_type, count in distribution:
            pie_data.append({
                'label': 'Tanah' if asset_type == 'tanah' else 'Bangunan',
                'value': count,
                'type': asset_type
            })
        
        for asset_type, status, count in status_distribution:
            if asset_type not in status_data:
                status_data[asset_type] = {}
            status_data[asset_type][status] = count
        
        return jsonify({
            'success': True,
            'data': {
                'pie_chart': pie_data,
                'status_distribution': status_data
            }
        })
        
    except Exception as e:
        print(f"Error in get_asset_type_distribution: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/location-distribution', methods=['GET'])
def get_location_distribution():
    """Get asset distribution by location for bar chart"""
    try:
        # Count by kecamatan
        location_data = db.session.query(
            RentalAsset.kecamatan,
            func.count(RentalAsset.id).label('total'),
            func.sum(case((RentalAsset.status == 'available', 1), else_=0)).label('available'),
            func.sum(case((RentalAsset.status == 'rented', 1), else_=0)).label('rented'),
            func.avg(RentalAsset.harga_sewa).label('avg_price')
        ).group_by(RentalAsset.kecamatan).order_by(func.count(RentalAsset.id).desc()).all()
        
        # Format for charts
        chart_data = []
        for kecamatan, total, available, rented, avg_price in location_data:
            chart_data.append({
                'kecamatan': kecamatan,
                'total': total,
                'available': available or 0,
                'rented': rented or 0,
                'avg_price': float(avg_price) if avg_price else 0
            })
        
        return jsonify({
            'success': True,
            'data': chart_data
        })
        
    except Exception as e:
        print(f"Error in get_location_distribution: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/price-range-analysis', methods=['GET'])
def get_price_range_analysis():
    """Get price range distribution for histogram"""
    try:
        # Define price ranges
        price_ranges = [
            (0, 5000000, '< 5 Juta'),
            (5000000, 10000000, '5-10 Juta'),
            (10000000, 20000000, '10-20 Juta'),
            (20000000, 50000000, '20-50 Juta'),
            (50000000, float('inf'), '> 50 Juta')
        ]
        
        range_data = []
        for min_price, max_price, label in price_ranges:
            if max_price == float('inf'):
                count = RentalAsset.query.filter(RentalAsset.harga_sewa >= min_price).count()
            else:
                count = RentalAsset.query.filter(
                    and_(RentalAsset.harga_sewa >= min_price, RentalAsset.harga_sewa < max_price)
                ).count()
            
            range_data.append({
                'range': label,
                'count': count,
                'min_price': min_price,
                'max_price': max_price if max_price != float('inf') else None
            })
        
        # Get detailed price statistics
        price_stats = db.session.query(
            func.min(RentalAsset.harga_sewa).label('min_price'),
            func.max(RentalAsset.harga_sewa).label('max_price'),
            func.avg(RentalAsset.harga_sewa).label('avg_price'),
            func.count(RentalAsset.id).label('total_count')
        ).first()
        
        return jsonify({
            'success': True,
            'data': {
                'ranges': range_data,
                'statistics': {
                    'min_price': float(price_stats.min_price) if price_stats.min_price else 0,
                    'max_price': float(price_stats.max_price) if price_stats.max_price else 0,
                    'avg_price': float(price_stats.avg_price) if price_stats.avg_price else 0,
                    'total_count': price_stats.total_count
                }
            }
        })
        
    except Exception as e:
        print(f"Error in get_price_range_analysis: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/monthly-trends', methods=['GET'])
def get_monthly_trends():
    """Get monthly trends for line chart"""
    try:
        # Get current year
        current_year = datetime.utcnow().year
        
        # Assets created per month
        asset_trends = db.session.query(
            extract('month', RentalAsset.created_at).label('month'),
            func.count(RentalAsset.id).label('count')
        ).filter(
            extract('year', RentalAsset.created_at) == current_year
        ).group_by(extract('month', RentalAsset.created_at)).all()
        
        # Requests per month
        request_trends = db.session.query(
            extract('month', RentalRequest.created_at).label('month'),
            func.count(RentalRequest.id).label('count')
        ).filter(
            extract('year', RentalRequest.created_at) == current_year
        ).group_by(extract('month', RentalRequest.created_at)).all()
        
        # Format data for chart
        months = []
        assets_data = []
        requests_data = []
        
        # Convert to dictionaries for easier lookup
        asset_dict = {int(month): count for month, count in asset_trends}
        request_dict = {int(month): count for month, count in request_trends}
        
        # Fill all 12 months
        for month in range(1, 13):
            months.append(calendar.month_abbr[month])
            assets_data.append(asset_dict.get(month, 0))
            requests_data.append(request_dict.get(month, 0))
        
        return jsonify({
            'success': True,
            'data': {
                'months': months,
                'assets': assets_data,
                'requests': requests_data,
                'year': current_year
            }
        })
        
    except Exception as e:
        print(f"Error in get_monthly_trends: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/revenue-analysis', methods=['GET'])
def get_revenue_analysis():
    """Get revenue analysis including projections"""
    try:
        # Current revenue from active rentals
        active_revenue = db.session.query(
            func.sum(RentalTransaction.monthly_price).label('total_monthly')
        ).filter_by(status='active').first()
        
        current_monthly = float(active_revenue.total_monthly) if active_revenue.total_monthly else 0
        
        # Potential revenue from available assets
        potential_revenue = db.session.query(
            func.sum(RentalAsset.harga_sewa).label('total_potential')
        ).filter_by(status='available').first()
        
        potential_monthly = float(potential_revenue.total_potential) if potential_revenue.total_potential else 0
        
        # Revenue by asset type
        revenue_by_type = db.session.query(
            RentalAsset.asset_type,
            func.sum(RentalTransaction.monthly_price).label('revenue')
        ).join(RentalTransaction, RentalAsset.id == RentalTransaction.asset_id).filter(
            RentalTransaction.status == 'active'
        ).group_by(RentalAsset.asset_type).all()
        
        type_revenue = {}
        for asset_type, revenue in revenue_by_type:
            type_revenue[asset_type] = float(revenue) if revenue else 0
        
        # Calculate metrics
        total_possible = current_monthly + potential_monthly
        utilization_rate = (current_monthly / total_possible * 100) if total_possible > 0 else 0
        
        return jsonify({
            'success': True,
            'data': {
                'current_monthly_revenue': current_monthly,
                'potential_monthly_revenue': potential_monthly,
                'total_possible_revenue': total_possible,
                'utilization_rate': round(utilization_rate, 2),
                'annual_projection': current_monthly * 12,
                'revenue_by_type': type_revenue,
                'growth_opportunity': potential_monthly
            }
        })
        
    except Exception as e:
        print(f"Error in get_revenue_analysis: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/property-metrics', methods=['GET'])
def get_property_metrics():
    """Get detailed property metrics for advanced analytics"""
    try:
        # Size distribution for buildings
        size_metrics = db.session.query(
            func.avg(RentalAsset.luas_tanah).label('avg_land_size'),
            func.avg(RentalAsset.luas_bangunan).label('avg_building_size'),
            func.min(RentalAsset.luas_tanah).label('min_land_size'),
            func.max(RentalAsset.luas_tanah).label('max_land_size')
        ).first()
        
        # Certificate distribution
        certificate_dist = db.session.query(
            RentalAsset.sertifikat,
            func.count(RentalAsset.id).label('count')
        ).group_by(RentalAsset.sertifikat).all()
        
        # Zone type distribution
        zone_dist = db.session.query(
            RentalAsset.jenis_zona,
            func.count(RentalAsset.id).label('count'),
            func.avg(RentalAsset.harga_sewa).label('avg_price')
        ).group_by(RentalAsset.jenis_zona).all()
        
        # Building-specific metrics
        building_metrics = db.session.query(
            func.avg(RentalAsset.kamar_tidur).label('avg_bedrooms'),
            func.avg(RentalAsset.kamar_mandi).label('avg_bathrooms'),
            func.avg(RentalAsset.jumlah_lantai).label('avg_floors')
        ).filter_by(asset_type='bangunan').first()
        
        return jsonify({
            'success': True,
            'data': {
                'size_metrics': {
                    'avg_land_size': float(size_metrics.avg_land_size) if size_metrics.avg_land_size else 0,
                    'avg_building_size': float(size_metrics.avg_building_size) if size_metrics.avg_building_size else 0,
                    'min_land_size': float(size_metrics.min_land_size) if size_metrics.min_land_size else 0,
                    'max_land_size': float(size_metrics.max_land_size) if size_metrics.max_land_size else 0
                },
                'certificate_distribution': [
                    {'certificate': cert, 'count': count} for cert, count in certificate_dist
                ],
                'zone_distribution': [
                    {
                        'zone': zone, 
                        'count': count, 
                        'avg_price': float(avg_price) if avg_price else 0
                    } for zone, count, avg_price in zone_dist
                ],
                'building_metrics': {
                    'avg_bedrooms': float(building_metrics.avg_bedrooms) if building_metrics.avg_bedrooms else 0,
                    'avg_bathrooms': float(building_metrics.avg_bathrooms) if building_metrics.avg_bathrooms else 0,
                    'avg_floors': float(building_metrics.avg_floors) if building_metrics.avg_floors else 0
                } if building_metrics else {}
            }
        })
        
    except Exception as e:
        print(f"Error in get_property_metrics: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@visualization_dynamic.route('/api/dashboard/performance-indicators', methods=['GET'])
def get_performance_indicators():
    """Get key performance indicators"""
    try:
        # Calculate various KPIs
        total_assets = RentalAsset.query.count()
        
        # Request conversion rate
        total_requests = RentalRequest.query.count()
        approved_requests = RentalRequest.query.filter_by(status='active').count()
        conversion_rate = (approved_requests / total_requests * 100) if total_requests > 0 else 0
        
        # Average time to rent (placeholder - would need timestamp analysis)
        avg_time_to_rent = 15.5  # days
        
        # Asset utilization
        rented_count = RentalAsset.query.filter_by(status='rented').count()
        utilization_rate = (rented_count / total_assets * 100) if total_assets > 0 else 0
        
        # Price per sqm analysis
        price_per_sqm = db.session.query(
            func.avg(RentalAsset.harga_sewa / RentalAsset.luas_tanah).label('avg_price_per_sqm')
        ).filter(RentalAsset.luas_tanah > 0).first()
        
        # Recent performance (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_requests = RentalRequest.query.filter(RentalRequest.created_at >= thirty_days_ago).count()
        recent_approvals = RentalRequest.query.filter(
            and_(RentalRequest.created_at >= thirty_days_ago, RentalRequest.status == 'active')
        ).count()
        
        return jsonify({
            'success': True,
            'data': {
                'conversion_rate': round(conversion_rate, 2),
                'utilization_rate': round(utilization_rate, 2),
                'avg_time_to_rent': avg_time_to_rent,
                'avg_price_per_sqm': float(price_per_sqm.avg_price_per_sqm) if price_per_sqm.avg_price_per_sqm else 0,
                'recent_activity': {
                    'requests_30_days': recent_requests,
                    'approvals_30_days': recent_approvals,
                    'recent_conversion_rate': (recent_approvals / recent_requests * 100) if recent_requests > 0 else 0
                },
                'portfolio_health': {
                    'available_ratio': round((total_assets - rented_count) / total_assets * 100, 2) if total_assets > 0 else 0,
                    'maintenance_ratio': round(RentalAsset.query.filter_by(status='maintenance').count() / total_assets * 100, 2) if total_assets > 0 else 0
                }
            }
        })
        
    except Exception as e:
        print(f"Error in get_performance_indicators: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
