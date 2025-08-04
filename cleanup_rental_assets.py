#!/usr/bin/env python3
"""
Comprehensive cleanup script to remove duplications and redundancies
"""

import os
import sys
import shutil
from datetime import datetime

def create_cleanup_backup():
    """Create a backup before cleanup"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = f"cleanup_backup_{timestamp}"
    
    print(f"📦 Creating backup directory: {backup_dir}")
    
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    backup_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), backup_dir)
    
    try:
        shutil.copytree(app_path, backup_path)
        print(f"✅ Backup created successfully at: {backup_path}")
        return backup_path
    except Exception as e:
        print(f"❌ Backup failed: {e}")
        return None

def remove_backup_files():
    """Remove .backup files"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🗑️ REMOVING BACKUP FILES")
    print("=" * 50)
    
    backup_files = [
        'dataset_updater.py.backup',
        'ml_predictor.py.backup', 
        'static/js/sewakan_aset_new.js.backup',
        'templates/dashboard_admin.html.backup'
    ]
    
    removed_files = []
    
    for backup_file in backup_files:
        file_path = os.path.join(app_path, backup_file)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                removed_files.append(backup_file)
                print(f"✅ Removed: {backup_file}")
            except Exception as e:
                print(f"❌ Failed to remove {backup_file}: {e}")
        else:
            print(f"⚠️  File not found: {backup_file}")
    
    return removed_files

def remove_empty_files():
    """Remove empty files (0 bytes)"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🗑️ REMOVING EMPTY FILES")
    print("=" * 50)
    
    empty_files = []
    
    for root, dirs, files in os.walk(app_path):
        dirs[:] = [d for d in dirs if d != '__pycache__']
        
        for file in files:
            file_path = os.path.join(root, file)
            
            if os.path.getsize(file_path) == 0:
                rel_path = os.path.relpath(file_path, app_path)
                empty_files.append(rel_path)
                
                try:
                    os.remove(file_path)
                    print(f"✅ Removed empty file: {rel_path}")
                except Exception as e:
                    print(f"❌ Failed to remove {rel_path}: {e}")
    
    return empty_files

def consolidate_route_files():
    """Consolidate duplicate route files"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🔄 CONSOLIDATING ROUTE FILES")
    print("=" * 50)
    
    # Check which routes_rental_assets file is more comprehensive
    old_routes = os.path.join(app_path, 'routes_rental_assets.py')
    new_routes = os.path.join(app_path, 'routes_rental_assets_new.py')
    
    if os.path.exists(old_routes) and os.path.exists(new_routes):
        old_size = os.path.getsize(old_routes)
        new_size = os.path.getsize(new_routes)
        
        print(f"📄 routes_rental_assets.py: {old_size} bytes")
        print(f"📄 routes_rental_assets_new.py: {new_size} bytes")
        
        if new_size > old_size:
            print("💡 routes_rental_assets_new.py is larger and likely more comprehensive")
            print("🔄 Consider manually reviewing and consolidating these files")
        else:
            print("💡 routes_rental_assets.py might be sufficient")
    
    return True

def cleanup_admin_notification_routes():
    """Analyze admin notification route duplications"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    
    print("\n🔄 ANALYZING ADMIN NOTIFICATION ROUTES")
    print("=" * 50)
    
    routes_admin = os.path.join(app_path, 'routes_admin.py')
    routes_admin_notifications = os.path.join(app_path, 'routes_admin_notifications_api.py')
    
    if os.path.exists(routes_admin) and os.path.exists(routes_admin_notifications):
        admin_size = os.path.getsize(routes_admin)
        notifications_size = os.path.getsize(routes_admin_notifications)
        
        print(f"📄 routes_admin.py: {admin_size} bytes")
        print(f"📄 routes_admin_notifications_api.py: {notifications_size} bytes")
        print("💡 These files have duplicate routes - consider consolidating")
    
    return True

def update_init_file():
    """Update __init__.py to reflect route changes"""
    app_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app')
    init_file = os.path.join(app_path, '__init__.py')
    
    print("\n📝 CHECKING __init__.py IMPORTS")
    print("=" * 50)
    
    if os.path.exists(init_file):
        try:
            with open(init_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check for imports of cleaned up files
            problematic_imports = []
            
            if 'routes_rental_assets_new' in content:
                problematic_imports.append('routes_rental_assets_new')
            
            if problematic_imports:
                print("⚠️  Found imports that may need updating:")
                for imp in problematic_imports:
                    print(f"   - {imp}")
                print("💡 Review __init__.py manually to consolidate imports")
            else:
                print("✅ No problematic imports found")
                
        except Exception as e:
            print(f"❌ Error reading __init__.py: {e}")
    
    return True

def generate_cleanup_report(backup_path, removed_files, empty_files):
    """Generate a cleanup report"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    report_content = f"""# CODE CLEANUP REPORT
Generated: {timestamp}

## 📦 Backup Created
- Location: {backup_path}
- Status: {'✅ Success' if backup_path else '❌ Failed'}

## 🗑️ Files Removed

### Backup Files Removed:
"""
    
    if removed_files:
        for file in removed_files:
            report_content += f"- ✅ {file}\n"
    else:
        report_content += "- No backup files removed\n"
    
    report_content += "\n### Empty Files Removed:\n"
    
    if empty_files:
        for file in empty_files:
            report_content += f"- ✅ {file}\n"
    else:
        report_content += "- No empty files found\n"
    
    report_content += """

## 🔄 Route Consolidation Required

### Manual Actions Needed:

1. **routes_rental_assets.py vs routes_rental_assets_new.py**
   - Review both files to determine which functionality to keep
   - Consolidate into a single file
   - Update imports in __init__.py

2. **routes_admin.py vs routes_admin_notifications_api.py**
   - These files have duplicate route definitions:
     - /api/admin/rental-requests/<int:request_id>
     - /api/admin/notifications
     - /api/admin/notifications/mark-all-read
     - /api/admin/rental-requests/<int:request_id>/approve
     - /api/admin/rental-requests/<int:request_id>/reject
   - Consolidate duplicate routes into one file

3. **Duplicate routes in routes_rental_assets_new.py**
   - The file has internal duplicate route definitions
   - Review and remove duplicates

## 🛠️ Next Steps

1. Test the application after cleanup
2. Run the audit script again to verify improvements
3. Consider implementing:
   - Code linting tools (flake8, pylint)
   - Pre-commit hooks to prevent duplications
   - Regular code reviews

## ⚠️ Important Notes

- Always test thoroughly after making changes
- Keep the backup until you're sure everything works
- Consider using git branches for major refactoring
"""

    report_file = "CLEANUP_REPORT.md"
    
    try:
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        print(f"\n📋 Cleanup report saved to: {report_file}")
    except Exception as e:
        print(f"❌ Failed to save report: {e}")

def main():
    """Main cleanup function"""
    print("🧹 CODE CLEANUP SCRIPT")
    print("=" * 60)
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    
    # Create backup first
    backup_path = create_cleanup_backup()
    
    if not backup_path:
        print("❌ Cannot proceed without backup. Exiting.")
        return
    
    # Perform cleanup
    removed_files = remove_backup_files()
    empty_files = remove_empty_files()
    consolidate_route_files()
    cleanup_admin_notification_routes()
    update_init_file()
    
    # Generate report
    generate_cleanup_report(backup_path, removed_files, empty_files)
    
    print("\n" + "=" * 60)
    print("🏁 CLEANUP COMPLETE")
    print("=" * 60)
    print("✅ Automatic cleanup finished")
    print("⚠️  Manual route consolidation still required")
    print(f"📦 Backup available at: {backup_path}")
    print("📋 See CLEANUP_REPORT.md for details")

if __name__ == "__main__":
    main()
