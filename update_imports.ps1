# Update Import Paths Script
Write-Host "Updating import paths in all files..." -ForegroundColor Cyan

# Update Backend app.py
Write-Host "`nUpdating Backend/app.py..." -ForegroundColor Yellow
$appPy = Get-Content "Backend\app.py" -Raw
$appPy = $appPy -replace 'from student_routes import', 'from routes.student_routes import'
$appPy = $appPy -replace 'from college_routes import', 'from routes.college_routes import'
$appPy = $appPy -replace 'from program_routes import', 'from routes.program_routes import'
$appPy = $appPy -replace 'from authentication_routes import', 'from routes.authentication_routes import'
$appPy | Set-Content "Backend\app.py" -NoNewline

# Update Frontend App.js
Write-Host "Updating Frontend/src/App.js..." -ForegroundColor Yellow
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

# Update Auth components
Write-Host "Updating auth components..." -ForegroundColor Yellow
(Get-Content "Frontend\src\components\auth\Login.js" -Raw) -replace '"\./Auth\.css"', '"../../styles/Auth.css"' | Set-Content "Frontend\src\components\auth\Login.js" -NoNewline
(Get-Content "Frontend\src\components\auth\Signup.js" -Raw) -replace '"\./Auth\.css"', '"../../styles/Auth.css"' | Set-Content "Frontend\src\components\auth\Signup.js" -NoNewline

# Update College components
Write-Host "Updating college components..." -ForegroundColor Yellow
$colleges = Get-Content "Frontend\src\components\colleges\Colleges.js" -Raw
$colleges = $colleges -replace 'from "\./ActionButtons"', 'from "../common/ActionButtons"'
$colleges = $colleges -replace 'from "\./AddCollege"', 'from "./AddCollege"'
$colleges = $colleges -replace 'from "\./Notifications"', 'from "../common/Notifications"'
$colleges = $colleges -replace 'from "\./SearchFilter"', 'from "../common/SearchFilter"'
$colleges = $colleges -replace 'from "\./JumptoPage"', 'from "../common/JumptoPage"'
$colleges | Set-Content "Frontend\src\components\colleges\Colleges.js" -NoNewline

# Update Program components
Write-Host "Updating program components..." -ForegroundColor Yellow
$programs = Get-Content "Frontend\src\components\programs\Programs.js" -Raw
$programs = $programs -replace 'from "\./ActionButtons"', 'from "../common/ActionButtons"'
$programs = $programs -replace 'from "\./AddProgram"', 'from "./AddProgram"'
$programs = $programs -replace 'from "\./Notifications"', 'from "../common/Notifications"'
$programs = $programs -replace 'from "\./SearchFilter"', 'from "../common/SearchFilter"'
$programs = $programs -replace 'from "\./JumptoPage"', 'from "../common/JumptoPage"'
$programs | Set-Content "Frontend\src\components\programs\Programs.js" -NoNewline

# Update Student components
Write-Host "Updating student components..." -ForegroundColor Yellow
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

# Update Profile components
Write-Host "Updating profile components..." -ForegroundColor Yellow
(Get-Content "Frontend\src\components\profile\Profile.js" -Raw) -replace 'from "\./ProfileUpload"', 'from "./ProfileUpload"' | Set-Content "Frontend\src\components\profile\Profile.js" -NoNewline

$profUpload = Get-Content "Frontend\src\components\profile\ProfileUpload.js" -Raw
$profUpload = $profUpload -replace 'from "\./supabaseClient"', 'from "../../config/supabaseClient"'
$profUpload = $profUpload -replace '"\./ProfileUpload\.css"', '"../../styles/ProfileUpload.css"'
$profUpload | Set-Content "Frontend\src\components\profile\ProfileUpload.js" -NoNewline

# Update Sidebar (assets path)
Write-Host "Updating sidebar assets path..." -ForegroundColor Yellow
$sidebar = Get-Content "Frontend\src\components\common\Sidebar.js" -Raw
$sidebar = $sidebar -replace 'from "\./assests/', 'from "../../assets/'
$sidebar | Set-Content "Frontend\src\components\common\Sidebar.js" -NoNewline

# Update ActionButtons
Write-Host "Updating ActionButtons..." -ForegroundColor Yellow
(Get-Content "Frontend\src\components\common\ActionButtons.js" -Raw) -replace 'from "\./StudentImageUpload"', 'from "../students/StudentImageUpload"' | Set-Content "Frontend\src\components\common\ActionButtons.js" -NoNewline

Write-Host "`n✓ All import paths updated successfully!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Test backend: cd Backend; python app.py" -ForegroundColor White
Write-Host "2. Test frontend: cd Frontend; npm start" -ForegroundColor White
Write-Host "3. Verify all features work correctly" -ForegroundColor White
