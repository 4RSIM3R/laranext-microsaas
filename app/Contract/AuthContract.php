<?php

namespace App\Contract;

interface AuthContract
{
    public function login(array $payloads);
    public function register(array $payloads, $role = []);
    public function logout();
    public function update($id, array $payloads, $role = []);
    public function send_otp(array $payloads);
    public function validate_otp(array $payloads);
    public function reset_password(array $payloads);
    public function send_reset_link(array $payloads);
    public function send_email_verification(array $payloads);
    public function verify_email(array $payloads);
}
