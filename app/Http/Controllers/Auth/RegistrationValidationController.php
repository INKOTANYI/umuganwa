<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class RegistrationValidationController extends Controller
{
    public function unique(Request $request): JsonResponse
    {
        $email = (string) $request->query('email', '');
        $phone = (string) $request->query('phone', '');

        $emailTaken = false;
        $phoneTaken = false;

        if ($email !== '') {
            $emailTaken = User::where('email', $email)->exists();
        }

        if ($phone !== '') {
            $phoneTaken = User::where('phone', $phone)->exists();
        }

        return response()->json([
            'emailTaken' => $emailTaken,
            'phoneTaken' => $phoneTaken,
        ]);
    }
}
