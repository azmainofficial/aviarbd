<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    // --- ADMIN ENDPOINTS ---

    public function adminIndex()
    {
        $conversations = Conversation::orderByDesc('last_message_at')->get();
        return response()->json(['conversations' => $conversations]);
    }

    public function adminShow($id)
    {
        $conversation = Conversation::findOrFail($id);
        $conversation->update(['unread_by_admin' => 0]);
        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    public function adminSendMessage(Request $request, $id)
    {
        $request->validate(['content' => 'required|string']);
        $conversation = Conversation::findOrFail($id);

        $message = $conversation->messages()->create([
            'content' => $request->input('content'),
            'sender' => 'admin',
        ]);

        $conversation->update([
            'last_message' => $request->input('content'),
            'last_message_at' => now(),
            'unread_by_customer' => $conversation->getAttribute('unread_by_customer') + 1,
        ]);

        return response()->json($message);
    }

    public function adminUpdateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:open,closed']);
        $conversation = Conversation::findOrFail($id);
        $conversation->update(['status' => $request->status]);

        return response()->json($conversation);
    }

    // --- FRONTEND CUSTOMER ENDPOINTS ---

    public function customerCheckSession(Request $request)
    {
        $sessionId = $request->query('sessionId');
        if (!$sessionId) {
            return response()->json(['conversation' => null]);
        }

        $conversation = Conversation::where('session_id', $sessionId)->first();
        return response()->json(['conversation' => $conversation]);
    }

    public function customerStartChat(Request $request)
    {
        $request->validate([
            'sessionId' => 'required|string',
            'customerName' => 'required|string',
        ]);

        $conversation = Conversation::firstOrCreate(
            ['session_id' => $request->sessionId],
            [
                'customer_name' => $request->customerName,
                'customer_email' => $request->customerEmail ?? null,
                'last_message_at' => now(),
            ]
        );

        return response()->json(['conversation' => $conversation]);
    }

    public function customerGetMessages($id)
    {
        $conversation = Conversation::findOrFail($id);
        $conversation->update(['unread_by_customer' => 0]);
        $messages = $conversation->messages()->orderBy('created_at', 'asc')->get();

        return response()->json(['messages' => $messages]);
    }

    public function customerSendMessage(Request $request, $id)
    {
        $request->validate(['content' => 'required|string']);
        $conversation = Conversation::findOrFail($id);

        $message = $conversation->messages()->create([
            'content' => $request->input('content'),
            'sender' => 'customer',
        ]);

        $conversation->update([
            'last_message' => $request->input('content'),
            'last_message_at' => now(),
            'unread_by_admin' => $conversation->getAttribute('unread_by_admin') + 1,
        ]);

        return response()->json($message);
    }
}
