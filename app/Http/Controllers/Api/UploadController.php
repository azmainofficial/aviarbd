<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    /**
     * Upload a product image directly to public/uploads/products/.
     * No storage symlink required — files are immediately web-accessible.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,webp,gif|max:5120', // 5 MB max
        ]);

        $file = $request->file('image');

        // Generate a unique filename preserving the original extension
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();

        // Move directly into public/uploads/products/
        $file->move(public_path('uploads/products'), $filename);

        // The URL that the browser / Next.js frontend can use directly
        $url = '/uploads/products/' . $filename;

        return response()->json([
            'url'      => $url,
            'filename' => $filename,
        ], 201);
    }

    /**
     * Delete an uploaded image from public/uploads/products/.
     */
    public function destroy(Request $request)
    {
        $request->validate(['url' => 'required|string']);

        $url      = $request->input('url');
        $filename = basename($url);
        $path     = public_path('uploads/products/' . $filename);

        if (file_exists($path)) {
            unlink($path);
            return response()->json(['message' => 'Deleted successfully']);
        }

        return response()->json(['message' => 'File not found'], 404);
    }
}
