<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminPasswordResetToken extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'admin_password_reset_tokens';

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'email';

    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'email',
        'token',
        'created_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Get the admin that owns this password reset token.
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'email', 'email');
    }

    /**
     * Check if the token is expired.
     *
     * @param int $expirationMinutes
     * @return bool
     */
    public function isExpired(int $expirationMinutes = 60): bool
    {
        return $this->created_at->addMinutes($expirationMinutes)->isPast();
    }
}
