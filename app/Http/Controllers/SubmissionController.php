<?php

namespace App\Http\Controllers;

use App\Contract\SubmissionContract;
use App\Http\Requests\StoreSubmissionRequest;
use App\Http\Utils\WebResponse;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    protected SubmissionContract $service;

    public function __construct(SubmissionContract $service)
    {
        $this->service = $service;
    }

    /**
     * Submit a form
     */
    public function submit(StoreSubmissionRequest $request)
    {
        $result = $this->service->createSubmission(
            $request->form_id,
            $request->data,
            $request->metadata ?? []
        );

        if ($result instanceof \Exception) {
            return WebResponse::error(
                'Failed to submit form: ' . $result->getMessage(),
                null,
                500
            );
        }

        return WebResponse::success([
            'submission_id' => $result->id,
            'form_id' => $result->form_id,
            'submitted_at' => $result->submitted_at,
            'status' => $result->status,
        ], 'Form submitted successfully', 201);
    }

    /**
     * Get submissions for a specific form (for admin users)
     */
    public function getByForm(Request $request, $formId)
    {
        // TODO: Add authentication and authorization checks
        $result = $this->service->getSubmissionsByForm($formId);

        if ($result instanceof \Exception) {
            return WebResponse::error(
                'Failed to fetch submissions: ' . $result->getMessage(),
                null,
                500
            );
        }

        return WebResponse::success($result, 'Submissions retrieved successfully');
    }

    /**
     * Get submission statistics for a form (for admin users)
     */
    public function getStats($formId)
    {
        // TODO: Add authentication and authorization checks
        $result = $this->service->getSubmissionStats($formId);

        if ($result instanceof \Exception) {
            return WebResponse::error(
                'Failed to fetch submission stats: ' . $result->getMessage(),
                null,
                500
            );
        }

        return WebResponse::success($result, 'Submission statistics retrieved successfully');
    }
}