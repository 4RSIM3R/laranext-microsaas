<?php

namespace App\Contract;

interface SubmissionContract extends BaseContract
{
    public function createSubmission($formId, array $data, array $metadata = []);
    public function getSubmissionsByForm($formId);
    public function getSubmissionStats($formId);
}