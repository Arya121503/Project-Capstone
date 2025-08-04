# CODE DUPLICATION AUDIT REPORT
==================================================

## CLASS METHODS
------------------------------

**for** found in 5 files:
  - app\database.py
  - app\routes.py
  - app\routes.py
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-utils.js

**to** found in 5 files:
  - app\models_user.py
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-main.js

**after** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashboard-user-utils.js

**based** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-transactions.js

**from** found in 3 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\sewakan_aset_new.js

**UserNotificationManager** found in 2 files:
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

## ROUTE DEFINITIONS
------------------------------

**/api/kecamatan-list** found in 3 files:
  - app\routes.py
  - app\routes_rental_assets.py
  - app\routes_rental_assets_new.py

**/api/admin/notifications** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**/api/admin/notifications/mark-read/<int:notification_id>** found in 2 files:
  - app\routes.py
  - app\routes_admin.py

**/api/admin/notifications/mark-all-read** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**/api/admin/rental-requests** found in 2 files:
  - app\routes.py
  - app\routes_admin.py

**/api/admin/rental-requests/<int:request_id>/approve** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**/api/admin/rental-requests/<int:request_id>/reject** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**/admin/notifications** found in 2 files:
  - app\routes.py
  - app\routes_admin.py

**/api/user/notifications/mark-all-read** found in 2 files:
  - app\routes.py
  - app\routes_user_notifications_api.py

**/api/user/notifications** found in 2 files:
  - app\routes.py
  - app\routes_user_notifications_api.py

**/api/dashboard/stats** found in 2 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py

**/api/dashboard/monthly-trends** found in 2 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py

**/api/dashboard/location-distribution** found in 2 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py

**/api/dashboard/price-range-analysis** found in 2 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py

**/api/dashboard/revenue-analysis** found in 2 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py

**/api/admin/rental-requests/<int:request_id>** found in 2 files:
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**/api/assets** found in 2 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py

**/api/assets/<int:asset_id>** found in 3 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py

**/api/rental-requests** found in 2 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py

**/api/end-rental/<int:rental_id>** found in 2 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_transaction.py

## API ENDPOINTS
------------------------------

**'/api/visualization/stats'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/location-analysis'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/property-type-distribution'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/certificate-analysis'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/price-range-distribution'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/trend-analysis'** found in 3 files:
  - app\routes.py
  - app\templates\dashboard_admin.html
  - app\static\js\visualization.js

**'/api/visualization/model-performance'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/data-info'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/filtered-data'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/visualization/quick-stats'** found in 2 files:
  - app\routes.py
  - app\static\js\visualization.js

**'/api/locations'** found in 2 files:
  - app\routes.py
  - app\templates\data.html

**'/api/kecamatan-list'** found in 4 files:
  - app\routes.py
  - app\routes_rental_assets.py
  - app\routes_rental_assets_new.py
  - app\templates\dashboard_admin.html

**'/api/statistics'** found in 2 files:
  - app\routes.py
  - app\templates\visualization.html

**'/api/admin/notifications'** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**'/api/admin/notifications/mark-read/<int:notification_id>'** found in 2 files:
  - app\routes.py
  - app\routes_admin.py

**'/api/admin/notifications/mark-all-read'** found in 5 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**'/api/admin/rental-requests'** found in 2 files:
  - app\routes.py
  - app\routes_admin.py

**'/api/admin/rental-requests/<int:request_id>/approve'** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**'/api/admin/rental-requests/<int:request_id>/reject'** found in 3 files:
  - app\routes.py
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**'/api/user/notifications/mark-all-read'** found in 5 files:
  - app\routes.py
  - app\routes_user_notifications_api.py
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**'/api/predict-rental-price'** found in 4 files:
  - app\routes.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**'/api/user/notifications'** found in 2 files:
  - app\routes.py
  - app\routes_user_notifications_api.py

**'/api/update-prediction-dataset'** found in 2 files:
  - app\routes.py
  - app\templates\dashboard_admin.html

**'/api/get-model-info'** found in 2 files:
  - app\routes.py
  - app\templates\dashboard_admin.html

**'/api/dashboard/stats'** found in 7 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**'/api/dashboard/monthly-trends'** found in 4 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**'/api/dashboard/location-distribution'** found in 5 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**'/api/dashboard/price-range-analysis'** found in 4 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**'/api/dashboard/revenue-analysis'** found in 4 files:
  - app\routes.py
  - app\routes_visualization_dynamic.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**'/api/admin/rental-requests/<int:request_id>'** found in 2 files:
  - app\routes_admin.py
  - app\routes_admin_notifications_api.py

**'/api/admin/rental-request-count'** found in 3 files:
  - app\routes_admin.py
  - app\templates\admin_notifications.html
  - app\static\js\admin-rental-requests.js

**'/api/admin/notifications/count'** found in 3 files:
  - app\routes_admin_notifications_api.py
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**'/api/midtrans/create-payment'** found in 3 files:
  - app\routes_midtrans.py
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**'/api/midtrans/verify-payment'** found in 3 files:
  - app\routes_midtrans.py
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**'/api/test-payment'** found in 2 files:
  - app\routes_payment_test.py
  - app\templates\dashboard_user.html

**'/api/available-assets'** found in 2 files:
  - app\routes_rental_assets.py
  - app\templates\dashboard_admin.html

**'/api/submit-rental-request'** found in 3 files:
  - app\routes_rental_assets.py
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**'/api/user-notifications'** found in 2 files:
  - app\routes_rental_assets.py
  - app\static\js\dashboard-user-notifications.js

**'/api/assets'** found in 2 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py

**'/api/assets/<int:asset_id>'** found in 3 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py

**'/api/rental-requests'** found in 3 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_assets_new.py
  - app\static\js\dashAdmin.js

**'/api/end-rental/<int:rental_id>'** found in 2 files:
  - app\routes_rental_assets_new.py
  - app\routes_rental_transaction.py

**'/api/create-rental-transaction'** found in 2 files:
  - app\routes_rental_transaction.py
  - app\templates\dashboard_user.html

**'/api/user-dashboard-stats'** found in 2 files:
  - app\routes_user_dashboard_api.py
  - app\static\js\dashboard-user-stats.js

**'/api/user-favorites/count'** found in 3 files:
  - app\routes_user_favorites.py
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js

**'/api/user/notifications/unread-count'** found in 5 files:
  - app\routes_user_notifications_api.py
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js
  - app\static\js\user-notifications.js

**'/api/user/rental-transactions'** found in 2 files:
  - app\routes_user_rental_transactions_api.py
  - app\static\js\dashboard-user-transactions.js

**'/api/user/rental-transactions/dashboard-summary'** found in 2 files:
  - app\routes_user_rental_transactions_api.py
  - app\static\js\user-rental-transactions.js

**'/api/save-rental-prediction'** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**'/api/predict-tanah-all-models'** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html

**'/api/save-tanah-prediction'** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**`/api/admin/notifications/${notificationId}/mark-read`** found in 2 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**`/api/admin/rental-requests/${requestId}`** found in 2 files:
  - app\static\js\admin_notifications.js
  - app\static\js\sewakan_aset_new.js

**`/api/aset-tersedia?${params}`** found in 2 files:
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets.js

**`/api/toggle-favorite/${assetId}`** found in 2 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js

**`/api/visualization/stats?data_type=${dataType}&data_source=${dataSource}`** found in 2 files:
  - app\static\js\simple_visualization.js
  - app\static\js\visualization_handler.js

**`/api/visualization/location-analysis?data_type=${dataType}&data_source=${dataSource}`** found in 2 files:
  - app\static\js\simple_visualization.js
  - app\static\js\visualization_handler.js

**'/api/user/notifications?per_page=10'** found in 3 files:
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**`/api/user/notifications/${notificationId}/mark-read`** found in 3 files:
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**`/api/user/rental-applications/${applicationId}`** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

## NOTIFICATION FUNCTIONS
------------------------------

**alert** found in 466 files:
  - app\routes_midtrans.py
  - app\routes_midtrans.py
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\data.html
  - app\templates\data.html
  - app\templates\data.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\edit_profile.html
  - app\templates\edit_profile.html
  - app\templates\edit_profile.html
  - app\templates\edit_profile.html
  - app\templates\edit_profile.html
  - app\templates\manajemen_aset.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\user_rental_applications.html
  - app\templates\user_rental_applications.html
  - app\templates\user_rental_transactions.html
  - app\templates\user_rental_transactions.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-debug.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-refresh.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_visualization.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js
  - app\static\js\user-notifications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js

**Alert** found in 102 files:
  - app\templates\admin_rental_requests.html
  - app\templates\admin_rental_requests.html
  - app\templates\dashboard_admin_rental_requests.html
  - app\templates\dashboard_admin_rental_requests.html
  - app\templates\dashboard_admin_rental_section.html
  - app\templates\dashboard_admin_rental_section.html
  - app\templates\dashboard_user.html
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**console.log** found in 490 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\templates\test_notebook_charts.html
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\adminNotifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\api-fallback.js
  - app\static\js\chart-canvas-fix.js
  - app\static\js\chart-canvas-fix.js
  - app\static\js\chart-canvas-fix.js
  - app\static\js\chart-canvas-fix.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-debug.js
  - app\static\js\dashboard-user-debug.js
  - app\static\js\dashboard-user-debug.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-stats.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-notification-handler.js
  - app\static\js\favorite-notification-handler.js
  - app\static\js\favorite-notification-handler.js
  - app\static\js\favorite-notification-handler.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\immediate_chart_creator.js
  - app\static\js\modal_fix_new.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_charts_immediate.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\notebook_chart_fix.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\status_badge_fix.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js

**showNotification** found in 20 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js

## FETCH CALLS
------------------------------

**/api/admin/rental-request-count** found in 2 files:
  - app\templates\admin_notifications.html
  - app\static\js\admin-rental-requests.js

**/api/save-rental-prediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/predict-tanah-all-models** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/save-tanah-prediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/predict-rental-price** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/rental/api/assets/${assetId}** found in 13 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\favorite-handler.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**/api/dashboard/stats** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**/api/dashboard/monthly-trends** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/dashboard/location-distribution** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/dashboard/price-range-analysis** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/dashboard/revenue-analysis** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**/api/visualization/trend-analysis** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\visualization.js

**/rental/api/rental-assets/${id}** found in 4 files:
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html

**/rental/api/assets** found in 3 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\sewakan_aset_new.js

**/api/admin/notifications/count** found in 2 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**/api/admin/notifications/${notificationId}/mark-read** found in 2 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**/api/admin/notifications/mark-all-read** found in 2 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**/api/admin/rental-requests/${requestId}** found in 2 files:
  - app\static\js\admin_notifications.js
  - app\static\js\sewakan_aset_new.js

**/api/midtrans/create-payment** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**/api/midtrans/verify-payment** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**/api/submit-rental-request** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**/api/toggle-favorite/${assetId}** found in 2 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js

**/api/user-favorites/count** found in 2 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js

**${this.apiBasePath}/${assetId}** found in 4 files:
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js

**/api/user/notifications?per_page=10** found in 3 files:
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**/api/user/notifications/unread-count** found in 4 files:
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js
  - app\static\js\user-notifications.js

**/api/user/notifications/${notificationId}/mark-read** found in 3 files:
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**/api/user/notifications/mark-all-read** found in 3 files:
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**/api/user/rental-applications/${applicationId}** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

## FUNCTION DEFS JS
------------------------------

**displayRentalPredictionResults** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html

**displayRentalInsights** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**generateEnhancedInsights** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**getPriceCategory** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**getMarketSegmentInsight** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**addPriceRangeDisplay** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**formatCurrency** found in 8 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\favorite-handler.js
  - app\static\js\visualization-enhanced-dummy.js

**handlePropertyTypeChange** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**handleRentalFormSubmit** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**saveRentalPrediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**getStatusBadge** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html

**updatePagination** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashboard-user-database.js

**editAsset** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_asset_detail.html

**deleteAsset** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html

**loadDashboardStats** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashboard-user-stats.js

**updateTrendChart** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js

**displayMarketTrendChart** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\visualization-enhanced-dummy.js

**exportReport** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js

**generateCustomReport** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**scheduleReport** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**loadAvailableAssets** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashboard-user-database.js

**setupAssetBadgeProtection** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**viewRequestDetails** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**showNotification** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**loadLocationPerformance** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js

**toggleFavorite** found in 5 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-inline-functions.js

**showAsetDetail** found in 6 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-rental.js

**showRentalForm** found in 6 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-rental.js

**loadAssetDetails** found in 3 files:
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html

**displayAssetDetails** found in 2 files:
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html

**formatNumber** found in 4 files:
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_asset_detail.html
  - app\static\js\dashAdmin.js

**viewGallery** found in 2 files:
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html

**initializeCharts** found in 2 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js

**updateMainChart** found in 2 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js

**exportData** found in 2 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js

**viewRentalDetails** found in 4 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-inline-functions.js

**smoothScrollToSection** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js

**loadRentalRequests** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashboard-user-history.js

**getStatusBadgeClass** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashboard-user-transactions.js

**showMockData** found in 3 files:
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js

**displayAsetData** found in 3 files:
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js

**loadAsetDataWithRetry** found in 4 files:
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-simple.js

**submitRentalForm** found in 2 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js

**showToast** found in 2 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js

**updateTotalCost** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**handlePayment** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**handlePaymentSuccess** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**handlePaymentPending** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**handlePaymentError** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**submitRentalRequest** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**showConfirmationModal** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**showAlert** found in 3 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-rental.js

**showLoadingModal** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**hideLoadingModal** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**cancelRentalRequest** found in 3 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-inline-functions.js

**showError** found in 2 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-utils.js

**executedFunction** found in 3 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\visualization.js

## DOM SELECTORS
------------------------------

**rentalPriceResult** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**rentalPriceRange** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**rentalConfidence** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html

**rentalPredictionResults** found in 9 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html

**rentalNoPrediction** found in 7 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**rentalInsightsContainer** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**rentalPropertyType** found in 10 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalBangunanFields** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html

**rentalKepadatanPendudukField** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**rentalLuasBangunan** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalKamarTidur** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalKamarMandi** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalJumlahLantai** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalDayaListrik** found in 7 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalKondisiProperti** found in 6 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalKepadatanPenduduk** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**rentalPredictionForm** found in 6 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\prediksi_harga_aset.html

**saveRentalPrediction** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**totalAssetCount** found in 7 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\sewakan_aset_new.js

**vizOccupancyProgress** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**dashboard-home** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**saveTanahPrediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**saveBangunanPrediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**trendPeriod** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js

**trendMetric** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js

**filterKecamatan** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**filterStatus** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**sentAssetsTableBody** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**tanahForm** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**tanahNoPrediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**tanahPredictionResults** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**tanahPredictionContent** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**sent-assets-tab** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**bangunanForm** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**bangunanNoPrediction** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**bangunanPredictionResults** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**bangunanPredictionContent** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**assetDetailContent** found in 6 files:
  - app\templates\dashboard_admin.html
  - app\templates\data.html
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**assetDetailModal** found in 9 files:
  - app\templates\dashboard_admin.html
  - app\templates\data.html
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**deleteAssetName** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html
  - app\static\js\sewakan_aset_new.js

**deleteAssetModal** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\sewakan_aset_new.js

**confirmDeleteAsset** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\sewakan_aset_new.js

**vizActiveRenters** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizTotalAssets** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizPendingRequests** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizMonthlyRevenue** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizRentedAssetsCount** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizOccupancyRate** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizActiveAssetsCount** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizRevenueGrowth** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizAvgRentalPrice** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizPriceRange** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizNewRentersThisMonth** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizAvgRentalDuration** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizApprovedRequests** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizExpiringContracts** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizRetentionRate** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**vizRenewalRate** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js

**totalRequestsCount** found in 9 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\sewakan_aset_new.js

**currentYear** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**monthlyTrendsChart** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js

**assetTypeChart** found in 6 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js

**tanahCount** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**bangunanCount** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**locationChart** found in 9 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization.js

**availableStatusCount** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**rentedStatusCount** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**statusChart** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js

**priceRangeChart** found in 7 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js

**currentRevenue** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js

**potentialRevenue** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js

**utilizationRate** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js

**revenueChart** found in 6 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js

**visualization-message** found in 14 files:
  - app\templates\dashboard_admin.html
  - app\static\js\immediate_chart_creator.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\simple_chart_creator.js
  - app\static\js\simple_visualization.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization_handler.js
  - app\static\js\visualization_handler.js

**marketTrendChart** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js

**totalRevenue** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**avgRevenuePerAsset** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html

**availableAssetsList** found in 8 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\sewakan_aset_new.js

**assetPagination** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js

**rentedAssetsList** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\sewakan_aset_new.js

**apiStatusIndicator** found in 6 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js

**assetType** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\sewakan_aset_new.js

**addRentalAssetForm** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\static\js\sewakan_aset_new.js

**available-assets-tab** found in 3 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\sewakan_aset_new.js

**pendingRequestsCount** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\sewakan_aset_new.js

**approvedRequestsCount** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\sewakan_aset_new.js

**rejectedRequestsCount** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\sewakan_aset_new.js

**pendingRequestsBadge** found in 5 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\dashAdmin.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\status_badge_fix.js

**locationPerformanceTable** found in 4 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**favoriteBadge** found in 6 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\favorite-handler.js

**totalFavorit** found in 6 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-stats.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\favorite-handler.js

**notificationToggleBtn** found in 7 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-notifications.js
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**sewa-tab** found in 6 files:
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**startDate** found in 8 files:
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**rentalDuration** found in 10 files:
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**paymentLoading** found in 3 files:
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html
  - app\templates\dashboard_user.html

**locationFilter** found in 10 files:
  - app\templates\data.html
  - app\templates\data.html
  - app\templates\data.html
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-refresh.js
  - app\static\js\dashboard-user-refresh.js

**assetTypeFilter** found in 8 files:
  - app\templates\data.html
  - app\templates\data.html
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-refresh.js
  - app\static\js\dashboard-user-refresh.js

**bedroomFilter** found in 2 files:
  - app\templates\data.html
  - app\templates\data.html

**priceRange** found in 4 files:
  - app\templates\data.html
  - app\templates\data.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**assetContainer** found in 3 files:
  - app\templates\data.html
  - app\templates\data.html
  - app\templates\data.html

**noResultsState** found in 3 files:
  - app\templates\data.html
  - app\templates\data.html
  - app\templates\data.html

**loadingState** found in 2 files:
  - app\templates\data.html
  - app\templates\data.html

**totalAssets** found in 5 files:
  - app\templates\data.html
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**assetDetailContainer** found in 6 files:
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html

**photoGalleryModal** found in 2 files:
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html

**rentalSertifikat** found in 2 files:
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalTingkatKeamanan** found in 2 files:
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**rentalAksesibilitas** found in 2 files:
  - app\templates\prediksi_harga_aset.html
  - app\templates\prediksi_harga_aset.html

**notebookPropertyChart** found in 3 files:
  - app\templates\test_notebook_charts.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_charts_immediate.js

**notebookKecamatanChart** found in 3 files:
  - app\templates\test_notebook_charts.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_charts_immediate.js

**notebookPriceChart** found in 3 files:
  - app\templates\test_notebook_charts.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_charts_immediate.js

**notebookRevenueChart** found in 3 files:
  - app\templates\test_notebook_charts.html
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\notebook_charts_immediate.js

**updateChart** found in 6 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\simple_visualization.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js

**avgPrice** found in 2 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js

**maxPrice** found in 2 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js

**minPrice** found in 2 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js

**mainChart** found in 8 files:
  - app\templates\visualization.html
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js

**chartType** found in 7 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js

**groupBy** found in 4 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization_handler.js

**metric** found in 5 files:
  - app\templates\visualization.html
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js

**edit_asset_type** found in 2 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html

**rentalAssetsTableBody** found in 4 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html

**edit_asset_id** found in 2 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html

**editAssetModal** found in 4 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**editAssetForm** found in 3 files:
  - app\templates\admin\rental_assets.html
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**delete_asset_id** found in 2 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html

**notificationsDropdownContent** found in 2 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**notificationDropdown** found in 3 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js

**notificationBell** found in 3 files:
  - app\static\js\admin-notification-fix.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js

**rentalRequestsContainer** found in 4 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**approveRentalModal** found in 2 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**approveAdminNotes** found in 2 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**rejectRentalModal** found in 2 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**rejectAdminNotes** found in 4 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**adminRentalDetailModal** found in 2 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**allNotificationsModal** found in 7 files:
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js

**menu-btn** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js

**close-btn** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js

**dataSource** found in 7 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js

**timePeriod** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js

**generateReport** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js

**loadingIndicator** found in 2 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js

**propertyTypeChart** found in 3 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js

**trendChart** found in 3 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js

**modelMetricsChart** found in 3 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js

**certificateChart** found in 3 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js

**pricePerSqmChart** found in 3 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\visualization.js

**rentalRequestsList** found in 3 files:
  - app\static\js\dashAdmin.js
  - app\static\js\dashAdmin.js
  - app\static\js\sewakan_aset_new.js

**assetGrid** found in 10 files:
  - app\static\js\dashboard-user-assets-fix.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-refresh.js

**rentalFormModal** found in 13 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**rentalForm** found in 2 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js

**toastContainer** found in 2 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js

**priceFilter** found in 6 files:
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-refresh.js
  - app\static\js\dashboard-user-refresh.js

**alertContainer** found in 8 files:
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-inline-functions.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-utils.js
  - app\static\js\sewakan_aset_new.js

**totalAset** found in 4 files:
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-stats.js
  - app\static\js\dashboard-user-stats.js

**rentNowBtn** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**assetId** found in 4 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**rentalRequestForm** found in 6 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**totalRentalCost** found in 4 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**submitRentalBtn** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**payNowBtn** found in 7 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**confirmRentalModal** found in 4 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**confirmRentalContent** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**confirmRentalBtn** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**loadingModal** found in 4 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**favoritContainer** found in 6 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**filterJenisFavorit** found in 4 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**filterKecamatanFavorit** found in 4 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**favoritCount** found in 5 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**reloadFavoritBtn** found in 2 files:
  - app\static\js\dashboard-user-favorites.js
  - app\static\js\favorite-handler.js

**pengajuanContainer** found in 3 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js

**timelineContainer** found in 2 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js

**totalHistori** found in 3 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-stats.js
  - app\static\js\dashboard-user-stats.js

**filterJenisAktivitas** found in 8 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**filterStatusHistori** found in 9 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**filterPeriode** found in 9 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**rentalDetailModal** found in 2 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js

**pengajuan-tab** found in 2 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js

**semua-tab** found in 2 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js

**rentalDetailsModal** found in 3 files:
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-history.js

**userNotificationsDropdown** found in 7 files:
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-main.js
  - app\static\js\dashboard-user-notifications.js
  - app\static\js\dashboard-user-notifications.js
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js

**userNotificationsDropdownContent** found in 6 files:
  - app\static\js\dashboard-user-notifications.js
  - app\static\js\user-notification-system.js
  - app\static\js\user-notifications-enhanced.js
  - app\static\js\user-notifications.js
  - app\static\js\user-notifications.js
  - app\static\js\user-notifications.js

**markAllUserNotificationsRead** found in 2 files:
  - app\static\js\dashboard-user-notifications.js
  - app\static\js\user-notification-system.js

**transactionLoadingIndicator** found in 3 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**noTransactionsIndicator** found in 2 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**transactionsListContainer** found in 3 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**transactionDetailModal** found in 2 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\user-rental-transactions.js

**transactionDetailContent** found in 2 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\user-rental-transactions.js

**extensionRequestModal** found in 4 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**extensionMonths** found in 7 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**submitExtensionBtn** found in 3 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**extensionTransactionId** found in 3 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**extensionNotes** found in 3 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\user-rental-transactions.js

**extensionCost** found in 2 files:
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js

**noteText** found in 3 files:
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**saveNoteBtn** found in 3 files:
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**activeAssetsCount** found in 2 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**rentedAssetsCount** found in 2 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**occupancyRate** found in 2 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**occupancyProgress** found in 5 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization-enhanced-dummy.js

**monthlyRevenue** found in 2 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**avgRentalPrice** found in 2 files:
  - app\static\js\notebook_analytics_integration.js
  - app\static\js\property_analytics_enhanced.js

**confirmModal** found in 2 files:
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**requestDetailModal** found in 2 files:
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**dataType** found in 3 files:
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\visualization_handler.js

**main-charts-container** found in 2 files:
  - app\static\js\simple_visualization.js
  - app\static\js\visualization_handler.js

**topPriceTable** found in 8 files:
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\visualization-dummy-data.js
  - app\static\js\visualization-enhanced-dummy.js
  - app\static\js\visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js
  - app\static\js\visualization_handler.js

**dataStatus** found in 5 files:
  - app\static\js\simple_visualization.js
  - app\static\js\simple_visualization.js
  - app\static\js\visualization.js
  - app\static\js\visualization_handler.js
  - app\static\js\visualization_handler.js

**lastUpdateTime** found in 2 files:
  - app\static\js\simple_visualization.js
  - app\static\js\visualization.js

**filterBtn** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js

**resetBtn** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js

**searchInput** found in 6 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**editApplicationForm** found in 3 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**confirmCancelBtn** found in 3 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**statusFilter** found in 4 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**applicationsContainer** found in 3 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**paginationContainer** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js

**editStartDate** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**editTotalMonths** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**editUserPhone** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**editApplicationModal** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**confirmCancelModal** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js

**extensionRequestForm** found in 2 files:
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**transactionsContainer** found in 3 files:
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

**extensionCostInfo** found in 3 files:
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js
  - app\static\js\user-rental-transactions.js

## RENTAL API ENDPOINTS
------------------------------

**`/rental/api/assets/${assetId}`** found in 13 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\favorite-handler.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**`/rental/api/rental-assets/${id}`** found in 4 files:
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html

**'/rental/api/assets'** found in 4 files:
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\direct_asset_actions.js
  - app\static\js\sewakan_aset_new.js

**`/rental/api/assets/available?${params}`** found in 3 files:
  - app\static\js\dashboard-user-assets-mock.js
  - app\static\js\dashboard-user-assets.js
  - app\static\js\sewakan_aset_new.js

## ASSET FUNCTIONS
------------------------------

**editAsset** found in 39 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\detail_rental_asset.html
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_asset_detail.html
  - app\templates\admin\rental_asset_detail.html
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**deleteAsset** found in 31 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\templates\admin\rental_assets.html
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**DeleteAsset** found in 8 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**viewAssetDetail** found in 11 files:
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\templates\dashboard_admin.html
  - app\static\js\direct_asset_actions.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**EditAsset** found in 11 files:
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\direct_asset_actions.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\modal_fix_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

## MODAL FUNCTIONS
------------------------------

**Modal(document.getElementById('assetDetailModal')** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\data.html

**Modal(document.getElementById('deleteAssetModal')** found in 2 files:
  - app\templates\dashboard_admin.html
  - app\templates\admin\rental_assets.html

**Modal(document.getElementById('photoGalleryModal')** found in 2 files:
  - app\templates\detail_rental_asset.html
  - app\templates\admin\rental_asset_detail.html

**Modal(document.getElementById('editAssetModal')** found in 2 files:
  - app\templates\admin\rental_assets.html
  - app\static\js\sewakan_aset_new.js

**Modal(${request.id})** found in 2 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**Modal(requestId)** found in 2 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\admin-rental-requests.js

**Modal(detailModal)** found in 5 files:
  - app\static\js\admin-rental-requests.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-history.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\sewakan_aset_new.js

**Modal()** found in 25 files:
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**Modal(data.data)** found in 5 files:
  - app\static\js\admin_notifications.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-transactions.js

**Modal(modal, rentalRequest)** found in 2 files:
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js

**Modal(modal)** found in 10 files:
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-assets-simple.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\dashboard-user-transactions.js
  - app\static\js\favorite-handler.js
  - app\static\js\favorite-handler.js

**Modal(${notification.id})** found in 2 files:
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js

**Modal(notificationId)** found in 2 files:
  - app\static\js\admin_notifications.js
  - app\static\js\admin_notifications.js

**Modal(asetData)** found in 2 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js

**Modal(assetId, assetType)** found in 2 files:
  - app\static\js\dashboard-user-assets-interactive.js
  - app\static\js\dashboard-user-assets-interactive.js

**Modal(rentalModal)** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**Modal('Memproses pembayaran...')** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**Modal('Memverifikasi pembayaran...')** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**Modal(asset, startDate, totalMonths)** found in 4 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**Modal(confirmModal)** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**Modal(message = 'Loading...')** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**Modal(loadingModal)** found in 2 files:
  - app\static\js\dashboard-user-database.js
  - app\static\js\dashboard-user-rental.js

**Modal(currentAsset)** found in 3 files:
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js

**Modal(asset)** found in 5 files:
  - app\static\js\dashboard-user-rental.js
  - app\static\js\dashboard-user-rental.js
  - app\static\js\favorite-handler.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**Modal(modalElement)** found in 3 files:
  - app\static\js\modal_fix_new.js
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**Modal(data.data || data.asset)** found in 2 files:
  - app\static\js\sewakan_aset_new.js
  - app\static\js\sewakan_aset_new.js

**Modal(application)** found in 2 files:
  - app\static\js\user-rental-applications.js
  - app\static\js\user-rental-applications.js
# SPECIFIC DUPLICATION ANALYSIS
==================================================

## viewAssetDetail implementations:
  - app\templates\dashboard_admin.html (5 occurrences)
  - app\static\js\direct_asset_actions.js (1 occurrences)
  - app\static\js\modal_fix_new.js (3 occurrences)
  - app\static\js\sewakan_aset_new.js (2 occurrences)

## editAsset implementations:
  - app\templates\dashboard_admin.html (8 occurrences)
  - app\templates\detail_rental_asset.html (2 occurrences)
  - app\templates\admin\rental_assets.html (10 occurrences)
  - app\templates\admin\rental_asset_detail.html (2 occurrences)
  - app\static\js\direct_asset_actions.js (2 occurrences)
  - app\static\js\modal_fix_new.js (3 occurrences)
  - app\static\js\sewakan_aset_new.js (12 occurrences)

## deleteAsset implementations:
  - app\templates\dashboard_admin.html (9 occurrences)
  - app\templates\admin\rental_assets.html (9 occurrences)
  - app\static\js\direct_asset_actions.js (2 occurrences)
  - app\static\js\modal_fix_new.js (3 occurrences)
  - app\static\js\sewakan_aset_new.js (8 occurrences)

## API Endpoint Analysis:

**/api/rental-assets**:
  - app\test_api_rental_assets.py (3 occurrences)
  - app\templates\detail_rental_asset.html (3 occurrences)
  - app\templates\admin\rental_asset_detail.html (2 occurrences)

**/rental/api/assets**:
  - app\templates\dashboard_admin.html (4 occurrences)
  - app\templates\admin\rental_assets.html (5 occurrences)
  - app\static\js\dashboard-user-assets-mock.js (1 occurrences)
  - app\static\js\dashboard-user-assets.js (1 occurrences)
  - app\static\js\dashboard-user-rental.js (2 occurrences)
  - app\static\js\direct_asset_actions.js (1 occurrences)
  - app\static\js\favorite-handler.js (1 occurrences)
  - app\static\js\sewakan_aset_new.js (7 occurrences)

**/api/asset-detail**:
  - app\routes_rental_assets.py (1 occurrences)

**/api/available-assets**:
  - app\routes_rental_assets.py (1 occurrences)
  - app\templates\dashboard_admin.html (1 occurrences)
  - app\static\js\dashboard-user-database.js (1 occurrences)
# JAVASCRIPT FILE ANALYSIS
==================================================

## ADMIN related files (4):
  - admin-notification-fix.js (9257 bytes)
  - admin-rental-requests.js (26337 bytes)
  - adminNotifications.js (579 bytes)
  - admin_notifications.js (27063 bytes)

## DASHBOARD-ADMIN related files (2):
  - dashboard-admin-buttons.js (0 bytes)
  - dashboard-admin-prediction.js (0 bytes)

## DASHBOARD-USER related files (17):
  - dashboard-user-assets-fix.js (4762 bytes)
  - dashboard-user-assets-interactive.js (18832 bytes)
  - dashboard-user-assets-mock.js (9621 bytes)
  - dashboard-user-assets-simple.js (14722 bytes)
  - dashboard-user-assets.js (23945 bytes)
  - dashboard-user-database.js (36636 bytes)
  - dashboard-user-debug.js (1680 bytes)
  - dashboard-user-favorites.js (15931 bytes)
  - dashboard-user-history.js (41864 bytes)
  - dashboard-user-inline-functions.js (3304 bytes)
  - dashboard-user-main.js (6139 bytes)
  - dashboard-user-notifications.js (7526 bytes)
  - dashboard-user-refresh.js (1477 bytes)
  - dashboard-user-rental.js (28352 bytes)
  - dashboard-user-stats.js (2814 bytes)
  - dashboard-user-transactions.js (35098 bytes)
  - dashboard-user-utils.js (5297 bytes)

## NOTIFICATIONS related files (4):
  - favorite-notification-handler.js (3647 bytes)
  - user-notification-system.js (12592 bytes)
  - user-notifications-enhanced.js (13192 bytes)
  - user-notifications.js (17688 bytes)

## Function Duplications in JS Files:
  - **viewRentalDetails** in: admin-rental-requests.js, dashboard-user-history.js, dashboard-user-history.js, dashboard-user-inline-functions.js
  - **smoothScrollToSection** in: dashAdmin.js, dashAdmin.js
  - **loadRentalRequests** in: dashAdmin.js, dashboard-user-history.js
  - **getStatusBadgeClass** in: dashAdmin.js, dashboard-user-transactions.js
  - **showMockData** in: dashboard-user-assets-fix.js, dashboard-user-assets-interactive.js, dashboard-user-assets-mock.js
  - **displayAsetData** in: dashboard-user-assets-fix.js, dashboard-user-assets-interactive.js, dashboard-user-assets-mock.js
  - **formatCurrency** in: dashboard-user-assets-fix.js, dashboard-user-assets-interactive.js, dashboard-user-assets-mock.js, dashboard-user-utils.js, favorite-handler.js, visualization-enhanced-dummy.js
  - **loadAsetDataWithRetry** in: dashboard-user-assets-fix.js, dashboard-user-assets-interactive.js, dashboard-user-assets-mock.js, dashboard-user-assets-simple.js
  - **toggleFavorite** in: dashboard-user-assets-interactive.js, dashboard-user-assets-simple.js, dashboard-user-favorites.js, dashboard-user-inline-functions.js
  - **showAsetDetail** in: dashboard-user-assets-interactive.js, dashboard-user-assets-simple.js, dashboard-user-database.js, dashboard-user-inline-functions.js, dashboard-user-rental.js
  - **showRentalForm** in: dashboard-user-assets-interactive.js, dashboard-user-assets-simple.js, dashboard-user-database.js, dashboard-user-inline-functions.js, dashboard-user-rental.js
  - **submitRentalForm** in: dashboard-user-assets-interactive.js, dashboard-user-assets-simple.js
  - **showToast** in: dashboard-user-assets-interactive.js, dashboard-user-assets-simple.js
  - **updateTotalCost** in: dashboard-user-database.js, dashboard-user-rental.js
  - **handlePayment** in: dashboard-user-database.js, dashboard-user-rental.js
  - **handlePaymentSuccess** in: dashboard-user-database.js, dashboard-user-rental.js
  - **handlePaymentPending** in: dashboard-user-database.js, dashboard-user-rental.js
  - **handlePaymentError** in: dashboard-user-database.js, dashboard-user-rental.js
  - **submitRentalRequest** in: dashboard-user-database.js, dashboard-user-rental.js
  - **showConfirmationModal** in: dashboard-user-database.js, dashboard-user-rental.js
  - **showAlert** in: dashboard-user-database.js, dashboard-user-inline-functions.js, dashboard-user-rental.js
  - **showLoadingModal** in: dashboard-user-database.js, dashboard-user-rental.js
  - **hideLoadingModal** in: dashboard-user-database.js, dashboard-user-rental.js
  - **cancelRentalRequest** in: dashboard-user-history.js, dashboard-user-history.js, dashboard-user-inline-functions.js
  - **showError** in: dashboard-user-transactions.js, dashboard-user-utils.js
  - **executedFunction** in: notebook_analytics_integration.js, sewakan_aset_new.js, visualization.js

# RECOMMENDATIONS
==================================================
## High Priority Cleanups:

1. **Asset Management Functions**
   - Consolidate viewAssetDetail, editAsset, deleteAsset into single source
   - Remove duplicate implementations from HTML templates
   - Use only sewakan_aset_new.js or direct_asset_actions.js

2. **API Endpoints**
   - Standardize all to /rental/api/assets
   - Remove old /api/rental-assets endpoints
   - Remove /api/asset-detail endpoints

3. **JavaScript Files**
   - Merge similar dashboard-user-* files
   - Consolidate notification-related files
   - Remove unused modal files

4. **Template Duplications**
   - Move inline JavaScript to external files
   - Remove duplicate asset management functions from templates
   - Consolidate admin template scripts

## Medium Priority:

1. **Python Route Files**
   - Review routes_* files for overlapping functionality
   - Consolidate user-related route files
   - Review model files for duplicate methods

2. **CSS and Static Assets**
   - Audit for unused CSS files
   - Remove duplicate styling

## Implementation Plan:

1. Start with asset management - most critical
2. Standardize API endpoints
3. Consolidate JavaScript files
4. Clean up templates
5. Review Python files
