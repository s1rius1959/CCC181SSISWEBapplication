# Backend Organization Script
Write-Host "Reorganizing Backend..." -ForegroundColor Cyan

# Move route files to routes folder
Move-Item -Path "Backend\authentication_routes.py" -Destination "Backend\routes\authentication_routes.py" -Force
Move-Item -Path "Backend\college_routes.py" -Destination "Backend\routes\college_routes.py" -Force
Move-Item -Path "Backend\program_routes.py" -Destination "Backend\routes\program_routes.py" -Force
Move-Item -Path "Backend\student_routes.py" -Destination "Backend\routes\student_routes.py" -Force

Write-Host "✓ Backend routes organized" -ForegroundColor Green

# Frontend Organization Script
Write-Host "`nReorganizing Frontend..." -ForegroundColor Cyan

# Move auth components
Move-Item -Path "Frontend\src\Login.js" -Destination "Frontend\src\components\auth\Login.js" -Force
Move-Item -Path "Frontend\src\Signup.js" -Destination "Frontend\src\components\auth\Signup.js" -Force
Move-Item -Path "Frontend\src\Authentication.js" -Destination "Frontend\src\components\auth\Authentication.js" -Force
Move-Item -Path "Frontend\src\ProtectedRoutes.js" -Destination "Frontend\src\components\auth\ProtectedRoutes.js" -Force

# Move college components
Move-Item -Path "Frontend\src\Colleges.js" -Destination "Frontend\src\components\colleges\Colleges.js" -Force
Move-Item -Path "Frontend\src\AddCollege.js" -Destination "Frontend\src\components\colleges\AddCollege.js" -Force

# Move program components
Move-Item -Path "Frontend\src\Programs.js" -Destination "Frontend\src\components\programs\Programs.js" -Force
Move-Item -Path "Frontend\src\AddProgram.js" -Destination "Frontend\src\components\programs\AddProgram.js" -Force

# Move student components
Move-Item -Path "Frontend\src\Students.js" -Destination "Frontend\src\components\students\Students.js" -Force
Move-Item -Path "Frontend\src\AddStudent.js" -Destination "Frontend\src\components\students\AddStudent.js" -Force
Move-Item -Path "Frontend\src\StudentImageUpload.js" -Destination "Frontend\src\components\students\StudentImageUpload.js" -Force

# Move profile components
Move-Item -Path "Frontend\src\Profile.js" -Destination "Frontend\src\components\profile\Profile.js" -Force
Move-Item -Path "Frontend\src\ProfileUpload.js" -Destination "Frontend\src\components\profile\ProfileUpload.js" -Force

# Move common/shared components
Move-Item -Path "Frontend\src\Sidebar.js" -Destination "Frontend\src\components\common\Sidebar.js" -Force
Move-Item -Path "Frontend\src\ActionButtons.js" -Destination "Frontend\src\components\common\ActionButtons.js" -Force
Move-Item -Path "Frontend\src\Notifications.js" -Destination "Frontend\src\components\common\Notifications.js" -Force
Move-Item -Path "Frontend\src\SearchFilter.js" -Destination "Frontend\src\components\common\SearchFilter.js" -Force
Move-Item -Path "Frontend\src\JumptoPage.js" -Destination "Frontend\src\components\common\JumptoPage.js" -Force
Move-Item -Path "Frontend\src\SortButtons.js" -Destination "Frontend\src\components\common\SortButtons.js" -Force

# Move styles
Move-Item -Path "Frontend\src\App.css" -Destination "Frontend\src\styles\App.css" -Force
Move-Item -Path "Frontend\src\Auth.css" -Destination "Frontend\src\styles\Auth.css" -Force
Move-Item -Path "Frontend\src\ProfileUpload.css" -Destination "Frontend\src\styles\ProfileUpload.css" -Force

# Move assets (rename assests to assets - fixing typo)
Move-Item -Path "Frontend\src\assests\*" -Destination "Frontend\src\assets\" -Force
Remove-Item -Path "Frontend\src\assests" -Recurse -Force

# Move config
Move-Item -Path "Frontend\src\supabaseClient.js" -Destination "Frontend\src\config\supabaseClient.js" -Force

Write-Host "✓ Frontend components organized" -ForegroundColor Green
Write-Host "`nOrganization complete! Now update import paths in:" -ForegroundColor Yellow
Write-Host "  - Backend\app.py" -ForegroundColor White
Write-Host "  - Frontend\src\App.js" -ForegroundColor White
Write-Host "  - All component files with updated imports" -ForegroundColor White
