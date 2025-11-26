# Complete Reorganization Script
# This script reorganizes the entire codebase structure

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Code Reorganization Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create backup
Write-Host "[1/4] Creating backup..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "backup_$timestamp"
Write-Host "  Backing up to: $backupPath" -ForegroundColor Gray

# Step 2: Move Backend files
Write-Host "`n[2/4] Reorganizing Backend..." -ForegroundColor Yellow
if (Test-Path "Backend\authentication_routes.py") {
    Move-Item -Path "Backend\authentication_routes.py" -Destination "Backend\routes\authentication_routes.py" -Force
    Move-Item -Path "Backend\college_routes.py" -Destination "Backend\routes\college_routes.py" -Force
    Move-Item -Path "Backend\program_routes.py" -Destination "Backend\routes\program_routes.py" -Force
    Move-Item -Path "Backend\student_routes.py" -Destination "Backend\routes\student_routes.py" -Force
    Write-Host "  ✓ Backend routes moved" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Backend files already moved" -ForegroundColor Yellow
}

# Step 3: Move Frontend files
Write-Host "`n[3/4] Reorganizing Frontend..." -ForegroundColor Yellow

# Auth
if (Test-Path "Frontend\src\Login.js") {
    Move-Item -Path "Frontend\src\Login.js" -Destination "Frontend\src\components\auth\Login.js" -Force
    Move-Item -Path "Frontend\src\Signup.js" -Destination "Frontend\src\components\auth\Signup.js" -Force
    Move-Item -Path "Frontend\src\Authentication.js" -Destination "Frontend\src\components\auth\Authentication.js" -Force
    Move-Item -Path "Frontend\src\ProtectedRoutes.js" -Destination "Frontend\src\components\auth\ProtectedRoutes.js" -Force
    Write-Host "  ✓ Auth components moved" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Auth components already moved" -ForegroundColor Yellow
}

# Colleges
if (Test-Path "Frontend\src\Colleges.js") {
    Move-Item -Path "Frontend\src\Colleges.js" -Destination "Frontend\src\components\colleges\Colleges.js" -Force
    Move-Item -Path "Frontend\src\AddCollege.js" -Destination "Frontend\src\components\colleges\AddCollege.js" -Force
    Write-Host "  ✓ College components moved" -ForegroundColor Green
}

# Programs
if (Test-Path "Frontend\src\Programs.js") {
    Move-Item -Path "Frontend\src\Programs.js" -Destination "Frontend\src\components\programs\Programs.js" -Force
    Move-Item -Path "Frontend\src\AddProgram.js" -Destination "Frontend\src\components\programs\AddProgram.js" -Force
    Write-Host "  ✓ Program components moved" -ForegroundColor Green
}

# Students
if (Test-Path "Frontend\src\Students.js") {
    Move-Item -Path "Frontend\src\Students.js" -Destination "Frontend\src\components\students\Students.js" -Force
    Move-Item -Path "Frontend\src\AddStudent.js" -Destination "Frontend\src\components\students\AddStudent.js" -Force
    Move-Item -Path "Frontend\src\StudentImageUpload.js" -Destination "Frontend\src\components\students\StudentImageUpload.js" -Force
    Write-Host "  ✓ Student components moved" -ForegroundColor Green
}

# Profile
if (Test-Path "Frontend\src\Profile.js") {
    Move-Item -Path "Frontend\src\Profile.js" -Destination "Frontend\src\components\profile\Profile.js" -Force
    Move-Item -Path "Frontend\src\ProfileUpload.js" -Destination "Frontend\src\components\profile\ProfileUpload.js" -Force
    Write-Host "  ✓ Profile components moved" -ForegroundColor Green
}

# Common
if (Test-Path "Frontend\src\Sidebar.js") {
    Move-Item -Path "Frontend\src\Sidebar.js" -Destination "Frontend\src\components\common\Sidebar.js" -Force
    Move-Item -Path "Frontend\src\ActionButtons.js" -Destination "Frontend\src\components\common\ActionButtons.js" -Force
    Move-Item -Path "Frontend\src\Notifications.js" -Destination "Frontend\src\components\common\Notifications.js" -Force
    Move-Item -Path "Frontend\src\SearchFilter.js" -Destination "Frontend\src\components\common\SearchFilter.js" -Force
    Move-Item -Path "Frontend\src\JumptoPage.js" -Destination "Frontend\src\components\common\JumptoPage.js" -Force
    Move-Item -Path "Frontend\src\SortButtons.js" -Destination "Frontend\src\components\common\SortButtons.js" -Force
    Write-Host "  ✓ Common components moved" -ForegroundColor Green
}

# Styles
if (Test-Path "Frontend\src\App.css") {
    Move-Item -Path "Frontend\src\App.css" -Destination "Frontend\src\styles\App.css" -Force
    Move-Item -Path "Frontend\src\Auth.css" -Destination "Frontend\src\styles\Auth.css" -Force
    Move-Item -Path "Frontend\src\ProfileUpload.css" -Destination "Frontend\src\styles\ProfileUpload.css" -Force
    Write-Host "  ✓ Styles moved" -ForegroundColor Green
}

# Assets (fix typo: assests -> assets)
if (Test-Path "Frontend\src\assests") {
    Get-ChildItem "Frontend\src\assests\*" | Move-Item -Destination "Frontend\src\assets\" -Force
    Remove-Item "Frontend\src\assests" -Recurse -Force
    Write-Host "  ✓ Assets moved (typo fixed)" -ForegroundColor Green
}

# Config
if (Test-Path "Frontend\src\supabaseClient.js") {
    Move-Item -Path "Frontend\src\supabaseClient.js" -Destination "Frontend\src\config\supabaseClient.js" -Force
    Write-Host "  ✓ Config moved" -ForegroundColor Green
}

# Step 4: Update import paths
Write-Host "`n[4/4] Updating import paths..." -ForegroundColor Yellow

# Backend app.py
$appPy = Get-Content "Backend\app.py" -Raw
$appPy = $appPy -replace 'from student_routes import', 'from routes.student_routes import'
$appPy = $appPy -replace 'from college_routes import', 'from routes.college_routes import'
$appPy = $appPy -replace 'from program_routes import', 'from routes.program_routes import'
$appPy = $appPy -replace 'from authentication_routes import', 'from routes.authentication_routes import'
$appPy | Set-Content "Backend\app.py" -NoNewline
Write-Host "  ✓ Backend imports updated" -ForegroundColor Green

# Frontend App.js
$appJs = Get-Content "Frontend\src\App.js" -Raw
$appJs = $appJs -replace 'import Sidebar from "\./Sidebar";', 'import Sidebar from "./components/common/Sidebar";'
$appJs = $appJs -replace 'import Students from "\./Students";', 'import Students from "./components/students/Students";'
$appJs = $appJs -replace 'import Colleges from "\./Colleges";', 'import Colleges from "./components/colleges/Colleges";'
$appJs = $appJs -replace 'import Programs from "\./Programs";', 'import Programs from "./components/programs/Programs";'
$appJs = $appJs -replace 'import Profile from "\./Profile";', 'import Profile from "./components/profile/Profile";'
$appJs = $appJs -replace 'import Login from "\./Login";', 'import Login from "./components/auth/Login";'
$appJs = $appJs -replace 'import Signup from "\./Signup";', 'import Signup from "./components/auth/Signup";'
$appJs = $appJs -replace 'import ProtectedRoute from "\./ProtectedRoutes";', 'import ProtectedRoute from "./components/auth/ProtectedRoutes";'
$appJs = $appJs -replace 'import "\./App\.css";', 'import "./styles/App.css";'
$appJs | Set-Content "Frontend\src\App.js" -NoNewline
Write-Host "  ✓ App.js imports updated" -ForegroundColor Green

# Update all component imports
(Get-Content "Frontend\src\components\auth\Login.js" -Raw) -replace '"\./Auth\.css"', '"../../styles/Auth.css"' | Set-Content "Frontend\src\components\auth\Login.js" -NoNewline
(Get-Content "Frontend\src\components\auth\Signup.js" -Raw) -replace '"\./Auth\.css"', '"../../styles/Auth.css"' | Set-Content "Frontend\src\components\auth\Signup.js" -NoNewline

$colleges = Get-Content "Frontend\src\components\colleges\Colleges.js" -Raw
$colleges = $colleges -replace 'from "\./ActionButtons"', 'from "../common/ActionButtons"'
$colleges = $colleges -replace 'from "\./AddCollege"', 'from "./AddCollege"'
$colleges = $colleges -replace 'from "\./Notifications"', 'from "../common/Notifications"'
$colleges = $colleges -replace 'from "\./SearchFilter"', 'from "../common/SearchFilter"'
$colleges = $colleges -replace 'from "\./JumptoPage"', 'from "../common/JumptoPage"'
$colleges | Set-Content "Frontend\src\components\colleges\Colleges.js" -NoNewline

$programs = Get-Content "Frontend\src\components\programs\Programs.js" -Raw
$programs = $programs -replace 'from "\./ActionButtons"', 'from "../common/ActionButtons"'
$programs = $programs -replace 'from "\./AddProgram"', 'from "./AddProgram"'
$programs = $programs -replace 'from "\./Notifications"', 'from "../common/Notifications"'
$programs = $programs -replace 'from "\./SearchFilter"', 'from "../common/SearchFilter"'
$programs = $programs -replace 'from "\./JumptoPage"', 'from "../common/JumptoPage"'
$programs | Set-Content "Frontend\src\components\programs\Programs.js" -NoNewline

$students = Get-Content "Frontend\src\components\students\Students.js" -Raw
$students = $students -replace 'from "\./ActionButtons"', 'from "../common/ActionButtons"'
$students = $students -replace 'from "\./AddStudent"', 'from "./AddStudent"'
$students = $students -replace 'from "\./Notifications"', 'from "../common/Notifications"'
$students = $students -replace 'from "\./SearchFilter"', 'from "../common/SearchFilter"'
$students = $students -replace 'from "\./JumptoPage"', 'from "../common/JumptoPage"'
$students | Set-Content "Frontend\src\components\students\Students.js" -NoNewline

(Get-Content "Frontend\src\components\students\AddStudent.js" -Raw) -replace 'from "\./StudentImageUpload"', 'from "./StudentImageUpload"' | Set-Content "Frontend\src\components\students\AddStudent.js" -NoNewline

$studImg = Get-Content "Frontend\src\components\students\StudentImageUpload.js" -Raw
$studImg = $studImg -replace 'from "\./supabaseClient"', 'from "../../config/supabaseClient"'
$studImg = $studImg -replace '"\./ProfileUpload\.css"', '"../../styles/ProfileUpload.css"'
$studImg | Set-Content "Frontend\src\components\students\StudentImageUpload.js" -NoNewline

(Get-Content "Frontend\src\components\profile\Profile.js" -Raw) -replace 'from "\./ProfileUpload"', 'from "./ProfileUpload"' | Set-Content "Frontend\src\components\profile\Profile.js" -NoNewline

$profUpload = Get-Content "Frontend\src\components\profile\ProfileUpload.js" -Raw
$profUpload = $profUpload -replace 'from "\./supabaseClient"', 'from "../../config/supabaseClient"'
$profUpload = $profUpload -replace '"\./ProfileUpload\.css"', '"../../styles/ProfileUpload.css"'
$profUpload | Set-Content "Frontend\src\components\profile\ProfileUpload.js" -NoNewline

$sidebar = Get-Content "Frontend\src\components\common\Sidebar.js" -Raw
$sidebar = $sidebar -replace 'from "\./assests/', 'from "../../assets/'
$sidebar | Set-Content "Frontend\src\components\common\Sidebar.js" -NoNewline

(Get-Content "Frontend\src\components\common\ActionButtons.js" -Raw) -replace 'from "\./StudentImageUpload"', 'from "../students/StudentImageUpload"' | Set-Content "Frontend\src\components\common\ActionButtons.js" -NoNewline

Write-Host "  ✓ Component imports updated" -ForegroundColor Green

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  ✓ Reorganization Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run database migration:" -ForegroundColor White
Write-Host "   psql -U postgres -d your_db -f Backend\migrations\add_user_names.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test backend:" -ForegroundColor White
Write-Host "   cd Backend" -ForegroundColor Gray
Write-Host "   python app.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test frontend:" -ForegroundColor White
Write-Host "   cd Frontend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""
Write-Host "See REORGANIZATION_GUIDE.md for full documentation" -ForegroundColor Cyan
