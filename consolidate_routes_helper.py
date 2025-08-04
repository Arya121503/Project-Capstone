#!/usr/bin/env python3
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
