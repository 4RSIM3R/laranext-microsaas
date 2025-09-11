<?php 

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/user/index');
    }
}