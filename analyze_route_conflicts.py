#!/usr/bin/env python3
"""
Script to consolidate conflicting route files and resolve duplications
"""

import os
import sys

def analyze_route_conflicts():
    """Analyze route conflicts between the two rental assets files"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("🔍 ANALYZING ROUTE CONFLICTS")
    print("=" * 60)
    
    old_routes_file = os.path.join(app_path, 'routes_rental_assets.py')
    new_routes_file = os.path.join(app_path, 'routes_rental_assets_new.py')
    
    # Extract routes from both files
    old_routes = extract_routes_from_file(old_routes_file)
    new_routes = extract_routes_from_file(new_routes_file)
    
    print(f"\n📄 routes_rental_assets.py routes ({len(old_routes)}):")
    for route in old_routes:
        print(f"   🛣️  {route}")
    
    print(f"\n📄 routes_rental_assets_new.py routes ({len(new_routes)}):")
    for route in new_routes:
        print(f"   🛣️  {route}")
    
    # Find overlapping and unique routes
    overlapping = set(old_routes) & set(new_routes)
    old_unique = set(old_routes) - set(new_routes)
    new_unique = set(new_routes) - set(old_routes)
    
    print(f"\n🔄 OVERLAPPING ROUTES ({len(overlapping)}):")
    for route in overlapping:
        print(f"   ⚠️  {route}")
    
    print(f"\n📄 UNIQUE TO routes_rental_assets.py ({len(old_unique)}):")
    for route in old_unique:
        print(f"   🟢 {route}")
    
    print(f"\n📄 UNIQUE TO routes_rental_assets_new.py ({len(new_unique)}):")
    for route in new_unique:
        print(f"   🟡 {route}")
    
    return old_routes, new_routes, overlapping, old_unique, new_unique

def extract_routes_from_file(file_path):
    """Extract route patterns from a Python file"""
    routes = []
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        import re
        # Match @blueprint.route patterns
        route_pattern = r"@\w+\.route\(['\"](.*?)['\"].*?\)"
        matches = re.findall(route_pattern, content)
        routes.extend(matches)
        
    except Exception as e:
        print(f"❌ Error reading {file_path}: {e}")
    
    return routes

def check_admin_route_conflicts():
    """Check conflicts between admin route files"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🔍 ANALYZING ADMIN ROUTE CONFLICTS")
    print("=" * 60)
    
    admin_routes_file = os.path.join(app_path, 'routes_admin.py')
    admin_notifications_file = os.path.join(app_path, 'routes_admin_notifications_api.py')
    
    admin_routes = extract_routes_from_file(admin_routes_file)
    admin_notification_routes = extract_routes_from_file(admin_notifications_file)
    
    print(f"\n📄 routes_admin.py routes ({len(admin_routes)}):")
    for route in admin_routes:
        print(f"   🛣️  {route}")
    
    print(f"\n📄 routes_admin_notifications_api.py routes ({len(admin_notification_routes)}):")
    for route in admin_notification_routes:
        print(f"   🛣️  {route}")
    
    # Find duplicates
    duplicates = set(admin_routes) & set(admin_notification_routes)
    
    print(f"\n🔴 DUPLICATE ADMIN ROUTES ({len(duplicates)}):")
    for route in duplicates:
        print(f"   ⚠️  {route}")
    
    return duplicates

def generate_consolidation_plan():
    """Generate a plan for consolidating the routes"""
    print("\n💡 CONSOLIDATION PLAN")
    print("=" * 60)
    
    plan = """
RECOMMENDED CONSOLIDATION STRATEGY:

1. 🎯 PRIMARY RENTAL ASSETS FILE:
   - Keep: routes_rental_assets_new.py (more comprehensive)
   - This file has more routes and functionality
   - Rename to: routes_rental_assets.py

2. 🔄 MERGE UNIQUE ROUTES:
   - Move unique routes from old routes_rental_assets.py to the new file
   - Ensure no functionality is lost

3. 🏗️ UPDATE BLUEPRINT STRUCTURE:
   - Use single blueprint name: rental_assets
   - Remove duplicate imports in __init__.py

4. 🧹 ADMIN ROUTES CLEANUP:
   - Choose one primary admin file (routes_admin.py recommended)
   - Move unique functionality from routes_admin_notifications_api.py
   - Remove duplicate route definitions

5. 📝 UPDATE IMPORTS:
   - Update __init__.py to use consolidated files
   - Test all endpoints after consolidation

IMPLEMENTATION STEPS:
1. Backup current files (already done by cleanup script)
2. Rename routes_rental_assets_new.py to routes_rental_assets_consolidated.py
3. Merge unique routes from old file
4. Update __init__.py imports
5. Test all functionality
6. Remove old files after testing
"""
    
    print(plan)

def create_consolidation_script():
    """Create a script to help with manual consolidation"""
    script_content = '''#!/usr/bin/env python3
"""
Manual consolidation helper script
Run this after manually reviewing and consolidating the route files
"""

import os
import shutil

def consolidate_rental_assets():
    """Consolidate rental assets routes"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    old_file = os.path.join(app_path, 'routes_rental_assets.py')
    new_file = os.path.join(app_path, 'routes_rental_assets_new.py')
    consolidated_file = os.path.join(app_path, 'routes_rental_assets_consolidated.py')
    
    print("🔄 Starting rental assets consolidation...")
    
    # Step 1: Copy the more comprehensive file as base
    if os.path.exists(new_file):
        shutil.copy2(new_file, consolidated_file)
        print(f"✅ Created base file: routes_rental_assets_consolidated.py")
    else:
        print("❌ routes_rental_assets_new.py not found")
        return False
    
    print("💡 Manual steps required:")
    print("1. Review routes_rental_assets.py for unique functionality")
    print("2. Add any missing routes to routes_rental_assets_consolidated.py")
    print("3. Test the consolidated file")
    print("4. Update __init__.py imports")
    print("5. Remove old files after testing")
    
    return True

def update_init_imports():
    """Update __init__.py imports after consolidation"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    init_file = os.path.join(app_path, '__init__.py')
    
    print("📝 Update __init__.py manually:")
    print("Replace:")
    print("   from .routes_rental_assets_new import rental_assets")
    print("   from .routes_rental_assets import rental_assets as rental_assets_api")
    print("With:")
    print("   from .routes_rental_assets_consolidated import rental_assets")
    print("And remove the duplicate registration line")

if __name__ == "__main__":
    consolidate_rental_assets()
    update_init_imports()
'''
    
    with open('consolidate_routes_helper.py', 'w', encoding='utf-8') as f:
        f.write(script_content)
    
    print(f"\n📋 Consolidation helper script created: consolidate_routes_helper.py")

def main():
    """Main analysis function"""
    print("🔍 ROUTE CONFLICT ANALYSIS")
    print("=" * 60)
    
    # Analyze rental assets conflicts
    old_routes, new_routes, overlapping, old_unique, new_unique = analyze_route_conflicts()
    
    # Analyze admin route conflicts  
    admin_duplicates = check_admin_route_conflicts()
    
    # Generate consolidation plan
    generate_consolidation_plan()
    
    # Create helper script
    create_consolidation_script()
    
    print("\n" + "=" * 60)
    print("🏁 ANALYSIS COMPLETE")
    print("=" * 60)
    
    print(f"📊 SUMMARY:")
    print(f"   - Rental Assets Overlapping Routes: {len(overlapping)}")
    print(f"   - Old File Unique Routes: {len(old_unique)}")
    print(f"   - New File Unique Routes: {len(new_unique)}")
    print(f"   - Admin Duplicate Routes: {len(admin_duplicates)}")
    
    print(f"\n💡 NEXT STEPS:")
    print(f"   1. Review the consolidation plan above")
    print(f"   2. Manually merge route files based on analysis")
    print(f"   3. Use consolidate_routes_helper.py for assistance")
    print(f"   4. Test thoroughly after consolidation")

if __name__ == "__main__":
    main()
