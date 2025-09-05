<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EmailVerificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public string $verificationUrl;
    public string $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(string $verificationUrl, string $userName = '')
    {
        $this->verificationUrl = $verificationUrl;
        $this->userName = $userName;
    }

    /**
     * Build the message.
     */
    public function build(): self
    {
        return $this->subject('Verify Your Email Address')
            ->view('mail.email-verification')
            ->with([
                'verificationUrl' => $this->verificationUrl,
                'userName' => $this->userName,
            ]);
    }
}
