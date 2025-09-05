<?php 

namespace App\Http\Controllers\Web\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class UserDashboardController extends Controller {
    
    public function index()
    {
        return Inertia::render('user/dashboard/index');
    }

}