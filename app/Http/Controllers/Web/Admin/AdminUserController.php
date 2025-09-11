<?php

namespace App\Http\Controllers\Web\Admin;

use App\Http\Controllers\Controller;
use App\Contract\Master\UserContract;
use App\Utils\WebResponse;
use Inertia\Inertia;

class AdminUserController extends Controller
{

    protected UserContract $service;

    public function __construct(UserContract $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        return Inertia::render('admin/user/index');
    }


    public function fetch()
    {
        $data = $this->service->all(
            filters: [],
            sorts: [],
            paginate: true,
            per_page: request()->get('per_page', 10)
        );
        return response()->json($data);
    }

    public function show($id)
    {
        $data = $this->service->find($id);
        return Inertia::render('admin/user/detail', [
            'user' => $data,
        ]);
    }
}
