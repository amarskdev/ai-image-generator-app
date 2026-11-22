<?php

namespace App\Http\Controllers;

use App\Services\CreditAccountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CreditPurchaseController extends Controller
{
    public function __invoke(Request $request, CreditAccountService $creditAccount): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', Rule::in(['5', '10', '25'])],
        ]);

        $creditAccount->purchase(
            $request->user(),
            (int) $validated['amount'] * 1_000_000_000,
            (string) Str::uuid(),
        );

        return back()->with('success', '$'.$validated['amount'].' in demo credits was added to your balance.');
    }
}
