<?php 

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AdminTransactionController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/transaction/index');
    }
}