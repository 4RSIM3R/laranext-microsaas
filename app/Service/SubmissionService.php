<?php

namespace App\Service;

use App\Contract\SubmissionContract;
use App\Models\Form;
use App\Models\Submission;
use App\Models\Page;
use App\Models\Field;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SubmissionService extends BaseService implements SubmissionContract
{
    protected string|null $guard = null;
    protected string|null $guardForeignKey = null;
    protected array $relation = ['form'];

    public function __construct(Submission $model)
    {
        $this->model = $model;
    }

    /**
     * Create a new submission with normalized field data
     *
     * @param int $formId
     * @param array $data
     * @param array $metadata
     * @return Submission|Exception
     */
    public function createSubmission($formId, array $data, array $metadata = [])
    {
        try {
            $form = Form::with(['pages.fields'])->findOrFail($formId);

            // Normalize submission data to include all possible fields
            $normalizedData = $this->normalizeSubmissionData($form, $data);

            // Prepare submission payload
            $payload = [
                'form_id' => $formId,
                'data' => $normalizedData,
                'submitted_at' => now(),
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'status' => 'completed',
            ];

            // Add any additional metadata
            if (!empty($metadata)) {
                $payload['data']['_metadata'] = $metadata;
            }

            DB::beginTransaction();
            $submission = $this->model->create($payload);
            DB::commit();

            return $submission->fresh(['form']);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Submission creation failed: ' . $e->getMessage(), [
                'form_id' => $formId,
                'data' => $data,
                'trace' => $e->getTraceAsString()
            ]);
            return $e;
        }
    }

    /**
     * Get all submissions for a specific form
     *
     * @param int $formId
     * @return array|Exception
     */
    public function getSubmissionsByForm($formId)
    {
        try {
            return $this->all(
                conditions: ['form_id' => $formId],
                sorts: ['submitted_at'],
                order_position: 'desc',
                paginate: true,
                relation: ['form']
            );
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * Get submission statistics for a form
     *
     * @param int $formId
     * @return array|Exception
     */
    public function getSubmissionStats($formId)
    {
        try {
            $stats = [
                'total_submissions' => $this->model->where('form_id', $formId)->count(),
                'recent_submissions' => $this->model->where('form_id', $formId)
                    ->where('submitted_at', '>=', now()->subDays(30))
                    ->count(),
                'completed_submissions' => $this->model->where('form_id', $formId)
                    ->where('status', 'completed')
                    ->count(),
                'average_completion_time' => null, // Could be calculated if tracking start time
            ];

            return $stats;
        } catch (Exception $e) {
            return $e;
        }
    }

    /**
     * Normalize submission data to include all possible form fields
     * Fields not reached by conditional logic will be set to null
     *
     * @param Form $form
     * @param array $submittedData
     * @return array
     */
    private function normalizeSubmissionData(Form $form, array $submittedData): array
    {
        $normalized = [];

        // Add all form fields with their values or null
        foreach ($form->pages as $page) {
            foreach ($page->fields as $field) {
                $fieldName = $field->name;

                if (isset($submittedData[$fieldName])) {
                    $normalized[$fieldName] = $submittedData[$fieldName];
                } else {
                    $normalized[$fieldName] = null;
                }
            }
        }

        // Preserve any additional data that might be important
        $normalized['_submitted_at'] = now()->toISOString();
        $normalized['_ip_address'] = request()->ip();
        $normalized['_user_agent'] = request()->userAgent();

        return $normalized;
    }
}